// MindAR settings, ported from the old js/tracker-config.js. Only the `route`
// values changed (old relative .html paths -> new router paths); everything
// else — including the "route: null means detect-only, no navigation yet"
// convention — is unchanged, so wiring up scenario 2-5 later is still just
// filling in a route string here, no logic changes in Scanner.jsx.
export const TRACKER_TARGET_SRC = `${import.meta.env.BASE_URL}assets/targets/targets.mind`;

export const TRACKER_TARGETS = [
  { index: 0, name: 'target0 / teacher', scenario: 'investment', label: '假投資', route: '/scenario01-investment' },
  { index: 1, name: 'target1 / kline', scenario: 'investment', label: '假投資', route: '/scenario01-investment' },
  { index: 2, name: 'target2 / girl', scenario: 'romance', label: '假交友', route: null },
  { index: 3, name: 'target3 / girl1', scenario: 'romance', label: '假交友', route: null },
  { index: 4, name: 'target4 / girl2', scenario: 'romance', label: '假交友', route: null },
  { index: 5, name: 'target5 / girl3', scenario: 'romance', label: '假交友', route: null },
  { index: 6, name: 'target6 / express', scenario: 'shopping', label: '假賣家', route: null },
];
