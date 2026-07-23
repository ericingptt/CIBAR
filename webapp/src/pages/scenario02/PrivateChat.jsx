import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Phone, Menu, Play, ZoomIn, X, ExternalLink } from 'lucide-react';
import { useDialogueTree } from '../../lib/dialogueTree';
import { useAutoMediaPreview } from '../../lib/useAutoMediaPreview';
import {
  useSaveScenario02Progress,
  savePrivateChatCheckpoint,
  takePrivateChatCheckpoint,
  savePlatformState,
} from '../../lib/scenario02Store';
import { useChatClock, computeTimestamps, formatTime, formatDateDivider, addDays } from '../../lib/chatTime';
import { IncomingMessage, OutgoingMessage } from '../../components/ui/Chat';
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
// `next`) - only the displayed date is derived from the day the player
// actually opened this chat (see chatStart below), offset by these same
// day-gaps from the original Day 1/3/5/7/10/12/15 spacing.
const DAY_OFFSETS = { 'Day 1': 0, 'Day 3': 2, 'Day 5': 4, 'Day 7': 6, 'Day 10': 9, 'Day 12': 11, 'Day 13': 12, 'Day 15': 14 };

const GUESTHOUSE_ROOM_IMG = `${import.meta.env.BASE_URL}assets/scenario2/guesthouse-room-placeholder.webp`;
const GUESTHOUSE_BOOKING_IMG = `${import.meta.env.BASE_URL}assets/scenario2/guesthouse-booking-placeholder.webp`;

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
    next: 'day13-divider',
  },

  // --- Day 13: imagining meeting in person ---------------------------------
  { id: 'day13-divider', divider: 'Day 13', next: 'day13-e1' },
  { id: 'day13-e1', from: 'emily', text: '我剛剛突然想到一件事。', next: 'day13-e1-choice' },
  {
    id: 'day13-e1-choice',
    choice: true,
    options: [
      { label: '想到什麼？', reply: '我們都聊這麼久了，結果一直沒有真的見到面。', next: 'day13-where-ask' },
      { label: '又想到我了？', reply: '對啊。\n而且是在想，我們到底什麼時候才不用隔著手機聊天。', next: 'day13-where-ask' },
      { label: '聽起來好像很神祕', reply: '我在想，如果我們真的見面，第一天要去哪裡。', next: 'day13-where-ask' },
    ],
  },
  { id: 'day13-where-ask', from: 'emily', text: '你比較想去宜蘭還是花蓮？', next: 'day13-where-choice' },
  {
    id: 'day13-where-choice',
    choice: true,
    options: [
      { label: '宜蘭，近一點', reply: '那可以找一間有落地窗的民宿。\n晚上不用趕行程，就待在房間裡聊天。', next: 'day13-cost-ask' },
      { label: '花蓮，感覺比較像旅行', reply: '我也想去花蓮。\n白天看海，晚上找一間安靜的民宿，不要有人打擾我們。', next: 'day13-cost-ask' },
      { label: '去哪裡都可以，重點是跟誰', reply: '你這句很危險耶。\n這樣我會真的開始期待。', next: 'day13-cost-ask' },
    ],
  },
  {
    id: 'day13-cost-ask',
    from: 'emily',
    text: '可是認真講，出去玩也是一筆錢。\n我不想第一次跟你出去，還要一直算這個能不能吃、那個能不能住。',
    next: 'day13-cost-choice',
  },
  {
    id: 'day13-cost-choice',
    choice: true,
    options: [
      { label: '我可以出啊', reply: '我知道你會這樣說。\n可是我不想什麼都讓你出，我也想替我們準備一點。', next: 'day13-together-ask' },
      { label: '不用住太貴', reply: '可是第一次出去，我還是想找一間漂亮一點的。\n至少要讓我期待一下吧😂', next: 'day13-together-ask' },
      { label: '我們可以一起存', reply: '我喜歡「我們一起」這四個字。', next: 'day13-together-ask' },
    ],
  },
  { id: 'day13-together-ask', from: 'emily', text: '如果你也多存一點，我也多存一點，我們是不是很快就可以去了？', next: 'day13-user' },
  { id: 'day13-user', from: 'user', text: '應該可以吧。', next: 'day13-final' },
  { id: 'day13-final', from: 'emily', text: '那以後就不可以每次都只說「改天」。', next: 'day15-divider' },

  // --- Day 15: natural investment introduction (rebranded, no real coin names) ---
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
  { id: 'day15-converge1', from: 'emily', text: '還好我最近有多一點額外收入，不然壓力應該更大。', next: 'day15-platform-intro' },
  { id: 'day15-platform-intro', from: 'emily', text: '我最近其實就是因為這樣，才會比較認真弄那個平台。', next: 'day15-platform-choice' },
  {
    id: 'day15-platform-choice',
    choice: true,
    options: [
      { label: '妳之前說的額外收入？', reply: '對啊，就是我之前跟你說的那個。', next: 'day15-save1' },
      { label: '就是那個投資嗎？', reply: '嗯，朋友帶我用的智能策略。', next: 'day15-save1' },
      { label: '所以妳真的有賺到？', reply: '有啊，雖然不是一次很多，可是累積起來比只靠薪水快。', next: 'day15-save1' },
    ],
  },
  { id: 'day15-save1', from: 'emily', text: '我本來只是想自己慢慢存。', next: 'day15-save2' },
  { id: 'day15-save2', from: 'emily', text: '可是剛剛想到，如果我們一起，好像可以更快實現。', next: 'day15-save3' },
  { id: 'day15-save3', from: 'emily', text: '你要不要先看看？', next: 'link-card-node' },
  {
    id: 'link-card-node',
    link: {
      brand: '幣勝客 BITION',
      title: 'AI 智能數位資產交易',
      subtitle: '全球多市場智能套利策略，24 小時自動運行',
      cta: '開啟平台',
    },
    next: 's8-ask',
  },

  // --- Section 八：platform "查看策略" click switches back to LINE ---------
  { id: 's8-ask', from: 'emily', text: '有看到嗎？', next: 's8-choice' },
  {
    id: 's8-choice',
    choice: true,
    options: [
      { label: '這是哪家公司？', reply: '我朋友說是他們分析團隊合作的平台，我自己也是用這個。', next: 's8-end' },
      { label: '這樣安全嗎？', reply: '我朋友已經用了滿久，我自己也有提領過。\n你先看看就好，不用馬上放錢。', next: 's8-end' },
      { label: '我先看看介面', reply: '好啊，你不懂再截圖問我。', next: 's8-end' },
    ],
  },
  {
    id: 's8-end',
    custom: {
      kind: 'goto-platform',
      route: '/scenario02-romance/trading',
      patch: { page: 'strategy' },
      resumeId: 's10-ask',
    },
    wait: 5000,
    next: 's10-ask',
  },

  // --- Section 十（重寫）：入金前，Emily 先給出交往承諾 ---------------------
  { id: 's10-ask', from: 'emily', text: '你真的要跟我一起開始喔？', next: 's10-choice' },
  {
    id: 's10-choice',
    choice: true,
    options: [
      { label: '先放一萬試試看', reply: '一萬就可以了，不用一次放太多。\n就當作我們第一筆一起存的旅行基金。', next: 's10-promise-ask' },
      {
        label: '我還是有點怕',
        reply: '我知道，第一次一定會怕。\n所以才叫你先放一萬就好。\n你願意跟我一起開始，我就已經很開心了。',
        next: 's10-promise-ask',
      },
      {
        label: '妳真的希望我一起嗎？',
        reply: '當然啊。\n我不是只想自己賺錢。\n我是想跟你一起存我們以後要用的錢。',
        next: 's10-promise-ask',
      },
    ],
  },
  { id: 's10-promise-ask', from: 'emily', text: '不然我們約定一件事好不好？', next: 's10-promise-user' },
  { id: 's10-promise-user', from: 'user', text: '什麼事？', next: 's10-promise1' },
  { id: 's10-promise1', from: 'emily', text: '如果你真的願意把第一筆一萬放進去。', next: 's10-promise2' },
  { id: 's10-promise2', from: 'emily', text: '那我就正式當你女朋友。', wait: 600, next: 's10-promise3' },
  { id: 's10-promise3', from: 'emily', text: '不是聊天而已。', next: 's10-promise4' },
  { id: 's10-promise4', from: 'emily', text: '是真的在一起。', next: 's10-promise-choice' },
  {
    id: 's10-promise-choice',
    choice: true,
    options: [
      {
        label: '妳認真的？',
        reply: '我很認真啊。\n不然我怎麼會一直跟你講我們要去哪裡、以後要做什麼。',
        next: 's10-final1',
      },
      {
        label: '所以我入金，妳就答應我？',
        reply: '不是因為那一萬。\n是因為你願意跟我一起為我們的未來開始。',
        next: 's10-final1',
      },
      {
        label: '妳不可以騙我',
        reply: '我連我們第一次要去哪裡都想好了。\n現在反而是我怕你不敢跟我一起。',
        next: 's10-final1',
      },
    ],
  },
  { id: 's10-final1', from: 'emily', text: '你先完成。', next: 's10-final2' },
  { id: 's10-final2', from: 'emily', text: '等你回來，我再告訴你，以後要怎麼叫我。', next: 's10-end' },
  {
    id: 's10-end',
    custom: {
      kind: 'goto-platform',
      route: '/scenario02-romance/deposit-warning',
      patch: { page: 'deposit-warning' },
      resumeId: 's14-ask',
    },
    wait: 5000,
    next: 's14-ask',
  },

  // --- Section 十四（重寫）：入金成功後，Emily 先叫男朋友，再升級成老公 -----
  { id: 's14-ask', from: 'emily', text: '你真的完成了？', next: 's14-choice' },
  {
    id: 's14-choice',
    choice: true,
    options: [
      { label: '完成了', reply: '男朋友。', next: 's14-converge' },
      { label: '一萬已經進去了', reply: '我看到了。\n男朋友很乖。', next: 's14-converge' },
      { label: '所以妳剛才說的算數嗎？', reply: '當然算數。\n從現在開始，你就是我男朋友。', next: 's14-converge' },
    ],
  },
  { id: 's14-converge', from: 'emily', text: '男朋友～', wait: 700, next: 's14-shy1' },
  { id: 's14-shy1', from: 'emily', text: '可是一直叫男朋友好像有點生疏。', wait: 500, next: 's14-shy2' },
  { id: 's14-shy2', from: 'emily', text: '老公。', next: 's14-shy3' },
  { id: 's14-shy3', from: 'emily', text: '這樣比較像我們已經真的在一起了。', next: 's14-rename-choice' },
  {
    id: 's14-rename-choice',
    choice: true,
    options: [
      { label: '再叫一次', reply: '老公～\n這樣可以了嗎？', next: 's14-end' },
      { label: '妳真的很會', reply: '我只對你這樣。', next: 's14-end' },
      { label: '所以我們現在算在一起了？', reply: '算啊。\n不然你以為我會隨便叫別人老公嗎？', next: 's14-end' },
    ],
  },
  {
    id: 's14-end',
    custom: {
      kind: 'goto-platform',
      route: '/scenario02-romance/platform-home',
      patch: { page: 'home', platformStep: 'stage1', balance: 10860, profit: 860 },
      resumeId: 's15-ask',
    },
    wait: 5000,
    next: 's15-ask',
  },

  // --- Section 十五：staged profit + Section 十六：guesthouse image A ------
  { id: 's15-ask', from: 'emily', text: '老公，你有看到今天的收益嗎？', next: 's15-choice' },
  {
    id: 's15-choice',
    choice: true,
    options: [
      { label: '好像真的有賺', reply: '對啊。\n我看到的時候也會一直忍不住算，我們還差多少旅費。', next: 's15-converge' },
      { label: '這樣真的可以提領嗎？', reply: '可以啊，我之前就有提領過。\n不然我哪敢叫老公跟我一起。', next: 's15-converge' },
      { label: '那我們是不是快可以去玩了？', reply: '你比我還急是不是😂\n可是我也真的開始在看民宿了。', next: 's15-converge' },
    ],
  },
  { id: 's15-converge', from: 'emily', text: '我昨天有偷偷存一間。', next: 's16-image' },
  {
    id: 's16-image',
    image: {
      src: GUESTHOUSE_ROOM_IMG,
      alt: '宜蘭民宿雙人房圖片預留位置',
      label: '宜蘭民宿雙人房圖片預留位置',
    },
    next: 's16-ask',
  },
  { id: 's16-ask', from: 'emily', text: '你覺得這間怎麼樣？', next: 's16-choice' },
  {
    id: 's16-choice',
    choice: true,
    options: [
      { label: '看起來很適合兩個人', reply: '本來就是找給兩個人的啊。', next: 's16-converge1' },
      { label: '妳真的已經看到這麼後面了？', reply: '不然咧？\n我連晚上要帶什麼都快想好了。', next: 's16-converge1' },
      { label: '房間只有一張床欸', reply: '你現在才發現喔？\n還是你本來想叫我另外睡一間😂', next: 's16-converge1' },
    ],
  },
  { id: 's16-converge1', from: 'emily', text: '到時候我們不要排太多行程。', next: 's16-converge2' },
  { id: 's16-converge2', from: 'emily', text: '白天出去走走，晚上就回來待在房間裡。', next: 's16-converge3' },
  { id: 's16-converge3', from: 'emily', text: '手機都關靜音，只陪對方。', next: 's16-end' },
  {
    id: 's16-end',
    custom: {
      kind: 'goto-platform',
      route: '/scenario02-romance/platform-home',
      patch: { page: 'home', platformStep: 'stage3', balance: 38640, profit: 8640 },
      resumeId: 's17-ask',
    },
    wait: 5000,
    next: 's17-ask',
  },

  // --- Section 十七：withdrawal storyline ----------------------------------
  { id: 's17-ask', from: 'emily', text: '老公，我覺得現在差不多可以先提一部分出來。', next: 's17-ask2' },
  { id: 's17-ask2', from: 'emily', text: '剛好可以拿來付民宿跟吃飯。', next: 's17-end' },
  {
    id: 's17-end',
    custom: {
      kind: 'goto-platform',
      route: '/scenario02-romance/withdrawal',
      patch: { page: 'withdrawal', withdrawalStep: 'requested' },
      resumeId: 's19-ask',
    },
    wait: 5000,
    next: 's19-ask',
  },

  // --- Section 十九：after withdrawal failure -------------------------------
  { id: 's19-ask', from: 'emily', text: '老公，成功了嗎？', next: 's19-choice' },
  {
    id: 's19-choice',
    choice: true,
    options: [
      {
        label: '沒有，它說還要繳安全驗證金',
        reply: '蛤～怎麼會這樣🥺\n那怎麼辦……\n可是我民宿都已經訂好了耶。',
        next: 's19-converge',
      },
      {
        label: '它又要我再付三萬',
        reply: '三萬喔……\n可是現在停下來，原本放進去的錢跟收益不是都拿不出來嗎？\n而且我訂房的錢也已經付了。',
        next: 's19-converge',
      },
      {
        label: '我覺得這個平台真的有問題',
        reply: '可是我之前也有遇過驗證。\n我那次完成之後就真的有提領出來。\n會不會只是你第一次提領，所以系統要多確認一次？',
        next: 's19-converge',
      },
    ],
  },
  { id: 's19-converge', from: 'emily', text: '我本來還想等你提領成功，再給你一個驚喜的。', next: 's20-image' },

  // --- Section 二十：guesthouse booking image B -----------------------------
  {
    id: 's20-image',
    image: {
      src: GUESTHOUSE_BOOKING_IMG,
      alt: 'Emily 宜蘭民宿訂房確認截圖預留位置',
      label: 'Emily 宜蘭民宿訂房確認截圖預留位置',
    },
    next: 's20-ask1',
  },
  { id: 's20-ask1', from: 'emily', text: '你看，我真的訂了。', next: 's20-ask2' },
  { id: 's20-ask2', from: 'emily', text: '我還特別選了你之前說想去的地方。', next: 's20-ask3' },
  { id: 's20-ask3', from: 'emily', text: '我一直以為這個週末，我們終於不用只在手機裡面聊天了。', next: 's20-choice' },
  {
    id: 's20-choice',
    choice: true,
    options: [
      { label: '妳真的都訂好了？', reply: '對啊。\n我連衣服都想好了。\n結果你現在才問我是不是真的。', next: 's21-lead1' },
      {
        label: '可是它還要我繼續付錢',
        reply: '我知道，我也不是叫你亂付。\n可是它不是寫完成驗證，就可以連原本的錢一起提領嗎？\n等拿出來，我們這趟也不用一直擔心花多少。',
        next: 's21-lead1',
      },
      { label: '我現在真的不敢再放了', reply: '好……我不逼你。', next: 's20-sad1' },
    ],
  },
  { id: 's20-sad1', from: 'emily', text: '我只是有點難過。', wait: 1000, next: 's20-sad2' },
  { id: 's20-sad2', from: 'emily', text: '因為我真的以為，我們已經快要見面了。', next: 's21-lead1' },

  // --- Section 二十一：amplify future imagination ---------------------------
  { id: 's21-lead1', from: 'emily', text: '而且我想的又不只是這次宜蘭。', next: 's21-lead2' },
  { id: 's21-lead2', from: 'emily', text: '如果我們兩個都多存一點，以後還可以一起去日本。', next: 's21-lead3' },
  { id: 's21-lead3', from: 'emily', text: '去京都住有溫泉的旅館。', next: 's21-lead4' },
  { id: 's21-lead4', from: 'emily', text: '白天出去走走，晚上就一起泡湯、聊天。', next: 's21-lead5' },
  { id: 's21-lead5', from: 'emily', text: '這些我都不是隨便講講而已。', next: 's21-choice' },
  {
    id: 's21-choice',
    choice: true,
    options: [
      {
        label: '妳真的有把我放進未來嗎？',
        reply: '不然我為什麼會一直跟你說「我們」？\n我早就不是只把你當聊天的人了。',
        next: 's22-lead1',
      },
      {
        label: '可是我怕再也拿不回來',
        reply: '我懂你怕。\n可是現在只差最後一個驗證。\n如果就這樣停下來，我們前面一起做的，不是全部都卡在那裡了嗎？',
        next: 's22-lead1',
      },
      {
        label: '妳真的會跟我去？',
        reply: '老公，你怎麼到現在還在問這個。\n我連房間都訂好了。\n我只是怕最後沒有出現的人是你。',
        next: 's22-lead1',
      },
    ],
  },

  // --- Section 二十二：final temptation -------------------------------------
  { id: 's22-lead1', from: 'emily', text: '我不是要逼你繼續投資。', next: 's22-lead2' },
  { id: 's22-lead2', from: 'emily', text: '我只是覺得，我們好不容易都走到這裡了。', next: 's22-lead3' },
  { id: 's22-lead3', from: 'emily', text: '你先完成這次驗證。', next: 's22-lead4' },
  { id: 's22-lead4', from: 'emily', text: '等錢拿出來，我們就去宜蘭。', next: 's22-lead5' },
  { id: 's22-lead5', from: 'emily', text: '到時候手機關靜音。', next: 's22-lead6' },
  { id: 's22-lead6', from: 'emily', text: '這兩天你只陪我，好不好？', next: 's22-choice' },
  {
    id: 's22-choice',
    choice: true,
    options: [
      { label: '好，我再試最後一次', reply: '老公最好了。\n我真的會在那裡等你。', next: 's22-end' },
      { label: '我先回平台看看', reply: '好，你先看。\n不懂就回來問我，我陪你。', next: 's22-end' },
      {
        label: '我還是覺得不對勁',
        reply: '我知道你擔心。\n可是如果你什麼都不做，我們的錢就真的只能一直放在裡面。',
        next: 's22-end',
      },
    ],
  },
  {
    id: 's22-end',
    custom: {
      kind: 'goto-platform',
      route: '/scenario02-romance/topup-warning',
      patch: { page: 'topup-warning', withdrawalStep: 'verification-required' },
      resumeId: 'end-chat',
    },
    wait: 5000,
    next: 'end-chat',
  },
  { id: 'end-chat', end: true, reason: 'reached-topup-warning' },
];

// Purely presentational now - the whole point of the auto-play requirement
// is that the player never taps anything here. The thumbnail shows for
// `thumbnailDelay` (driven by useAutoMediaPreview in PrivateChat), then the
// overlay/lightbox opens on its own.
function VideoThumb({ item }) {
  return (
    <div className="line-video-thumb" aria-label="Emily 傳來的影片">
      <span className="line-video-thumb-play"><Play size={20} fill="currentColor" /></span>
      <span className="line-video-thumb-duration">{item.duration}</span>
    </div>
  );
}

// Emily's guesthouse photos - real assets aren't supplied yet (see final
// report), so this always renders the on-screen placeholder label; the
// <img> tag is still wired to the real future path so dropping a real photo
// in at that path starts working immediately with no code change, via the
// onError fallback below.
function PhotoThumb({ item }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="line-image-thumb line-photo-thumb" aria-label="Emily 傳來的照片">
      {!failed && (
        <img src={item.src} alt={item.alt} className="line-photo-img" onError={() => setFailed(true)} />
      )}
      {failed && <div className="line-photo-placeholder">{item.label}</div>}
      <span className="line-image-thumb-zoom"><ZoomIn size={16} /></span>
    </div>
  );
}

function PhotoLightbox({ item, onClose }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="line-image-lightbox" onClick={onClose}>
      <div className="line-image-lightbox-card line-photo-lightbox-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="line-image-lightbox-close" onClick={onClose} aria-label="關閉">
          <X size={20} />
        </button>
        {!failed && (
          <img src={item.src} alt={item.alt} className="line-photo-img-large" onError={() => setFailed(true)} />
        )}
        {failed && <div className="line-photo-placeholder line-photo-placeholder-large">{item.label}</div>}
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
      <div className="link-card-badge">幣</div>
      <div className="link-brand">{item.brand}</div>
      <div className="link-title">{item.title}</div>
      <div className="link-url">{item.subtitle}</div>
      {active && (
        <span className="link-card-cta">
          {item.cta} <ExternalLink size={14} />
        </span>
      )}
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
  LOADING: 'loading',
  PLAYING: 'playing',
  ERROR: 'error',
  ENDED: 'ended',
};

// How long to wait for loadeddata/canplay/playing/error before assuming the
// load itself is stuck (bad network, unreachable asset, browser quirk) and
// surfacing an explicit "load failed, skip or retry" screen instead of
// leaving the player - and the whole educational flow behind it - stuck on
// a plain black rectangle forever. Unrelated to autoplay policy: this only
// covers a genuinely broken/unreachable file.
const VIDEO_LOAD_TIMEOUT = 8000;

// Fullscreen video overlay that ALWAYS auto-plays: it starts `muted`
// (browsers universally allow muted autoplay, no gesture required) and
// only unmutes once playback has actually started. Toggling `.muted` on an
// element that's already playing isn't a new play() call, so it isn't
// re-blocked by autoplay policy the way a fresh unmuted play() would be -
// if it's ever rejected anyway, the video keeps playing muted rather than
// stalling or asking the player to tap anything. No "tap to play" fallback
// exists here anymore; a genuine load failure (bad file, network) still
// gets an explicit retry/skip screen since that's a different failure mode
// than autoplay policy.
function VideoOverlay({ videoId, src, onFinished }) {
  const videoRef = useRef(null);
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

  // Every new video (v1 -> v2 -> v3) starts this component fresh via
  // `key={videoId}` at the call site, but the state reset also lives here
  // so switching src on an already-mounted instance can't leave a stale
  // error/ended state behind either.
  useEffect(() => {
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

  function handlePlaying() {
    clearLoadTimeout();
    setVideoState(VIDEO_STATE.PLAYING);
    const video = videoRef.current;
    if (video) {
      try {
        video.muted = false;
      } catch {
        // keep playing muted - the auto-advance flow must never depend on sound
      }
    }
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
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onLoadedData={clearLoadTimeout}
        onPlaying={handlePlaying}
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

// Shared brand transition used both when first opening the platform (link
// card tap) and every time a "goto-platform" beat sends the player back -
// makes the hand-off read as "we are now switching apps", not an instant cut.
function PlatformOpeningOverlay() {
  return (
    <div className="bition-opening-overlay">
      <div className="bition-opening-logo">
        幣勝客
        <span>BITION</span>
      </div>
      <div className="bition-opening-spinner" />
      <p>正在開啟「幣勝客 BITION」……</p>
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
    pendingImage,
    completeImage,
    pendingLink,
    pendingTip,
    completeTip,
    watchedVideoIds,
  } = useDialogueTree(NODES, 'join-sys', dialogueOptions);
  const [openVideoId, setOpenVideoId] = useState(null);
  const [lightboxItem, setLightboxItem] = useState(null);
  const scrollRef = useRef(null);

  // The moment the player opened this chat - fixed for the rest of this run
  // (shares scenario02Store's 'cibar-scenario02-' key prefix, so resetScenario02()
  // clears it too, and the next run gets a genuinely new "now").
  const chatStart = useChatClock('cibar-scenario02-chat-clock');
  const timestamps = useMemo(() => computeTimestamps(timeline, chatStart, DAY_OFFSETS), [timeline, chatStart]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [timeline, isTyping, pendingChoice, pendingTip]);

  // Auto-play, no tap required anywhere: the thumbnail shows in the chat for
  // 2s, then the video overlay opens itself. Playback then runs to
  // completion on its own `ended` event (see VideoOverlay/handleVideoFinished
  // below) - nothing here assumes a fixed duration.
  useAutoMediaPreview(pendingVideo?.videoId ?? null, (videoId) => setOpenVideoId(videoId));

  // Same auto-open timing for photos, but sourced from the timeline itself:
  // dialogueTree's pendingImage only carries `{next}`, not the image payload,
  // so the actual item (src/alt/label) is whichever 'image' entry is last in
  // the timeline while a pendingImage gate is open.
  const pendingImageItem = useMemo(() => {
    if (!pendingImage) return null;
    for (let i = timeline.length - 1; i >= 0; i -= 1) {
      if (timeline[i].kind === 'image') return timeline[i];
    }
    return null;
  }, [pendingImage, timeline]);
  useAutoMediaPreview(pendingImageItem?.key ?? null, () => setLightboxItem(pendingImageItem));

  // Once the photo lightbox is open, it closes itself after 5s regardless of
  // whether the player also has a manual "close early" affordance - the
  // conversation queue only resumes once completeImage() actually fires.
  useEffect(() => {
    if (!lightboxItem) return undefined;
    const t = setTimeout(() => closeImage(), 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxItem]);

  // "goto-platform" is an invisible control node (see NODES): whenever the
  // dialogue tree reaches one, save the LINE checkpoint to resume from next
  // time (its resumeId), hand the platform whatever state patch this beat
  // implies, and hand control over to the investment platform. The switch
  // itself is deliberately paced rather than instant: a short "即將返回幣勝客"
  // system tip, then a brand transition overlay, THEN the actual route
  // change - so the player has a clear moment to register that the
  // conversation paused and the platform is coming back, instead of the
  // screen just cutting away mid-beat.
  //
  // A resumed checkpoint's restored timeline can itself already end in a
  // goto-platform item (that's exactly what was pushed right before this
  // checkpoint was saved on the previous visit) - only a NEWLY pushed one,
  // past whatever length we resumed with, should ever trigger another
  // switch. Without this guard, resuming would immediately re-fire the old
  // switch and bounce straight back to the platform before the resumed
  // dialogue ever gets a chance to render.
  const initialLengthRef = useRef(checkpoint ? checkpoint.timeline.length : 0);
  const switchedAwayRef = useRef(false);
  const [returningTip, setReturningTip] = useState(false);
  const [openingPlatform, setOpeningPlatform] = useState(false);
  useEffect(() => {
    if (switchedAwayRef.current) return undefined;
    if (timeline.length <= initialLengthRef.current) return undefined;
    const last = timeline[timeline.length - 1];
    if (!last || last.kind !== 'goto-platform') return undefined;
    switchedAwayRef.current = true;
    savePrivateChatCheckpoint(timeline, last.resumeId, watchedVideoIds);
    savePlatformState(last.patch || {});
    const timers = [];
    setReturningTip(true);
    timers.push(
      setTimeout(() => {
        setReturningTip(false);
        setOpeningPlatform(true);
        timers.push(setTimeout(() => navigate(last.route), 1500));
      }, 1200),
    );
    return () => timers.forEach(clearTimeout);
  }, [timeline, watchedVideoIds, navigate]);

  const activeSrc = openVideoId && VIDEO_SRC[openVideoId] ? VIDEO_SRC[openVideoId] : null;

  function handleVideoFinished() {
    setOpenVideoId(null);
    completeVideo();
    requestAnimationFrame(() => {
      scrollRef.current?.focus?.();
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  function closeImage() {
    setLightboxItem(null);
    completeImage();
  }

  // The link card also stays visible for a minimum beat (1.5s) before it can
  // be opened, and opening it shows the same brand transition overlay used
  // for every later platform return, instead of navigating instantly.
  const [linkClickable, setLinkClickable] = useState(false);
  useEffect(() => {
    if (!pendingLink) {
      setLinkClickable(false);
      return undefined;
    }
    const t = setTimeout(() => setLinkClickable(true), 1500);
    return () => clearTimeout(t);
  }, [pendingLink]);

  function openLink() {
    if (!pendingLink || !linkClickable) return;
    savePrivateChatCheckpoint(timeline, pendingLink.next, watchedVideoIds);
    setOpeningPlatform(true);
    setTimeout(() => navigate('/scenario02-romance/platform-landing'), 1500);
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
          const time = timestamps[i] ? formatTime(timestamps[i]) : null;
          if (item.kind === 'divider') {
            const dividerDate = addDays(chatStart, DAY_OFFSETS[item.label] ?? 0);
            return (
              <div key={i} className="line-date-divider"><span>{formatDateDivider(dividerDate)}</span></div>
            );
          }
          if (item.kind === 'video') {
            return (
              <IncomingMessage key={i} time={time}>
                <VideoThumb item={item} />
              </IncomingMessage>
            );
          }
          if (item.kind === 'image') {
            return (
              <IncomingMessage key={i} time={time}>
                <PhotoThumb item={item} />
              </IncomingMessage>
            );
          }
          if (item.kind === 'goto-platform') {
            return null;
          }
          if (item.kind === 'link') {
            return (
              <IncomingMessage key={i} time={time}>
                <LinkCard item={item} active={Boolean(pendingLink) && linkClickable} onOpen={openLink} />
              </IncomingMessage>
            );
          }
          if (item.kind === 'tip') {
            return <TipItem key={i} item={item} active={pendingTip?.key === item.key} onAck={completeTip} />;
          }
          if (item.from === 'system') {
            return <div key={i} className="line-date-divider"><span>{item.text}</span></div>;
          }
          const mine = item.from === 'user';
          const bubble = <div className={`line-msg ${mine ? 'me' : 'them'}`}>{item.text}</div>;
          return mine ? (
            <OutgoingMessage key={i} time={time}>{bubble}</OutgoingMessage>
          ) : (
            <IncomingMessage key={i} time={time}>{bubble}</IncomingMessage>
          );
        })}
        {isTyping && <div className="tanu-typing"><i /><i /><i /></div>}
      </div>
      <footer className="line-chat-footer">
        {pendingChoice && <SuggestedReplies options={pendingChoice.options} onChoose={choose} />}
      </footer>

      {activeSrc && (
        <VideoOverlay key={openVideoId} videoId={openVideoId} src={activeSrc} onFinished={handleVideoFinished} />
      )}
      {lightboxItem && <PhotoLightbox item={lightboxItem} onClose={closeImage} />}
      {returningTip && <div className="line-returning-tip">即將返回幣勝客</div>}
      {openingPlatform && <PlatformOpeningOverlay />}
    </div>
  );
}
