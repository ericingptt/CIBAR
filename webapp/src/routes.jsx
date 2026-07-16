import { Navigate } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { RequireLanguage } from './lib/RequireLanguage';
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

export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LanguageSelect /> },
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

      { path: 'scenario02-romance', element: <ScenarioStub /> },
      { path: 'scenario03-police', element: <ScenarioStub /> },
      { path: 'scenario04-shopping', element: <ScenarioStub /> },
      { path: 'scenario05-atm', element: <ScenarioStub /> },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];
