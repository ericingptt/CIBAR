import { Navigate } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { RequireLanguage } from './lib/RequireLanguage';
import { GestureIntro } from './pages/GestureIntro';
import { LanguageSelect } from './pages/LanguageSelect';
import { Scanner } from './pages/Scanner';
import { ScenarioStub } from './pages/ScenarioStub';
import { Briefing } from './pages/scenario01/Briefing';
import { Feed } from './pages/scenario01/Feed';
import { VideoTeacher } from './pages/scenario01/VideoTeacher';
import { LineTeacher } from './pages/scenario01/LineTeacher';
import { VipGroup } from './pages/scenario01/VipGroup';
import { PlatformRegister } from './pages/scenario01/PlatformRegister';
import { Profit } from './pages/scenario01/Profit';
import { Quiz } from './pages/scenario01/Quiz';
import { QuizRight } from './pages/scenario01/QuizRight';
import { QuizWrong } from './pages/scenario01/QuizWrong';
import { WithdrawFail } from './pages/scenario01/WithdrawFail';
import { AiWarning02 } from './pages/scenario01/AiWarning02';
import { Page165 } from './pages/scenario01/Page165';
import { Briefing as RomanceBriefing } from './pages/scenario02/Briefing';
import { DatingBrowse } from './pages/scenario02/DatingBrowse';
import { DatingMatch } from './pages/scenario02/DatingMatch';
import { DatingChat } from './pages/scenario02/DatingChat';
import { PrivateChat } from './pages/scenario02/PrivateChat';
import { PlatformRegister as RomancePlatformRegister } from './pages/scenario02/PlatformRegister';
import { PlatformHome } from './pages/scenario02/PlatformHome';
import { DepositPage } from './pages/scenario02/DepositPage';
import { TradingPage } from './pages/scenario02/TradingPage';
import { WithdrawalPage } from './pages/scenario02/WithdrawalPage';
import { GuaranteePage } from './pages/scenario02/GuaranteePage';
import { RiskAnalysis as RomanceRiskAnalysis } from './pages/scenario02/RiskAnalysis';
import { Quiz as RomanceQuiz } from './pages/scenario02/Quiz';
import { QuizResult as RomanceQuizResult } from './pages/scenario02/QuizResult';
import { EndingPage } from './pages/scenario02/EndingPage';

export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <GestureIntro /> },
      { path: 'language', element: <LanguageSelect /> },
      { path: 'scanner', element: <RequireLanguage><Scanner /></RequireLanguage> },

      { path: 'scenario01-investment', element: <Briefing /> },
      { path: 'scenario01-investment/feed', element: <Feed /> },
      { path: 'scenario01-investment/video-teacher', element: <VideoTeacher /> },
      { path: 'scenario01-investment/line-teacher', element: <LineTeacher /> },
      { path: 'scenario01-investment/vip-group', element: <VipGroup /> },
      { path: 'scenario01-investment/platform-register', element: <PlatformRegister /> },
      { path: 'scenario01-investment/profit', element: <Profit /> },
      { path: 'scenario01-investment/quiz', element: <Quiz /> },
      { path: 'scenario01-investment/quiz/right', element: <QuizRight /> },
      { path: 'scenario01-investment/quiz/wrong', element: <QuizWrong /> },
      { path: 'scenario01-investment/withdraw-fail', element: <WithdrawFail /> },
      { path: 'scenario01-investment/ai-warning-02', element: <AiWarning02 /> },
      { path: 'scenario01-investment/165', element: <Page165 /> },

      { path: 'scenario02-romance', element: <RomanceBriefing /> },
      { path: 'scenario02-romance/dating-browse', element: <DatingBrowse /> },
      { path: 'scenario02-romance/dating-match', element: <DatingMatch /> },
      { path: 'scenario02-romance/dating-chat', element: <DatingChat /> },
      { path: 'scenario02-romance/private-chat', element: <PrivateChat /> },
      { path: 'scenario02-romance/platform-register', element: <RomancePlatformRegister /> },
      { path: 'scenario02-romance/platform-home', element: <PlatformHome /> },
      { path: 'scenario02-romance/deposit', element: <DepositPage /> },
      { path: 'scenario02-romance/trading', element: <TradingPage /> },
      { path: 'scenario02-romance/withdrawal', element: <WithdrawalPage /> },
      { path: 'scenario02-romance/guarantee', element: <GuaranteePage /> },
      { path: 'scenario02-romance/risk-analysis', element: <RomanceRiskAnalysis /> },
      { path: 'scenario02-romance/quiz', element: <RomanceQuiz /> },
      { path: 'scenario02-romance/quiz-result', element: <RomanceQuizResult /> },
      { path: 'scenario02-romance/ending', element: <EndingPage /> },

      { path: 'scenario03-police', element: <ScenarioStub /> },
      { path: 'scenario04-shopping', element: <ScenarioStub /> },
      { path: 'scenario05-atm', element: <ScenarioStub /> },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];
