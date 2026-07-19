# TRAP Room Chrome Mobile Footer Gap V27

## Symptom

On a real mobile Chrome session, the browser can reopen the page near the
footer while the React content is still restoring. The public layout also used
`min-h-screen` without a flex column, so any remaining viewport height could
appear after the footer as a large white block.

## Fix

V27 applies two complementary corrections:

1. `PublicLayout` becomes a flex column.
   - Header remains at the top.
   - Public content grows in the middle.
   - Footer remains the last visual block.
   - Extra viewport height is assigned to the content area, never below footer.

2. Scroll restoration is disabled before React starts.
   - `index.html` sets `history.scrollRestoration = "manual"`.
   - `RouteScrollManager` performs guarded delayed resets on initial route
     rendering and BFCache restore.
   - Delayed resets stop immediately after the visitor touches, scrolls or
     presses a key, so the page does not fight normal interaction.

The CSS uses `100svh` with a `100vh` fallback and includes mobile safe-area
padding.
