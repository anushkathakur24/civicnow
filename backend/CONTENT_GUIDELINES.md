# Issue-authoring content guidelines

This is the checklist for adding or editing an issue on CivicNow — whether
through the seed script or (eventually) an editorial/admin tool. It exists so
content quality doesn't depend on any one person remembering to do it well;
every issue, present or future, is held to the same standard automatically.

## 1. Sensitive content — `sensitive_content` / `support_note_visible`

Every issue must make an explicit decision on `Issue.sensitive_content`:

- Set `sensitive_content=True` if the subject matter genuinely involves
  **suicide, self-harm, violence, or similar distress** — not just "this is a
  hard topic." A governance dispute or a compliance deadline is not
  sensitive content on its own; student suicides linked to an exam crisis is.
- When `True`, the standardized `SupportNotice` component (see
  `frontend/components/SupportNotice.tsx`) renders automatically on the issue
  page. Its helpline copy comes from one shared file,
  `frontend/lib/supportResources.ts` — **never hand-type a helpline number
  into `sensitive_note` or anywhere else.** If a number changes, it's edited
  in that one file and every issue picks up the change.
- `sensitive_note` is now just optional short *context* (e.g. "This issue
  involves student suicides and an active hunger strike") shown inside the
  callout, not the mechanism that displays it. It can be `None`.
- `support_note_visible` defaults to `True` and should almost always stay
  that way if `sensitive_content=True`. It exists as an explicit editorial
  override for a documented exception, not a routine toggle — don't flip it
  off to "clean up" a page.

## 2. Sourced "How you can help" — `help_actions`

Every issue with a live/ongoing status needs a `help_actions` list: real,
concrete, sourced actions anyone can take, independent of the visitor's role.
This is separate from the role-matched `ActionDefinition` picker (Citizen,
Lawyer, Software Engineer, etc.) — both appear on the page, in that order,
and are never merged into one list.

**Minimum bar before an issue can be published:**

- At least **2–3** `HelpAction` rows for any issue that isn't resolved/
  historical. (The seed script enforces this with a runtime assertion — see
  the bottom of `scripts/seed.py`. If you're adding issues outside the seed
  script, apply the same check by hand until an admin tool enforces it.)
- Resolved/historical issues may have a lighter version of this section, or
  omit it entirely if there's genuinely nothing actionable left — don't pad
  a dead issue with actions to hit a number.

**Every single `HelpAction` must have:**

- At least one real, checkable `source_urls` entry — a news article,
  official government page, an actual petition, an actual organization's own
  site. Never a source you couldn't hand someone a working link to.
- Specific, not generic, `description` copy. "Share on social media" is not
  acceptable by itself — name the actual platform/hashtag/account being used
  by the real movement (only if you can source that it's actually being
  used), the actual petition name and link, the actual representative or
  body to contact and how, the actual location and what's needed for a
  physical/on-the-ground action.
- **If a specific detail can't be sourced, don't include it.** Use a more
  general but still real and verifiable action instead of inventing a
  hashtag, petition name, or contact detail to sound more specific than the
  research actually supports. (See the Ladakh issue's "amplify" action for
  an example: no verified campaign hashtag existed at time of writing, so
  the action points to real outlets and organizations instead.)
- A `last_verified` date. Re-check ongoing/live actions (an active hunger
  strike, a live petition, a protest with a specific date) periodically —
  when something is no longer current, set `still_active=False` rather than
  leaving it live with outdated urgency. The public API automatically
  excludes rows where `still_active` is `False`; the row stays in the
  database for audit history, it just stops being shown.
- Stay within the issue's own stated framing. If the issue page presents
  something neutrally (e.g. "track municipal compliance," not "support or
  oppose this ruling"), the help actions should too — don't let an action
  smuggle in an advocacy position the issue itself doesn't take.

## 3. Where this is enforced today, and where it isn't yet

- The seed script (`scripts/seed.py`) asserts the `help_actions` minimum at
  seed time — a genuine, if blunt, guardrail.
- `Issue.status` is currently a free-text field ("ongoing", "in
  negotiation", "compliance deadline approaching"), not a controlled enum
  with a single canonical "resolved" value. Until that's tightened, use
  judgment: if an issue isn't clearly closed/historical, treat it as needing
  the `help_actions` minimum.
- There's no admin/editorial UI yet — all of this is enforced by convention
  and this document, plus the one hard assertion in the seed script. If/when
  an admin tool for authoring issues is built, these same checks belong
  there as real validation, not just documentation.
