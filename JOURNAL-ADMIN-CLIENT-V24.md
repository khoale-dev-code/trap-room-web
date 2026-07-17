# TRAP Room Journal Admin + Client V24

V24 gives Journal posts one shared presentation and one predictable workflow.

## Admin

- Search and status filters use the same `posts` array as the list.
- No unreliable statistics cards.
- List/editor split on desktop and full-screen editor on mobile.
- Title, excerpt, content, order, pinned and published fields.
- Multiple image/video media with cover ordering.
- Client preview before saving.
- Robust API response extraction for old and newer response shapes.

## Client

- `/posts` shows one priority story and a responsive story grid.
- Search is performed locally over published public-store data.
- Every card links to `/posts/:id`.
- Detail page supports multiple images/videos, article paragraphs and related
  stories.
- Homepage cards link directly to each article instead of the generic list.

## Safety

- No database migration.
- No new backend endpoint.
- No DOM mutation.
- Existing `/api/posts` and `/api/public-store` contracts remain supported.
