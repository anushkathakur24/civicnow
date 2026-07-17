// Thin fetch wrapper around the CivicNow FastAPI backend.
//
// Auth model: the backend issues a JWT bearer token (see backend/app/api/v1/routers/auth.py).
// We keep that token in localStorage under `civicnow_token`. This is a deliberate,
// documented exception to "no user data in localStorage" (see DEPLOYMENT.md /
// PRODUCTION_CHECKLIST.md): the token is an opaque auth credential, not user data —
// Impact Score, submissions, and profile fields are always re-fetched from the API,
// never cached or derived client-side. A same-site httpOnly-cookie session is the
// stronger option if frontend and API ever share a parent domain in production;
// tracked as a follow-up in DEPLOYMENT.md.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const TOKEN_KEY = "civicnow_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });

  if (!res.ok) {
    let detail: unknown = undefined;
    try {
      detail = await res.json();
    } catch {
      // no JSON body
    }
    const message =
      (detail && typeof detail === "object" && "detail" in detail && typeof (detail as any).detail === "string"
        ? (detail as any).detail
        : undefined) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, detail);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ---- Typed domain helpers -------------------------------------------------

export interface IssueSummary {
  id: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  summary: string;
}

export interface TimelineEvent {
  event_date: string;
  event_text: string;
}

export interface PromiseItem {
  made_by: string;
  promise_text: string;
  deadline_date: string | null;
  status: string;
}

export interface SourceItem {
  title: string;
  url: string;
}

export interface IssueDetail extends IssueSummary {
  current_ask: string | null;
  accountability_mechanism: string | null;
  sensitive_note: string | null;
  timeline: TimelineEvent[];
  promises: PromiseItem[];
  sources: SourceItem[];
  responsible_bodies: string[];
}

export interface ActionDefinition {
  id: number;
  action_text: string;
  impact: "high" | "medium" | "low";
  category: string;
  verification_method: string;
  base_points: number;
  effort_hours: number | null;
  cost_inr: number | null;
  recurring: boolean;
}

export interface ScoreBreakdown {
  impact_score: number;
  tier: string;
  issues_supported: number;
  rti_grievance_count: number;
  volunteering_count: number;
  awareness_count: number;
  donation_count: number;
  advocacy_count: number;
  current_streak: number;
}

export interface UserPublic {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  city: string | null;
  persona_id: string | null;
  created_at: string;
}

export interface LeaderboardRow {
  rank: number;
  username: string;
  display_name: string;
  city: string | null;
  score: number;
}

export interface NGO {
  id: string;
  name: string;
  city?: string | null;
  verified: boolean;
  [key: string]: unknown;
}

export const api = {
  listIssues: () => apiFetch<IssueSummary[]>("/issues"),
  getIssue: (id: string) => apiFetch<IssueDetail>(`/issues/${id}`),
  getIssueActions: (id: string, persona: string) =>
    apiFetch<ActionDefinition[]>(`/issues/${id}/actions?persona=${encodeURIComponent(persona)}`),
  submitAction: (payload: { action_definition_id: number; idempotency_key: string }) =>
    apiFetch("/actions/submit", { method: "POST", auth: true, body: JSON.stringify(payload) }),
  myScore: () => apiFetch<ScoreBreakdown>("/actions/me/score", { auth: true }),
  mySubmissions: () => apiFetch("/actions/me", { auth: true }),
  me: () => apiFetch<UserPublic>("/auth/me", { auth: true }),
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: {
    email: string;
    password: string;
    username: string;
    display_name: string;
    persona_id?: string;
  }) =>
    apiFetch<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  leaderboard: (scope: string = "global") =>
    apiFetch<LeaderboardRow[]>(`/leaderboard?scope=${scope}`),
  ngos: (verifiedOnly = false) => apiFetch<NGO[]>(`/ngos${verifiedOnly ? "?verified_only=true" : ""}`),
};
