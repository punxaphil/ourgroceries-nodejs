import { REGEX_TEAM_ID, REGEX_STATIC_METALIST, REGEX_MASTER_LIST_ID } from '../constants.js';
import { safeJsonParse } from '../helpers.js';

export interface ListsMetadata {
  teamId: string | null;
  categoryListId: string | null;
  masterListId: string | null;
}

function extract(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match ? (match[1] ?? null) : null;
}

function parseMetalist(json: string | null): string | null {
  if (!json) return null;
  const parsed = safeJsonParse<Array<Record<string, unknown>>>(json);
  if (!parsed.ok) return null;
  const entry = parsed.value.find((item) => (item as { listType?: string }).listType === 'CATEGORY');
  const id = (entry as { id?: unknown })?.id;
  return typeof id === 'string' ? id : null;
}

export function parseMetadata(html: string): ListsMetadata {
  return {
    teamId: extract(html, REGEX_TEAM_ID),
    categoryListId: parseMetalist(extract(html, REGEX_STATIC_METALIST)),
    masterListId: extract(html, REGEX_MASTER_LIST_ID),
  };
}
