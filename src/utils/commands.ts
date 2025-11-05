import type { OurGroceriesCommand } from '../types.js';

type Payload = Record<string, unknown>;

function filterDefined(payload: Payload): Payload {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

export function withTeamId(payload: Payload, teamId: string | null): Payload {
  return teamId ? { ...payload, teamId } : payload;
}

export function mergePayload(base: Payload, extra?: Payload): Payload {
  return extra ? { ...base, ...extra } : base;
}

export function buildCommandPayload(command: OurGroceriesCommand, teamId: string | null, extra?: Payload): Payload {
  return withTeamId(filterDefined(mergePayload({ command }, extra ?? {})), teamId);
}
