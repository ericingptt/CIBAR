import { useNavigate } from 'react-router-dom';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';
import { MatchOverlay } from './tanu/MatchOverlay';

const EMILY = {
  name: 'Emily',
  photo: `${import.meta.env.BASE_URL}assets/scenarios/scenario-02/images/profiles/emily.png`,
};

// Normal play never routes here - liking Emily's card in DatingBrowse shows
// MatchOverlay directly as an overlay on that same screen (no page jump, per
// the design note). This route exists only so /dating-match stays a stable,
// directly-linkable URL for testing this one beat in isolation.
export function DatingMatch() {
  useSaveScenario02Progress('/scenario02-romance/dating-match');
  const navigate = useNavigate();
  return (
    <MatchOverlay person={EMILY} isEmily onStart={() => navigate('/scenario02-romance/dating-chat')} />
  );
}
