// Shared helper for turning a source URL into a short, honest label — the
// domain it actually points to, never a guessed or hand-typed publisher
// name. Used anywhere we link out to a source (issue-level Sources list,
// help-action citations) so a reader always knows where a link goes before
// clicking it, instead of an opaque "[1]".
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
