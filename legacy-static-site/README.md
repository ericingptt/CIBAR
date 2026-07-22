# Legacy static site (archived)

This is the original pre-React prototype (plain HTML/CSS/JS, including the
hand-gesture tutorial/calibration flow and the scenario01 static pages). It's
kept here for reference only and is no longer served — the live site is
built from `webapp/` via `.github/workflows/deploy-pages.yml`.

It was moved out of the repo root because GitHub Pages, when its Pages
source is set to "Deploy from a branch", serves whatever is at the repo
root directly — which was silently overriding the actual `webapp/`
deployment and getting anyone with a previously-registered service worker
stuck on this old gesture-tutorial flow (including a `camera-error` state
with no way forward).

To bring any of this back: move the relevant files back to the repo root
(or copy specific pieces into `webapp/` and port them properly, which is
how scenario01 and the gesture module were already migrated).
