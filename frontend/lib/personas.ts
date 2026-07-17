// Single source of truth for personas, used by registration, the issue-level
// action picker, and anywhere else that needs to render or validate a
// persona. Matches `ActionDefinition.persona_id` values seeded in
// backend/scripts/seed.py — if you add a persona here, add matching
// ActionDefinition rows there, or it'll just show an honest empty state
// rather than a fabricated recommendation.

export interface Persona {
  id: string;
  label: string;
  blurb: string;
}

export const PERSONAS: Persona[] = [
  { id: "citizen", label: "Citizen", blurb: "General civic participation" },
  { id: "content_creator", label: "Content Creator", blurb: "Reach and awareness" },
  { id: "working_professional", label: "Working Professional", blurb: "Time, funds, and networks" },
  { id: "government_official", label: "Government Official", blurb: "Institutional accountability" },
  { id: "software_engineer", label: "Software Engineer", blurb: "Open-source civic tooling" },
  { id: "lawyer", label: "Lawyer", blurb: "RTIs and legal support" },
  { id: "doctor", label: "Doctor", blurb: "Health camps and clinical support" },
  { id: "student", label: "Student", blurb: "Translation and local reach" },
];

export function personaLabel(id: string | null | undefined): string {
  return PERSONAS.find((p) => p.id === id)?.label ?? "Citizen";
}
