# Public Asset Structure

Use this folder layout for static assets served by Next.js:

- `images/auth/` - auth-related media (e.g. login cover)
- `images/branding/` - brand assets (logos)
- `images/backgrounds/` - shared section/page backgrounds
- `images/icons/` - generic SVG icons and starter assets
- `images/properties/` - property images
- `images/rooms/` - room photos
- `images/room-features/` - in-room feature/service images
- `images/booking/` - booking flow and activity visuals

Guidelines:

1. Prefer lowercase kebab-case filenames.
2. Group assets by feature/domain.
3. Keep references absolute from `/` (e.g. `/images/branding/prime-stay-logo.svg`).
4. Avoid placing media files at the root of `public/` unless required.
