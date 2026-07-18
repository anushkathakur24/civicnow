// Single source of truth for CivicNow's crisis-support helpline data. Every
// issue page that needs the "Need support?" callout (SupportNotice.tsx)
// pulls from here — nobody hand-types a helpline number into a per-issue
// text field, so if a number ever changes, it changes once, here, and
// updates on every issue at once instead of drifting out of sync page by
// page.
//
// Numbers verified 2026-07-17 against each organization's own site:
// iCALL: https://icallhelpline.org/  ·  Vandrevala Foundation: https://www.vandrevalafoundation.com/free-counseling/contact-us
export interface SupportResource {
  name: string;
  detail: string;
  hours: string;
}

export const SUPPORT_RESOURCES: SupportResource[] = [
  { name: "iCALL (TISS)", detail: "9152987821", hours: "Mon–Sat" },
  { name: "Vandrevala Foundation", detail: "+91 9999 666 555", hours: "24×7 Call & WhatsApp" },
];
