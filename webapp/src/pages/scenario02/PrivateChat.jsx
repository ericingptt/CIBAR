import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Phone, Menu, Play, ZoomIn, X, ExternalLink } from 'lucide-react';
import { useDialogueTree } from '../../lib/dialogueTree';
import {
  useSaveScenario02Progress,
  savePrivateChatCheckpoint,
  takePrivateChatCheckpoint,
} from '../../lib/scenario02Store';
import { useStageClassName } from '../../shell/StageClassContext';
import { ProfileAvatar } from './components/ProfileAvatar';
import { SafetyAlert } from './components/SafetyAlert';
import { SuggestedReplies } from './tanu/SuggestedReplies';

const VIDEO_BASE = `${import.meta.env.BASE_URL}assets/scenarios/scenario-02/videos/`;
const VIDEO_SRC = {
  v1: `${VIDEO_BASE}emily-video-010.mp4`,
  v2: `${VIDEO_BASE}emily-video-020.mp4`,
  v3: `${VIDEO_BASE}emily-video-030.mp4`,
};

const EMILY_PHOTO = `${import.meta.env.BASE_URL}assets/scenarios/scenario-02/images/profiles/emily.webp`;

// "Day N" node labels stay as internal ids (other nodes reference them via
// `next`) - only the displayed text is converted to a plausible in-month
// date, per the "this must look like LINE, not a game" note. Offsets are
// real day-gaps from the original Day 1/3/5/7/10/12/15 spacing.
const DAY_OFFSETS = { 'Day 1': 0, 'Day 3': 2, 'Day 5': 4, 'Day 7': 6, 'Day 10': 9, 'Day 12': 11, 'Day 15': 14 };
const DIVIDER_BASE_DATE = new Date(2026, 6, 10); // 2026-07-10
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

function formatDivider(label) {
  const offset = DAY_OFFSETS[label] ?? 0;
  const d = new Date(DIVIDER_BASE_DATE);
  d.setDate(d.getDate() + offset);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`;
}

const NODES = [
  { id: 'join-sys', from: 'system', text: '你已加入 Emily 為好友', wait: 800, next: 'join-emily1' },
  { id: 'join-emily1', from: 'emily', text: '加到了～是你沒錯吧😂', next: 'join-choice' },
  {
    id: 'join-choice',
    choice: true,
    options: [
      { label: '妳動作很快耶', reply: '是我叫你加的啊，當然要趕快出現。\n不然你被別人聊走怎麼辦。', next: 'day1-divider' },
      { label: '對啦，是我', reply: '好，是你就好。\n還好沒加錯，不然我會有點失望。', next: 'day1-divider' },
      { label: '所以妳是怕我跑掉嗎？', reply: '對啊。\n你好不容易被我找到，哪有那麼容易讓你跑。', next: 'day1-divider' },
    ],
  },

  { id: 'day1-divider', divider: 'Day 1', next: 'day1-r1-ask' },
  { id: 'day1-r1-ask', from: 'emily', text: '你等等還要忙嗎？', next: 'day1-r1-choice' },
  {
    id: 'day1-r1-choice',
    choice: true,
    options: [
      { label: '還有一點工作', reply: '好吧，那你先忙。\n但忙完第一個要回我，說好了。', next: 'day1-r2-ask' },
      { label: '已經下班了', reply: '那剛好。\n今晚先把你借給我一下。', next: 'day1-r2-ask' },
      { label: '妳找我，我就不忙', reply: '你不要這樣講。\n我等等真的會捨不得讓你去忙。', next: 'day1-r2-ask' },
    ],
  },
  { id: 'day1-r2-ask', from: 'emily', text: '你每天都忙到這麼晚嗎？平常都幾點睡？', next: 'day1-r2-choice' },
  {
    id: 'day1-r2-choice',
    choice: true,
    options: [
      { label: '十一點左右', reply: '那差不多。\n搞不好以後可以一起說晚安。', next: 'day1-r3-ask' },
      { label: '常常很晚', reply: '那今天我來負責叫你去睡。\n免得你又撐到太晚。', next: 'day1-r3-ask' },
      { label: '看有沒有人陪我聊天', reply: '所以你是在暗示我陪你到睡著嗎？', next: 'day1-r3-ask' },
    ],
  },
  { id: 'day1-r3-ask', from: 'emily', text: '那你今天應該還不會這麼早睡吧？', next: 'day1-r3-choice' },
  {
    id: 'day1-r3-choice',
    choice: true,
    options: [
      { label: '應該不會', reply: '好，那你不可以聊一聊突然睡著喔。', next: 'day1-converge1' },
      { label: '看妳想聊多久', reply: '那你今晚可能要晚一點睡了。\n因為我還不想這麼快放你走。', next: 'day1-converge1' },
      { label: '本來想睡了，現在不一定', reply: '所以是因為我，你突然不想睡了嗎？', next: 'day1-converge1' },
    ],
  },
  { id: 'day1-converge1', from: 'emily', text: '反正不可以突然消失，先說好。', next: 'day1-user-promise' },
  { id: 'day1-user-promise', from: 'user', text: '不會啦。', next: 'day1-converge2' },
  { id: 'day1-converge2', from: 'emily', text: '你自己答應的喔。', next: 'day3-divider' },

  { id: 'day3-divider', divider: 'Day 3', next: 'day3-ask1' },
  { id: 'day3-ask1', from: 'emily', text: '你昨天晚上是不是聊到一半睡著了？', next: 'day3-ask2' },
  { id: 'day3-ask2', from: 'emily', text: '是誰還答應我不會突然消失的🙄', next: 'day3-choice' },
  {
    id: 'day3-choice',
    choice: true,
    options: [
      { label: '不小心睡著了啦', reply: '我就知道。\n害我還抱著手機等了一下。', next: 'day3-converge1' },
      { label: '妳有在等我喔？', reply: '不然咧？\n我還真的一直在看你有沒有回。', next: 'day3-converge1' },
      { label: '因為跟妳聊天太放鬆了', reply: '好吧，這個理由有哄到我。\n但下次要讓我知道，你是想著我睡著的。', next: 'day3-converge1' },
    ],
  },
  { id: 'day3-converge1', from: 'emily', text: '好啦，先原諒你一次。', next: 'day3-converge2' },
  { id: 'day3-converge2', from: 'emily', text: '不過我昨天本來有一小段想傳給你，結果某人先睡著了。', next: 'day3-video' },
  { id: 'day3-video', video: { videoId: 'v1', duration: '0:15' }, next: 'day3-post-choice' },
  {
    id: 'day3-post-choice',
    choice: true,
    options: [
      { label: '所以妳昨天真的在等我？', reply: '有啊。\n我還想說你是不是故意讓我想你。', next: 'day5-divider' },
      { label: '我下次睡著前一定先說', reply: '好，我記住了。\n下次你又突然消失，我真的會生氣喔。', next: 'day5-divider' },
      { label: '妳這樣我真的會誤會', reply: '那你就誤會啊。\n我又沒有說不可以。', next: 'day5-divider' },
    ],
  },

  { id: 'day5-divider', divider: 'Day 5', next: 'day5-greet-ask' },
  { id: 'day5-greet-ask', from: 'emily', text: '早安～今天工作加油。', next: 'day5-greet-choice' },
  {
    id: 'day5-greet-choice',
    choice: true,
    options: [
      { label: '早安，妳也是', reply: '你也是。\n今天第一個跟你說早安的人是我嗎？', next: 'day5-converge' },
      { label: '這麼早就想到我？', reply: '對啊。\n我現在好像一醒來就會先看你有沒有傳訊息。', next: 'day5-converge' },
      { label: '有妳加油，今天應該會很順', reply: '那我是不是應該每天都跟你說早安？', next: 'day5-converge' },
    ],
  },
  { id: 'day5-converge', from: 'emily', text: '昨天沒有再聊到一半消失，表現不錯。', next: 'day5-breakfast-ask' },
  { id: 'day5-breakfast-ask', from: 'emily', text: '今天有吃早餐嗎？', next: 'day5-breakfast-choice' },
  {
    id: 'day5-breakfast-choice',
    choice: true,
    options: [
      { label: '有，我有乖乖吃', reply: '很乖。\n看來我說的話，你還真的會聽。', next: 'day5-noon-time' },
      { label: '還沒', reply: '不行，先去吃。\n不然我會一直惦記你到底有沒有吃東西。', next: 'day5-noon-time' },
      { label: '等妳提醒我', reply: '可以啊。\n那你以後每天早上都要先來找我。', next: 'day5-noon-time' },
    ],
  },
  { id: 'day5-noon-time', from: 'system', text: '12:24', wait: 500, next: 'day5-lunch-ask' },
  { id: 'day5-lunch-ask', from: 'emily', text: '吃午餐了嗎？', next: 'day5-lunch-choice' },
  {
    id: 'day5-lunch-choice',
    choice: true,
    options: [
      { label: '正在吃', reply: '吃什麼？拍給我看。\n我要檢查你有沒有好好吃飯。', next: 'day7-divider' },
      { label: '還沒', reply: '你真的很不會照顧自己。\n看來以後要有人管你才行。', next: 'day7-divider' },
      { label: '等妳約我', reply: '那你最好不要只是嘴上說說。\n我真的約你，你要出現喔。', next: 'day7-divider' },
    ],
  },

  { id: 'day7-divider', divider: 'Day 7', next: 'day7-pre' },
  { id: 'day7-pre', from: 'emily', text: '終於下班了……', next: 'day7-pre2' },
  { id: 'day7-pre2', from: 'emily', text: '剛剛下班前偷錄了一小段給你。', next: 'day7-video' },
  { id: 'day7-video', video: { videoId: 'v2', duration: '0:15' }, next: 'day7-post-choice' },
  {
    id: 'day7-post-choice',
    choice: true,
    options: [
      { label: '看到妳，我心情也變好了', reply: '那我以後是不是要常常讓你看到我？', next: 'day7-meet-ask' },
      { label: '妳看起來真的很累', reply: '有一點。\n可是看到你回我，好像就沒那麼累了。', next: 'day7-meet-ask' },
      { label: '下班還特別拍給我喔？', reply: '對啊。\n不然你以為我下班第一個想到的是誰？', next: 'day7-meet-ask' },
    ],
  },
  { id: 'day7-meet-ask', from: 'emily', text: '我們現在這麼會聊，真的見面的時候，你會不會反而只顧著看我？', next: 'day7-meet-choice' },
  {
    id: 'day7-meet-choice',
    choice: true,
    options: [
      { label: '不會，我應該會一直看妳', reply: '那我也要一直看你。\n看看你的眼睛裡有沒有我。', next: 'day10-divider' },
      { label: '可能會有點緊張', reply: '那我就坐近一點，讓你沒時間緊張。', next: 'day10-divider' },
      { label: '那就看妳敢不敢見我', reply: '我有什麼不敢。\n我只是怕見了以後，你會更捨不得我。', next: 'day10-divider' },
    ],
  },

  { id: 'day10-divider', divider: 'Day 10', next: 'day10-e1' },
  { id: 'day10-e1', from: 'emily', text: '我今天午餐踩到一家超雷的店。', next: 'day10-e2' },
  { id: 'day10-e2', from: 'emily', text: '吃第一口的時候，居然第一個想到要跟你抱怨😂', next: 'day10-e3' },
  { id: 'day10-e3', from: 'emily', text: '我現在好像不管遇到好事還是壞事，第一個都會想跟你說。', next: 'day10-choice1' },
  {
    id: 'day10-choice1',
    choice: true,
    options: [
      { label: '代表我很重要啊', reply: '你現在才發現嗎？', next: 'day10-bedtime-ask' },
      { label: '所以我是妳的抱怨專線？', reply: '不只抱怨。\n我現在連想你的時候，也會找你。', next: 'day10-bedtime-ask' },
      { label: '我也是，現在有事也會想跟妳說', reply: '那就好。\n我不想只有我一個人越來越在意。', next: 'day10-bedtime-ask' },
    ],
  },
  { id: 'day10-bedtime-ask', from: 'emily', text: '你現在睡前是不是都會先看一下我有沒有傳訊息？', next: 'day10-bedtime-choice' },
  {
    id: 'day10-bedtime-choice',
    choice: true,
    options: [
      { label: '會啊', reply: '那我是不是已經變成你睡前的習慣了？', next: 'day12-divider' },
      { label: '看妳有沒有找我', reply: '那我不找你，你是不是就不會主動找我？', next: 'day10-bedtime-followup' },
      { label: '有時候', reply: '那今晚要記得看。\n我有一個只想給你看的東西。', next: 'day12-divider' },
    ],
  },
  { id: 'day10-bedtime-followup', from: 'emily', text: '這樣不行，我也想被你主動想起來。', next: 'day12-divider' },

  { id: 'day12-divider', divider: 'Day 12', next: 'day12-time' },
  { id: 'day12-time', from: 'system', text: '23:18', wait: 500, next: 'day12-ask' },
  { id: 'day12-ask', from: 'emily', text: '你睡了嗎？', next: 'day12-choice' },
  {
    id: 'day12-choice',
    choice: true,
    options: [
      { label: '還沒', reply: '那剛好。\n我本來還怕你睡了，看不到我。', next: 'day12-video-lead' },
      { label: '正準備睡', reply: '先不要睡。\n我有一個只想在你睡前給你看的東西。', next: 'day12-video-lead' },
      { label: '在等妳說晚安', reply: '你是不是已經知道，我捨不得讓你沒有晚安就睡？', next: 'day12-video-lead' },
    ],
  },
  { id: 'day12-video-lead', from: 'emily', text: '我剛剛有拍一小段，本來想睡前傳給你的。', next: 'day12-video' },
  { id: 'day12-video', video: { videoId: 'v3', duration: '0:15' }, next: 'day12-post-choice' },
  {
    id: 'day12-post-choice',
    choice: true,
    options: [
      { label: '晚安，做個好夢', reply: '你也是。\n明天醒來第一個要想到我。', next: 'day12-tip' },
      { label: '我也習慣每天跟妳聊天了', reply: '那你不可以突然不習慣我。\n我已經不想重新適應沒有你的晚上了。', next: 'day12-tip' },
      { label: '妳這樣我真的會喜歡上妳', reply: '你現在才說嗎？\n我還以為你早就有一點喜歡我了。', next: 'day12-tip' },
    ],
  },
  {
    id: 'day12-tip',
    tip: '短時間內透過固定關心、親密話語與自拍影片建立感情，可能使人快速產生情感依附。',
    next: 'day15-divider',
  },

  { id: 'day15-divider', divider: 'Day 15', next: 'day15-ask' },
  { id: 'day15-ask', from: 'emily', text: '今天工作真的好累喔……', next: 'day15-choice1' },
  {
    id: 'day15-choice1',
    choice: true,
    options: [
      { label: '辛苦了，今天怎麼了？', reply: '公司最近事情很多，事情做不完就算了，還一直被改來改去。', next: 'day15-converge1' },
      { label: '妳最近是不是都很忙？', reply: '對啊，最近幾乎每天都在加班，薪水又沒有比較多。', next: 'day15-converge1' },
      { label: '要不要先休息一下？', reply: '等等洗完澡就休息。\n只是最近事情很多，真的有點煩。', next: 'day15-converge1' },
    ],
  },
  { id: 'day15-converge1', from: 'emily', text: '還好我最近有多一點額外收入，不然壓力應該更大。', next: 'day15-choice2' },
  {
    id: 'day15-choice2',
    choice: true,
    options: [
      { label: '妳有在做副業嗎？', reply: '不算副業啦，是朋友之前帶我接觸一點虛擬貨幣。', next: 'day15-converge2' },
      { label: '什麼額外收入？', reply: '我最近有跟著朋友看一點虛擬貨幣，偶爾會有一些收益。', next: 'day15-converge2' },
      { label: '難怪妳看起來沒有很擔心', reply: '還是會擔心啊，只是最近剛好多一點收入，心裡比較沒那麼慌。', next: 'day15-converge2' },
    ],
  },
  { id: 'day15-converge2', from: 'emily', text: '我主要是跟 SOL，你有聽過嗎？', next: 'sol-choice' },

  {
    id: 'sol-choice',
    choice: true,
    options: [
      { label: '有聽過，但不太懂', reply: '我一開始也完全不懂，現在其實也只是跟著看。', next: 'sol-converge' },
      { label: '完全沒聽過', reply: '就是一種虛擬貨幣，跟比特幣不太一樣。\n我也是別人跟我說才知道。', next: 'sol-converge' },
      { label: '虛擬貨幣不是風險很高嗎？', reply: '風險確實不低，所以我一開始也只敢放一點點。', next: 'sol-converge' },
    ],
  },
  { id: 'sol-converge', from: 'emily', text: '是朋友帶我進一個分析群，他們會整理進出場的時間。', next: 'team-choice' },
  {
    id: 'team-choice',
    choice: true,
    options: [
      { label: '真的有那麼容易？', reply: '也不能說很容易啦，只是我目前跟的幾次剛好都有小賺。', next: 'shot-lead1' },
      { label: '妳賺很多嗎？', reply: '沒有很多，幾百美金而已，我也不敢一次放太多。', next: 'shot-lead1' },
      { label: '聽起來怪怪的', reply: '我一開始也覺得怪，所以第一次只放很少，後來有提領出來才比較放心。', next: 'shot-lead1' },
    ],
  },

  { id: 'shot-lead1', from: 'emily', text: '我找一下。', wait: 1400, next: 'shot-lead2' },
  { id: 'shot-lead2', from: 'emily', text: '我之前有截一張。', next: 'shot-image' },
  {
    id: 'shot-image',
    image: {
      brand: 'NOVA QUANT',
      rows: [
        ['本日收益', '+368 USDT'],
        ['總資產', '4,862 USDT'],
        ['SOL 智能策略', '+8.36%'],
      ],
    },
    next: 'shot-after1',
  },
  { id: 'shot-after1', from: 'emily', text: '我就是看到這樣才慢慢相信。', next: 'shot-after2' },
  { id: 'shot-after2', from: 'emily', text: '不過你不用急著碰啦，我只是剛好聊到才跟你說。', next: 'link-lead1' },

  { id: 'link-lead1', from: 'emily', text: '你有興趣的話，可以先看一下介面。', next: 'link-lead2' },
  { id: 'link-lead2', from: 'emily', text: '我把網址貼給你。', next: 'link-card-node' },
  {
    id: 'link-card-node',
    link: { brand: 'NOVA QUANT', subtitle: 'AI Digital Asset Strategy', url: 'nova-quant.digital' },
    next: 'link-return-ask',
  },
  { id: 'link-return-ask', from: 'emily', text: '有看到嗎？', next: 'link-return-choice' },
  {
    id: 'link-return-choice',
    choice: true,
    options: [
      { label: '這是哪家公司？', reply: '我朋友說是他們分析團隊合作的平台，我自己也是用這個。', next: 'link-tip' },
      { label: '這樣安全嗎？', reply: '我朋友已經用了滿久，我自己也有提領過。\n你先看看就好，不用馬上放錢。', next: 'link-tip' },
      { label: '我先看看介面', reply: '好啊，你不懂再截圖問我。', next: 'link-tip' },
    ],
  },
  {
    id: 'link-tip',
    tip: '陌生人傳送的投資網址，可能使用近似品牌名稱、短期網域或仿冒頁面。不要因為對方提供收益截圖，就認定平台安全。',
    next: 'end-chat',
  },
  { id: 'end-chat', end: true, reason: 'reached-link' },
];

function VideoThumb({ item, onOpen }) {
  return (
    <button type="button" className="line-video-thumb" onClick={onOpen} aria-label="播放影片">
      <span className="line-video-thumb-play"><Play size={20} fill="currentColor" /></span>
      <span className="line-video-thumb-duration">{item.duration}</span>
    </button>
  );
}

// The profit-screenshot "photo" Emily sends - a compact preview card (same
// brand/rows data the old inline card showed) with a tap-to-enlarge
// affordance, rather than the numbers just sitting fully expanded in the
// chat flow already.
function ImageThumb({ item, onOpen }) {
  return (
    <button type="button" className="line-image-thumb" onClick={onOpen} aria-label="查看圖片">
      <div className="shot-brand">{item.brand}</div>
      {item.rows.slice(0, 2).map(([label, value], r) => (
        <div key={r} className="shot-row"><span>{label}</span><strong>{value}</strong></div>
      ))}
      <span className="line-image-thumb-zoom"><ZoomIn size={16} /></span>
    </button>
  );
}

function ImageLightbox({ item, onClose }) {
  return (
    <div className="line-image-lightbox" onClick={onClose}>
      <div className="line-image-lightbox-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="line-image-lightbox-close" onClick={onClose} aria-label="關閉">
          <X size={20} />
        </button>
        <div className="shot-brand">{item.brand}</div>
        {item.rows.map(([label, value], r) => (
          <div key={r} className="shot-row"><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
    </div>
  );
}

// Only ever one link node in the script, so "still pending" is enough to
// tell the active card apart from an already-resolved one - a resolved card
// stays visible as part of the chat history but stops being clickable,
// since tapping it again would mean re-navigating away with nothing sensible
// to resume into.
function LinkCard({ item, active, onOpen }) {
  const content = (
    <>
      <div className="link-brand">{item.brand}</div>
      <div>{item.subtitle}</div>
      <div className="link-url">{item.url}</div>
      {active && <span className="link-card-icon"><ExternalLink size={16} /></span>}
    </>
  );
  if (!active) {
    return <div className="link-card">{content}</div>;
  }
  return (
    <button type="button" className="link-card link-card-clickable" onClick={onOpen}>
      {content}
    </button>
  );
}

function TipItem({ item, active, onAck }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <SafetyAlert
      text={item.text}
      detail={item.detail}
      expanded={expanded}
      onToggleDetail={() => setExpanded((v) => !v)}
      acknowledged={!active}
      onAcknowledge={onAck}
    />
  );
}

const VIDEO_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  BLOCKED: 'blocked',
  ERROR: 'error',
  ENDED: 'ended',
};

// How long to wait for loadeddata/canplay/playing/error before assuming the
// load itself is stuck (bad network, unreachable asset, browser quirk) and
// surfacing an explicit "load failed, skip or retry" screen instead of
// leaving the player - and the whole educational flow behind it - stuck on
// a plain black rectangle forever.
const VIDEO_LOAD_TIMEOUT = 8000;

// Fullscreen video overlay with an explicit state machine instead of a bare
// `<video autoPlay>`: autoplay-with-sound can be silently blocked by the
// browser, or the asset can simply still be loading, and either of those
// looks identical to the player (full black box) unless we track which one
// it is and show the right recovery UI. No controls, no captions, no "看完了"
// button - completion is always driven by onEnded/the skip button.
function VideoOverlay({ videoId, src, onFinished }) {
  const videoRef = useRef(null);
  const playAttemptedRef = useRef(false);
  const finishedRef = useRef(false);
  const loadTimeoutRef = useRef(null);
  const [videoState, setVideoState] = useState(VIDEO_STATE.LOADING);
  const [videoErrorMessage, setVideoErrorMessage] = useState('');

  function clearLoadTimeout() {
    clearTimeout(loadTimeoutRef.current);
  }

  function armLoadTimeout() {
    clearLoadTimeout();
    loadTimeoutRef.current = setTimeout(() => {
      console.error('[Scenario02 Video Error]', { videoId, src, reason: 'load-timeout' });
      setVideoErrorMessage('影片載入逾時');
      setVideoState(VIDEO_STATE.ERROR);
    }, VIDEO_LOAD_TIMEOUT);
  }

  // Every new video (v1 -> v2 -> v3, or a replay) starts this component
  // fresh via `key={videoId}` at the call site, but the state reset also
  // lives here so switching src on an already-mounted instance can't leave
  // a stale error/ended state behind either.
  useEffect(() => {
    playAttemptedRef.current = false;
    finishedRef.current = false;
    setVideoErrorMessage('');
    setVideoState(VIDEO_STATE.LOADING);
    armLoadTimeout();
    return clearLoadTimeout;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, src]);

  function finishVideo() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearLoadTimeout();
    setVideoState(VIDEO_STATE.ENDED);
    requestAnimationFrame(() => {
      onFinished();
    });
  }

  async function tryPlayVideo() {
    if (playAttemptedRef.current) return;
    playAttemptedRef.current = true;
    const video = videoRef.current;
    if (!video) return;
    try {
      video.currentTime = 0;
      await video.play();
      clearLoadTimeout();
      setVideoState(VIDEO_STATE.PLAYING);
      console.info('[Scenario02 Video]', { videoId, state: 'playing', src });
    } catch (error) {
      console.error('[Scenario02 Video Error]', error);
      setVideoState(VIDEO_STATE.BLOCKED);
    }
  }

  function handleManualPlay() {
    videoRef.current
      ?.play()
      .then(() => {
        clearLoadTimeout();
        setVideoState(VIDEO_STATE.PLAYING);
      })
      .catch((error) => console.error('[Scenario02 Video Error]', error));
  }

  function handleVideoError(event) {
    const mediaError = event.currentTarget.error;
    console.error('[Scenario02 Video Error]', {
      videoId,
      src,
      code: mediaError?.code,
      message: mediaError?.message,
    });
    clearLoadTimeout();
    setVideoErrorMessage(mediaError?.message || '影片無法載入');
    setVideoState(VIDEO_STATE.ERROR);
  }

  function retryVideo() {
    playAttemptedRef.current = false;
    setVideoErrorMessage('');
    setVideoState(VIDEO_STATE.LOADING);
    armLoadTimeout();
    videoRef.current?.load();
  }

  return (
    <div className="line-video-overlay" onContextMenu={(e) => e.preventDefault()}>
      <video
        ref={videoRef}
        key={videoId}
        className="line-video-overlay-el"
        src={src}
        autoPlay
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onLoadedData={tryPlayVideo}
        onCanPlay={tryPlayVideo}
        onPlaying={() => setVideoState(VIDEO_STATE.PLAYING)}
        onEnded={finishVideo}
        onError={handleVideoError}
        onContextMenu={(e) => e.preventDefault()}
      />
      {videoState === VIDEO_STATE.LOADING && (
        <div className="line-video-loading">
          <span className="line-video-spinner" />
          <span>影片載入中…</span>
        </div>
      )}
      {videoState === VIDEO_STATE.BLOCKED && (
        <button type="button" className="line-video-tap-fallback" onClick={handleManualPlay}>
          <span className="line-video-play-btn"><Play size={32} fill="currentColor" /></span>
          <span>點一下播放 Emily 傳來的影片</span>
        </button>
      )}
      {videoState === VIDEO_STATE.ERROR && (
        <div className="line-video-error">
          <p title={videoErrorMessage || undefined}>影片載入失敗</p>
          <button type="button" className="line-video-error-btn" onClick={retryVideo}>重新播放</button>
          <button type="button" className="line-video-error-btn secondary" onClick={finishVideo}>略過影片並繼續</button>
        </div>
      )}
    </div>
  );
}

export function PrivateChat() {
  useSaveScenario02Progress('/scenario02-romance/private-chat');
  useStageClassName('tanu-stage');
  const navigate = useNavigate();

  // Consumed once, synchronously, on first mount - if the player just came
  // back from the investment platform (via the link card below), this
  // restores the chat exactly where they left it instead of restarting the
  // whole scripted conversation from 'join-sys'.
  const [checkpoint] = useState(() => takePrivateChatCheckpoint());
  const dialogueOptions = useMemo(
    () =>
      checkpoint
        ? {
            initialTimeline: checkpoint.timeline,
            resumeId: checkpoint.resumeId,
            initialWatchedVideoIds: checkpoint.watchedVideoIds,
          }
        : undefined,
    [checkpoint],
  );

  const {
    timeline,
    isTyping,
    pendingChoice,
    choose,
    pendingVideo,
    completeVideo,
    completeImage,
    pendingLink,
    pendingTip,
    completeTip,
    watchedVideoIds,
  } = useDialogueTree(NODES, 'join-sys', dialogueOptions);
  const [openVideoId, setOpenVideoId] = useState(null);
  const [replayVideoId, setReplayVideoId] = useState(null);
  const [lightboxItem, setLightboxItem] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [timeline, isTyping, pendingChoice, pendingTip]);

  // Not just the src string - the overlay needs the id itself (VIDEO_SRC key)
  // for its `key` prop, so switching between v1/v2/v3 always mounts a fresh
  // <video> instead of a browser potentially carrying over the previous
  // one's error/ended state onto the next src.
  const activeVideoId = openVideoId ?? replayVideoId ?? null;
  const activeSrc = useMemo(() => {
    const id = openVideoId ?? replayVideoId;
    return id && VIDEO_SRC[id] ? VIDEO_SRC[id] : null;
  }, [openVideoId, replayVideoId]);

  function handleVideoFinished() {
    if (openVideoId) {
      setOpenVideoId(null);
      completeVideo();
      requestAnimationFrame(() => {
        scrollRef.current?.focus?.();
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
      });
    } else if (replayVideoId) {
      setReplayVideoId(null);
    }
  }

  function closeImage() {
    setLightboxItem(null);
    completeImage();
  }

  function openLink() {
    if (pendingLink) {
      savePrivateChatCheckpoint(timeline, pendingLink.next, watchedVideoIds);
    }
    navigate('/scenario02-romance/platform-register');
  }

  return (
    <div className="line-app">
      <header className="line-header">
        <button type="button" className="line-icon-btn" aria-label="返回" onClick={() => navigate('/scenario02-romance/dating-chat')}>
          <ChevronLeft size={26} />
        </button>
        <ProfileAvatar name="Emily" src={EMILY_PHOTO} size={34} />
        <div className="line-header-name">Emily</div>
        <div className="line-header-icons">
          <button type="button" className="line-icon-btn" aria-label="搜尋"><Search size={20} /></button>
          <button type="button" className="line-icon-btn" aria-label="通話"><Phone size={20} /></button>
          <button type="button" className="line-icon-btn" aria-label="選單"><Menu size={20} /></button>
        </div>
      </header>
      <div className="line-chat-scroll" ref={scrollRef} tabIndex={-1}>
        {timeline.map((item, i) => {
          if (item.kind === 'divider') {
            return (
              <div key={i} className="line-date-divider"><span>{formatDivider(item.label)}</span></div>
            );
          }
          if (item.kind === 'video') {
            const watched = watchedVideoIds.has(item.videoId);
            return (
              <div key={i} className="line-msg-row them">
                <VideoThumb
                  item={item}
                  onOpen={() => {
                    if (watched) {
                      setReplayVideoId(item.videoId);
                    } else if (pendingVideo?.videoId === item.videoId) {
                      setOpenVideoId(item.videoId);
                    }
                  }}
                />
              </div>
            );
          }
          if (item.kind === 'image') {
            return (
              <div key={i} className="line-msg-row them">
                <ImageThumb item={item} onOpen={() => setLightboxItem(item)} />
              </div>
            );
          }
          if (item.kind === 'link') {
            return (
              <div key={i} className="line-msg-row them">
                <LinkCard item={item} active={Boolean(pendingLink)} onOpen={openLink} />
              </div>
            );
          }
          if (item.kind === 'tip') {
            return <TipItem key={i} item={item} active={pendingTip?.key === item.key} onAck={completeTip} />;
          }
          if (item.from === 'system') {
            return <div key={i} className="line-date-divider"><span>{item.text}</span></div>;
          }
          const mine = item.from === 'user';
          return (
            <div key={i} className={`line-msg-row${mine ? ' mine' : ' them'}`}>
              <div className={`line-msg ${mine ? 'me' : 'them'}`}>{item.text}</div>
            </div>
          );
        })}
        {isTyping && <div className="tanu-typing"><i /><i /><i /></div>}
      </div>
      <footer className="line-chat-footer">
        {pendingChoice && <SuggestedReplies options={pendingChoice.options} onChoose={choose} />}
      </footer>

      {activeSrc && (
        <VideoOverlay key={activeVideoId} videoId={activeVideoId} src={activeSrc} onFinished={handleVideoFinished} />
      )}
      {lightboxItem && <ImageLightbox item={lightboxItem} onClose={closeImage} />}
    </div>
  );
}
