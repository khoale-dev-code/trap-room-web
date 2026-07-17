# TRAP Room Gallery Workflow V23

This patch reorganizes the Gallery Admin page around the actual work:

1. Choose a publishing action.
2. Search and filter in one compact control center.
3. Select, edit, reorder or publish items.
4. Open the guide only when it is needed.

## Action meaning

- **Upload separate items**: every selected file becomes one independent
  Gallery record. This is suitable for quickly adding several unrelated
  photos or videos.
- **Create media group**: creates one Gallery record with a title,
  description and several media files. This is suitable for one event,
  collection or story.

## Layout changes

- Removes the large standalone filter panel.
- Combines search, category, visibility, media type and view mode.
- Changes the permanent guide into a compact collapsible guide.
- Adds one Clear filters action.
- Keeps horizontal filter scrolling on narrow mobile screens.
- Keeps list/editor state entirely inside React.
- Does not add counters, DOM mutation, polling or a new API route.
- Reconnects the Admin topbar to the active tab and remounts it when the tab
  changes, preventing a stale Overview title while Gallery is selected.
