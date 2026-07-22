# Scenario assets

Per-scenario media lives under `public/assets/scenarios/scenario-0N/`, split
by kind (`images/`, `videos/`, `audio/`), with images further split by what
they're for. Adding scenario03/04/05 just means adding `scenario-03/`,
`scenario-04/`, `scenario-05/` siblings here - keeps each scenario's dozens
of images/clips from ending up in one flat, unsearchable folder as more
scenarios are built out.

Current scenario-02 (dating/romance) subfolders, referenced from
`src/pages/scenario02/`:

- `images/profiles/` - swipe-card and profile photos (Sophie, Lina, Emily, ...)
- `images/chat/` - chat avatars
- `images/platform/` - fake investment-platform screenshots/charts
- `images/ui/` - brand/UI assets (e.g. the SPARK logo, if ever swapped for a
  real image instead of the inline SVG in `src/pages/scenario02/spark/SparkLogo.jsx`)
- `videos/` - the three affection-stage video moments in PrivateChat
- `audio/` - match/message/warning sound effects

None of scenario-02's actual media files exist yet (no photos, video clips,
or sound effects have been supplied) - only this folder structure and the
`.gitkeep` placeholders. The UI code that will consume them (DatingBrowse,
PrivateChat's video nodes, MatchOverlay's sound cue) is written to degrade
gracefully without them: photos fall back to an initial-letter avatar,
sound playback is wrapped in a no-op-on-failure try/catch. Drop matching
files in and wire up the `<img>`/`<video>`/`Audio()` calls once they exist.
