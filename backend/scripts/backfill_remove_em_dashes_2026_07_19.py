"""One-off backfill: rewrite user-visible copy that used em/en dashes as a
sentence connector ("X — Y") into plain punctuation (periods, commas,
colons), per direct user feedback that the dash-heavy phrasing read as
AI-generated. This does NOT touch code comments/docstrings (never rendered
on the site) or hyphens in compound words (self-hosted, cost-effective,
etc.) — only the actual field values that render as text on issue pages:
Issue.title/accountability_mechanism, Source.title, TimelineEvent.event_text,
ResponsibleBody.body_name, HelpAction.description, ActionDefinition.action_text.

Matching strategy, in order of preference:
  - Source: matched by `url` (unique, stable, unaffected by the text change)
    and title is SET unconditionally to the correct final value.
  - TimelineEvent: matched by (issue_id, event_date) (stable) and event_text
    is SET unconditionally.
  - HelpAction: matched by (issue_id, action_type, title) — title itself
    never had a dash, so this key is stable — and description is SET
    unconditionally to the correct final value, regardless of whether the
    row currently holds the original or the since-updated (e.g. Wangchuk
    hospitalisation) description.
  - Issue, ResponsibleBody: matched by natural id / exact old text.
  - ActionDefinition: no stable secondary key exists (no title column), so
    these are matched by (issue_id, persona_id, OLD action_text) — the exact
    text as authored before this cleanup — and updated to the new text. Safe
    to re-run: once updated, the OLD text no longer matches, so a second run
    is a no-op rather than a duplicate/incorrect update.

Run once against production with the real DATABASE_URL, e.g.:
    DATABASE_URL=<your production URL> python3 scripts/backfill_remove_em_dashes_2026_07_19.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
from app.db.session import SessionLocal
from app.models.civic import Issue, Source, TimelineEvent, ResponsibleBody, HelpAction, ActionDefinition

db = SessionLocal()

# ---- 1. Issue fields --------------------------------------------------------

issues_updated = 0
issue3 = db.query(Issue).filter(Issue.id == "sc-stray-dog-verdict").first()
if issue3 and issue3.title != "Supreme Court Stray Dog Verdict: Municipal Compliance Tracker":
    issue3.title = "Supreme Court Stray Dog Verdict: Municipal Compliance Tracker"
    issues_updated += 1

issue1 = db.query(Issue).filter(Issue.id == "neet-2026-leak").first()
NEW_ACCOUNTABILITY = (
    "The Public Examinations (Prevention of Unfair Means) Act, 2024 criminalises leaks and "
    "organised cheating. Track whether any arrests/prosecutions under this Act have resulted "
    "from the NEET-UG 2026 leak specifically."
)
if issue1 and issue1.accountability_mechanism != NEW_ACCOUNTABILITY:
    issue1.accountability_mechanism = NEW_ACCOUNTABILITY
    issues_updated += 1

# ---- 2. ResponsibleBody ------------------------------------------------------

bodies_updated = 0
nta = (
    db.query(ResponsibleBody)
    .filter(ResponsibleBody.issue_id == "neet-2026-leak", ResponsibleBody.body_name.like("National Testing Agency%"))
    .first()
)
if nta and nta.body_name != "National Testing Agency (NTA)":
    nta.body_name = "National Testing Agency (NTA)"
    bodies_updated += 1

# ---- 3. Sources: matched by url, title set unconditionally -----------------

SOURCE_TITLES = {
    "https://www.aljazeera.com/news/2026/7/14/indian-activist-wangchuk-urged-to-end-hunger-strike-over-exam-paper-leaks":
        "Indian activist Wangchuk urged to end hunger strike over exam paper leaks",
    "https://www.cnn.com/2026/07/15/world/video/hunger-strike-sonam-wangchuk-india-education-exams-mogul-ldn-digvid":
        "Two weeks of hunger in protest of India's exam system",
    "https://www.deccanherald.com/india/sonam-wangchuk-enters-critical-stage-of-hunger-strike-on-day-19-loses-over-9-kg-doctors-warn-of-organ-damage-4075690":
        "Sonam Wangchuk enters critical stage of hunger strike on day 19",
    "https://www.cnn.com/2026/06/26/india/india-cockroach-janta-party-delhi-protest-intl-hnk":
        "Cockroach Janta Party: India's viral youth movement hits the streets of the capital",
    "https://www.aljazeera.com/news/2026/6/21/indias-cockroach-movement-camps-out-until-education-minister-resigns":
        "India's 'Cockroach' movement camps out until education minister resigns",
    "https://www.aljazeera.com/news/2026/5/26/come-back-my-son-indian-exam-leak-leaves-trail-of-death-despair-anger":
        "'Come back, my son': Indian exam leak leaves trail of death, despair, anger",
    "https://www.outlookindia.com/national/neet-ug-2026-paper-leak-scandal-collapse-of-trust-student-suicides-and-indias-medical-entrance-crisis":
        "NEET-UG 2026 Paper Leak Scandal: Collapse of Trust, Student Suicides and India's Medical Entrance Crisis",
    "https://www.outlookindia.com/amp/story/national/13-reported-suicides-after-neet-paper-leak":
        "13 Reported Suicides After NEET Paper Leak",
    "https://www.livelaw.in/high-court/delhi-high-court/sonam-wangchuk-hunger-strike-centre-delhi-govt-response-sought-541299":
        "'Urgent': Delhi High Court Seeks Centre, Delhi Govt Stand On Plea Seeking To End Sonam Wangchuk's Hunger Strike",
    "https://www.brut.media/in/articles/india/society/sonam-wangchuk-hunger-strike-live-delhi-hc-hearing-health-updates-today":
        "Sonam Wangchuk Hunger Strike Live: Delhi HC Hearing, Health Updates",
    "https://theprint.in/politics/delhi-police-shift-wangchuk-to-hospital-cjps-dipke-alleges-activist-taken-by-force/2989669/":
        "Delhi Police 'shift' Wangchuk to hospital, CJP's Dipke alleges activist taken 'by force'",
    "https://www.indiatvnews.com/news/india/why-was-sonam-wangchuk-shifted-to-safdarjung-hospital-and-protesters-removed-from-jantar-mantar-explained-2026-07-18-1048628":
        "Why was Sonam Wangchuk shifted to Safdarjung Hospital and protesters removed from Jantar Mantar, explained",
    "https://www.livemint.com/politics/news/sonam-wangchuk-5-hunger-strikes-explained-causes-outcomes-and-the-jantar-mantar-protest-dipke-cjp-neet-pradhan-11784174825356.html":
        "Sonam Wangchuk hunger strike: 5 hunger strikes explained",
    "https://www.outlookindia.com/art-entertainment/sonam-wangchuk-hunger-strike-60-public-figures-urge-him-to-stop-fast":
        "Sonam Wangchuk Hunger Strike: 60 Public Figures Urge Him To Stop Fast",
    "https://www.aljazeera.com/news/2026/3/14/india-releases-ladakh-activist-sonam-wangchuk-after-six-months-in-jail":
        "India releases Ladakh activist Sonam Wangchuk after six months in jail",
    "https://www.newslaundry.com/2026/03/17/talks-are-a-give-and-take-sonam-wangchuk-on-6th-schedule-statehood-and-being-flexible":
        "'Talks are a give-and-take': Sonam Wangchuk on 6th schedule, statehood",
    "https://www.theweek.in/news/india/2026/03/14/centre-revokes-sonam-wangchuks-nsa-detention-signals-fresh-opening-for-dialogue-in-ladakh.html":
        "Centre revokes Sonam Wangchuk's NSA detention, signals fresh opening for dialogue",
    "https://www.scobserver.in/journal/what-did-the-supreme-court-hold-on-the-stray-dogs-matter/":
        "What did the Supreme Court hold on the stray-dogs matter?",
}

sources_updated = 0
for url, new_title in SOURCE_TITLES.items():
    src = db.query(Source).filter(Source.url == url).first()
    if src and src.title != new_title:
        src.title = new_title
        sources_updated += 1

# ---- 4. TimelineEvents: matched by (issue_id, event_date) ------------------

TIMELINE_TEXT = {
    ("neet-2026-leak", date(2026, 5, 26)):
        "At least 13 student suicides are linked to the crisis in compiled police and media reports, "
        "as the forced re-test drags on. This is a sensitive, actively-reported figure. See sources "
        "below rather than treating it as final.",
    ("neet-2026-leak", date(2026, 7, 18)):
        "On day 21 of the fast, Delhi Police remove Wangchuk from Jantar Mantar and shift him to "
        "Safdarjung Hospital following the High Court's directions; CJP's Dipke alleges he was taken "
        "'by force'. He remains under continuous medical monitoring and has not called off his fast. "
        "This is a contested characterization. See sources below rather than treating either account "
        "as settled.",
    ("ladakh-sixth-schedule", date(2026, 3, 17)):
        "In his first public remarks after release, Wangchuk says both sides must stay 'flexible': "
        "Ladakh would accept either full statehood or Sixth Schedule protections, ideally both.",
}

events_updated = 0
for (issue_id, event_date), new_text in TIMELINE_TEXT.items():
    ev = db.query(TimelineEvent).filter(TimelineEvent.issue_id == issue_id, TimelineEvent.event_date == event_date).first()
    if ev and ev.event_text != new_text:
        ev.event_text = new_text
        events_updated += 1

# ---- 5. HelpActions: matched by (issue_id, action_type, title) -------------

HELP_ACTION_DESCRIPTIONS = {
    ("neet-2026-leak", "amplify", "Amplify on Social Media"):
        "The Cockroach Janta Party's Instagram (@cockroachjantaparty, 20M+ followers) and the "
        "#CockroachJantaParty hashtag are the active, verified channels for this movement. Share "
        "confirmed updates through these rather than starting new, unverified threads.",
    ("neet-2026-leak", "petition", "Sign and Share the Petition"):
        "An active Change.org petition calls for Education Minister Dharmendra Pradhan's resignation "
        "over the NEET-UG 2026 leak. Check the live signature count and add yours at the link below.",
    ("neet-2026-leak", "physical", "Show Physical Solidarity"):
        "Wangchuk was removed from Jantar Mantar by Delhi Police on July 18 (day 21) and hospitalised "
        "at Safdarjung under High Court-ordered medical monitoring. The situation is changing fast, so "
        "confirm the CJP sit-in's current status and any march plans through their official channels "
        "before attending, rather than assuming the June 21 encampment logistics still hold.",
    ("neet-2026-leak", "monitor", "Track the Court-Ordered Medical Oversight"):
        "A Delhi High Court PIL filed July 15 led to a directive for daily clinical monitoring of "
        "Wangchuk's health, and preceded his July 18 hospitalisation. This is a real, ongoing legal "
        "proceeding with implications for protester-welfare obligations beyond this one case.",
    ("ladakh-sixth-schedule", "amplify", "Follow and Share Verified Reporting"):
        "No single verified campaign hashtag exists for this movement. Instead, follow and share "
        "reporting directly from Ladakh-focused outlets and joint statements from the Leh Apex Body "
        "and Kargil Democratic Alliance, rather than amplifying unverified claims.",
    ("ladakh-sixth-schedule", "monitor", "Track the Dialogue Committee's Progress"):
        "The Leh Apex Body and Kargil Democratic Alliance submitted a detailed 40-page draft proposal "
        "to the Home Ministry in early 2026. Follow their joint statements for the Centre's response "
        "rather than relying on secondhand summaries.",
    ("sc-stray-dog-verdict", "monitor", "File an RTI on Your District's Compliance"):
        "States must file compliance affidavits by August 7, 2026, with a consolidated report due to "
        "the Supreme Court by November 17, 2026. File an RTI with your municipal corporation asking "
        "for its current ABC (Animal Birth Control) centre count and relocation status ahead of these "
        "deadlines.",
    ("sc-stray-dog-verdict", "volunteer", "Volunteer at an AWBI-Recognised ABC Centre"):
        "Veterinarians and volunteers can offer sterilisation, vaccination, or shelter-support hours "
        "directly through Animal Welfare Board of India-recognised organisations. Verify an "
        "organisation's AWBI recognition before volunteering.",
    ("sc-stray-dog-verdict", "donate", "Support a Vetted Shelter's ABC Programme"):
        "Established shelters running Animal Birth Control programmes rely on donations for food, "
        "sterilisation surgeries, and vaccination drives. Confirm an organisation's registration and "
        "AWBI recognition before giving.",
}

help_actions_updated = 0
for (issue_id, action_type, title), new_desc in HELP_ACTION_DESCRIPTIONS.items():
    ha = (
        db.query(HelpAction)
        .filter(HelpAction.issue_id == issue_id, HelpAction.action_type == action_type, HelpAction.title == title)
        .first()
    )
    if ha and ha.description != new_desc:
        ha.description = new_desc
        help_actions_updated += 1

# ---- 6. ActionDefinitions: matched by (issue_id, persona_id, OLD action_text) --
# No stable secondary key exists here, so this list is (issue_id, persona_id,
# OLD text, NEW text) — matched on the OLD text as it was actually authored/
# deployed, so this is safe to re-run (a second pass finds no OLD-text match
# and changes nothing).

ACTION_TEXT_UPDATES = [
    ("neet-2026-leak", "software_engineer",
     "Build or contribute to an open-source dashboard tracking RTI response times from the Ministry "
     "of Education/NTA on the leak investigation — public transparency tooling is the highest-leverage "
     "thing a technical volunteer can do here.",
     "Build or contribute to an open-source dashboard tracking RTI response times from the Ministry "
     "of Education/NTA on the leak investigation. Public transparency tooling is the highest-leverage "
     "thing a technical volunteer can do here."),
    ("neet-2026-leak", "doctor",
     "Volunteer clinical hours with an established helpline (iCall, Vandrevala Foundation) supporting "
     "affected students — don't DM students directly, route through the organisations already doing "
     "this safely.",
     "Volunteer clinical hours with an established helpline (iCall, Vandrevala Foundation) supporting "
     "affected students. Don't DM students directly; route through the organisations already doing "
     "this safely."),
    ("neet-2026-leak", "student",
     "Translate the verified timeline and mental-health helpline numbers into your regional language "
     "and share through student networks — English/Hindi coverage misses a large share of affected "
     "students.",
     "Translate the verified timeline and mental-health helpline numbers into your regional language "
     "and share through student networks. English/Hindi coverage misses a large share of affected "
     "students."),
    ("neet-2026-leak", "citizen",
     "Share only confirmed updates on Wangchuk's hospitalisation from named outlets (LiveLaw, The "
     "Print, India TV News) — whether he was moved voluntarily or 'by force' is actively disputed, "
     "and unverified clips are spreading faster than corrections.",
     "Share only confirmed updates on Wangchuk's hospitalisation from named outlets (LiveLaw, The "
     "Print, India TV News). Whether he was moved voluntarily or 'by force' is actively disputed, "
     "and unverified clips are spreading faster than corrections."),
    ("neet-2026-leak", "lawyer",
     "Track the Delhi High Court's July 15 PIL ordering daily clinical monitoring of Wangchuk — it's "
     "a live proceeding with implications for protester-welfare obligations during hunger strikes "
     "generally, not just this case.",
     "Track the Delhi High Court's July 15 PIL ordering daily clinical monitoring of Wangchuk. It's "
     "a live proceeding with implications for protester-welfare obligations during hunger strikes "
     "generally, not just this case."),
    ("neet-2026-leak", "doctor",
     "Help counter medical misinformation circulating about hunger-strike risk and post-fast recovery "
     "alongside Wangchuk's hospitalisation — route corrections through a medical association or "
     "established outlet, not direct outreach to him or his family.",
     "Help counter medical misinformation circulating about hunger-strike risk and post-fast recovery "
     "alongside Wangchuk's hospitalisation. Route corrections through a medical association or "
     "established outlet, not direct outreach to him or his family."),
    ("neet-2026-leak", "content_creator",
     "Cover the hospitalisation citing named outlets rather than unverified social clips — the "
     "'voluntary vs. forced removal' question is genuinely contested right now, and getting it wrong "
     "either direction does real harm.",
     "Cover the hospitalisation citing named outlets rather than unverified social clips. The "
     "'voluntary vs. forced removal' question is genuinely contested right now, and getting it wrong "
     "either direction does real harm."),
    ("neet-2026-leak", "public_figure",
     "Use a named, public platform the way Zeenat Aman, Swara Bhaskar, Prakash Raj, and the 60+ "
     "writers/academics who signed an open letter have — a public, attributable appeal for government "
     "dialogue and de-escalation carries more institutional weight than an anonymous share.",
     "Use a named, public platform the way Zeenat Aman, Swara Bhaskar, Prakash Raj, and the 60+ "
     "writers/academics who signed an open letter have: a public, attributable appeal for government "
     "dialogue and de-escalation carries more institutional weight than an anonymous share."),
    ("ladakh-sixth-schedule", "software_engineer",
     "Offer to help the Leh Apex Body or Kargil Democratic Alliance digitize and publish primary "
     "documents (dialogue committee minutes, Sixth Schedule proposals) if they lack technical "
     "capacity — contact them directly before building anything unsolicited.",
     "Offer to help the Leh Apex Body or Kargil Democratic Alliance digitize and publish primary "
     "documents (dialogue committee minutes, Sixth Schedule proposals) if they lack technical "
     "capacity. Contact them directly before building anything unsolicited."),
    ("sc-stray-dog-verdict", "software_engineer",
     "Build a simple public tracker (even a spreadsheet + map) of which districts have published ABC "
     "centre compliance status ahead of the August 7 deadline — most citizens have no visibility into "
     "this right now.",
     "Build a simple public tracker (even a spreadsheet + map) of which districts have published ABC "
     "centre compliance status ahead of the August 7 deadline. Most citizens have no visibility into "
     "this right now."),
]

actions_updated = 0
for issue_id, persona_id, old_text, new_text in ACTION_TEXT_UPDATES:
    row = (
        db.query(ActionDefinition)
        .filter(ActionDefinition.issue_id == issue_id, ActionDefinition.persona_id == persona_id, ActionDefinition.action_text == old_text)
        .first()
    )
    if row:
        row.action_text = new_text
        actions_updated += 1

db.commit()
print(
    f"Backfill complete: {issues_updated} issue field(s), {bodies_updated} responsible-body name(s), "
    f"{sources_updated} source title(s), {events_updated} timeline event(s), "
    f"{help_actions_updated} help-action description(s), {actions_updated} action_definition(s) updated."
)
