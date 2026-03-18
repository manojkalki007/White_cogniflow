import axios from 'axios';

const smallestAI = axios.create({
  baseURL: process.env.SMALLEST_AI_BASE_URL ?? 'https://atoms-api.smallest.ai/api/v1',
  headers: {
    Authorization: `Bearer ${process.env.SMALLEST_AI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InitiateCallPayload {
  agent_id: string;
  phone_number: string;              // E.164 format e.g. "+919999900000"
  variables?: Record<string, string>; // passed to agent as {{variable}}
}

export interface InitiateCallResponse {
  status: boolean;
  data: {
    call_id: string;
    status: string;
  };
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

/**
 * Trigger an outbound call via Smallest.ai Atoms API.
 * Docs: POST /v1/calls
 */
export async function initiateCall(
  payload: InitiateCallPayload
): Promise<InitiateCallResponse> {
  const res = await smallestAI.post<InitiateCallResponse>('/call', {
    agent_id: payload.agent_id,
    phone_number: payload.phone_number,
    variables: payload.variables ?? {},
  });
  return res.data;
}

/**
 * Fetch details for a single call (useful for polling).
 */
export async function getCallDetails(callId: string) {
  const res = await smallestAI.get(`/call/${callId}`);
  return res.data;
}

export default smallestAI;
