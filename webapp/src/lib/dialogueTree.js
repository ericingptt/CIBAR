import { useEffect, useMemo, useRef, useState } from 'react';

// Generic branching-chat engine shared by scenario02's DatingChat and
// PrivateChat. Both need more than useTypedMessages' flat script or
// LineTeacher's one-off A/B split: multi-round choices, video-watch gates,
// and non-blocking tip acks, all chained through explicit `next` node ids.
//
// Node shapes (all optional fields besides `id`):
//   { id, from: 'emily'|'user'|'system', text, wait, typingWait, next }
//   { id, divider: 'Day 3', wait, next }
//   { id, tip: 'text', next }
//   { id, video: { videoId, duration, lines: [...] }, next }
//   { id, choice: true, options: [{ label, userText, reply, replyWait, typingWait, next }] }
//   { id, end: true }
export function useDialogueTree(nodes, startId, { startDelay = 0 } = {}) {
  const nodesById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const [timeline, setTimeline] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingChoice, setPendingChoice] = useState(null);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [pendingTip, setPendingTip] = useState(null);
  const [watchedVideoIds, setWatchedVideoIds] = useState(() => new Set());
  const [done, setDone] = useState(false);
  const [endReason, setEndReason] = useState(null);
  const startedRef = useRef(false);
  const timeoutsRef = useRef([]);

  function schedule(fn, ms) {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  }

  function push(item) {
    setTimeline((prev) => [...prev, item]);
  }

  function advance(id) {
    const node = nodesById[id];
    if (!node || node.end) {
      setDone(true);
      if (node?.reason) setEndReason(node.reason);
      return;
    }
    if (node.divider) {
      push({ kind: 'divider', label: node.divider });
      schedule(() => advance(node.next), node.wait ?? 700);
      return;
    }
    if (node.tip) {
      const tip = typeof node.tip === 'string' ? { text: node.tip } : node.tip;
      push({ kind: 'tip', text: tip.text, detail: tip.detail, key: node.id });
      setPendingTip({ next: node.next, key: node.id });
      return;
    }
    if (node.custom) {
      push({ kind: node.custom.kind, ...node.custom, key: node.id });
      schedule(() => advance(node.next), node.wait ?? 1400);
      return;
    }
    if (node.video) {
      push({ kind: 'video', ...node.video, key: node.id });
      setPendingVideo({ next: node.next, videoId: node.video.videoId });
      return;
    }
    if (node.choice) {
      setPendingChoice({ options: node.options });
      return;
    }
    const isEmily = (node.from ?? 'emily') === 'emily';
    if (isEmily) {
      setIsTyping(true);
      schedule(() => {
        setIsTyping(false);
        push({ kind: 'msg', from: 'emily', text: node.text });
        schedule(() => advance(node.next), node.wait ?? 1700);
      }, node.typingWait ?? 900);
    } else {
      push({ kind: 'msg', from: node.from, text: node.text });
      schedule(() => advance(node.next), node.wait ?? (node.from === 'system' ? 800 : 1200));
    }
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    schedule(() => advance(startId), startDelay);
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(index) {
    if (!pendingChoice) return;
    const opt = pendingChoice.options[index];
    setPendingChoice(null);
    push({ kind: 'msg', from: 'user', text: opt.userText ?? opt.label });
    if (opt.reply) {
      schedule(() => {
        setIsTyping(true);
        schedule(() => {
          setIsTyping(false);
          push({ kind: 'msg', from: 'emily', text: opt.reply });
          schedule(() => advance(opt.next), opt.replyWait ?? 1500);
        }, opt.typingWait ?? 900);
      }, 500);
    } else {
      schedule(() => advance(opt.next), 500);
    }
  }

  function completeVideo() {
    if (!pendingVideo) return;
    const { next, videoId } = pendingVideo;
    setWatchedVideoIds((prev) => new Set(prev).add(videoId));
    setPendingVideo(null);
    schedule(() => advance(next), 500);
  }

  function completeTip() {
    if (!pendingTip) return;
    const { next } = pendingTip;
    setPendingTip(null);
    schedule(() => advance(next), 300);
  }

  return {
    timeline,
    isTyping,
    pendingChoice,
    choose,
    pendingVideo,
    completeVideo,
    pendingTip,
    completeTip,
    watchedVideoIds,
    done,
    endReason,
  };
}
