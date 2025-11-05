import type { Got, Response } from 'got';
import { InvalidLoginException } from '../errors.js';
import { buildFormBody } from '../helpers.js';

const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded';

type FormRequest = {
  body: string;
  headers: Record<string, string>;
  followRedirect: boolean;
};

function describe(value: unknown): string {
  return value instanceof Error ? value.message : String(value);
}

function ensureSuccess(response: Response<string>, label: string): void {
  if (response.statusCode >= 400) {
    throw new InvalidLoginException(`${label} failed (HTTP ${response.statusCode}).`);
  }
}

export async function fetchHtml(client: Got, url: string, label: string): Promise<string> {
  const response = await performRequest(label, () => client.get(url));
  return response.body ?? '';
}

function formRequest(fields: Record<string, string>): FormRequest {
  return {
    body: buildFormBody(fields),
    headers: { 'Content-Type': CONTENT_TYPE_FORM },
    followRedirect: false,
  };
}

async function performRequest(label: string, action: () => Promise<Response<string>>): Promise<Response<string>> {
  try {
    const response = await action();
    ensureSuccess(response, label);
    return response;
  } catch (error) {
    throw new InvalidLoginException(`Login transport error: ${describe(error)}`);
  }
}

export async function submitForm(
  client: Got,
  url: string,
  fields: Record<string, string>,
  label: string
): Promise<Response<string>> {
  return performRequest(label, () => client.post(url, formRequest(fields)));
}
