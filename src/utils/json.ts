export type JsonParseSuccess<T> = { ok: true; value: T };
export type JsonParseFailure = { ok: false; error: Error };
export type JsonParseResult<T> = JsonParseSuccess<T> | JsonParseFailure;

function toError(input: unknown): Error {
  return input instanceof Error ? input : new Error(String(input));
}

export function parseJson<T>(text: string): JsonParseResult<T> {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export function safeJsonParse<T>(text: string): JsonParseResult<T> {
  return parseJson<T>(text);
}
