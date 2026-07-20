import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Site-wide social preview card — shown when a CivicNow link is shared on
// LinkedIn, Instagram (link stickers), WhatsApp, or X. Generated with
// next/og rather than a static PNG so it always matches the site's actual
// brand tokens (colors, wordmark, tagline) instead of drifting out of sync
// with a hand-exported image file.
export const alt = "CivicNow — Know More. Do More.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

// Fraunces is the site's real display serif (see app/layout.tsx), so the OG
// card should use it too rather than a generic fallback. Bundled as a static
// font file (assets/fonts) instead of fetched from Google Fonts at
// generation time: next/og (Satori) needs raw font bytes either way, and
// reading a local file avoids a runtime network dependency on Google's
// servers for every card render. Wrapped in try/catch purely as a safety
// net (e.g. the asset going missing); the card still renders correctly with
// next/og's built-in default font if this ever fails.
async function loadFraunces(): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), "assets/fonts/Fraunces-SemiBold.woff"));
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const frauncesData = await loadFraunces();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FBF9F4",
          position: "relative",
        }}
      >
        {/* Quiet warm glow, echoing the site's hero background treatment */}
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -140,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(rgba(217,127,46,0.35), rgba(217,127,46,0))",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(rgba(14,124,123,0.16), rgba(14,124,123,0))",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "10px",
              color: "#B5651E",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            CivicNow
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 600,
              lineHeight: 1.08,
              color: "#18160F",
              fontFamily: frauncesData ? "Fraunces" : undefined,
              textAlign: "center",
            }}
          >
            Know More.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 600,
              lineHeight: 1.08,
              color: "#18160F",
              fontFamily: frauncesData ? "Fraunces" : undefined,
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            Do More.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "rgba(24,22,15,0.55)",
              textAlign: "center",
            }}
          >
            Every issue deserves more than a repost.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: frauncesData
        ? [{ name: "Fraunces", data: frauncesData, weight: 600, style: "normal" }]
        : undefined,
    },
  );
}
