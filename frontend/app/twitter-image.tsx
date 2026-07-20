// X/Twitter card image: reuses the exact same generator as opengraph-image.tsx
// rather than a separate design, so the two previews never drift apart.
// Without this file, Next.js would fall back to the og:image for Twitter
// Cards too — this just makes twitter:image an explicit, independently
// verifiable meta tag rather than relying on that fallback behavior.
export { default, alt, size, contentType } from "./opengraph-image";
