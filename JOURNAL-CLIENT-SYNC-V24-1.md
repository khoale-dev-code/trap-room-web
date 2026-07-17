# TRAP Room Journal Admin → Client Sync V24.1

## Root cause

The public client reloads when `subscribeDataChanged()` receives a mutation
event. The structured API request function introduced during the architecture
foundation kept the `notifyDataChanged` import but no longer called it after a
successful mutation. Admin could save a Journal post, while an already-open
Client tab kept its old `public-store` state.

## Fix

- Restores mutation events in the central API request function.
- Marks Journal mutations with `resource: "posts"`.
- Normalizes legacy and nested public-store response shapes.
- Accepts `posts`, `journalPosts` or `items`.
- Synchronizes `isPublished` and legacy `isActive`.
- Makes the public-store query respect both visibility fields.
- Keeps published posts visible after a hard refresh and updates open Client
  tabs immediately after Admin save, publish, hide or delete.

No MongoDB documents are deleted and no DOM mutation is used.
