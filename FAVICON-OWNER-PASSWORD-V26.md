# TRAP Room — Favicon + Owner Password V26

## Browser icon

Store Settings now includes **Use logo as browser icon** under Store logo.

The selected URL is stored as `shop.faviconUrl`. `SiteMeta` reads the public
store and renders React metadata for:

- browser favicon;
- shortcut icon;
- Apple touch icon;
- page title;
- description and Open Graph image.

Use a square PNG, WEBP or SVG for the clearest browser-tab result. The browser
tab updates after Save changes and refresh. Search-engine result favicons can
take longer because search engines must crawl the site again.

## Owner password handoff

The first owner password still comes from Railway `ADMIN_PASSWORD`.

After the owner changes it in Admin:

- only the scrypt hash and random salt are stored in MongoDB;
- the plaintext password is never stored;
- the MongoDB password overrides the Railway bootstrap password;
- other owner sessions are revoked through `passwordVersion`;
- the current browser receives a fresh session cookie;
- staff password changing continues to use the Employee account.

Keep Railway `ADMIN_PASSWORD` configured. It remains the bootstrap fallback
only while no owner credential exists in MongoDB.
