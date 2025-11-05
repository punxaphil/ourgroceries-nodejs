import type { Response } from 'got';
import type { ClientDependencies } from '../client/dependencies.js';
import { OurGroceriesApiException } from '../errors.js';
import { buildEmailPayload } from './emailStep.js';
import { buildPasswordPayload } from './passwordStep.js';
import { fetchHtml, submitForm } from './http.js';
import { requireSessionKey } from './cookies.js';
import { parseMetadata } from './metadata.js';

export interface LoginResult {
  sessionKey: string;
  teamId: string | null;
  categoryListId: string | null;
  masterListId: string | null;
}

const LABEL_SIGN_IN = 'Initial sign-in page';
const LABEL_EMAIL = 'Email step';
const LABEL_PASSWORD = 'Password step';
const LABEL_METADATA = 'Metadata fetch';

function signInUrl(deps: ClientDependencies): string {
  return new URL('/sign-in', deps.baseUrl).toString();
}
function listsUrl(deps: ClientDependencies): string {
  return new URL('/your-lists/', deps.baseUrl).toString();
}

function fetchInitialHtml(deps: ClientDependencies): Promise<string> {
  return fetchHtml(deps.client, signInUrl(deps), LABEL_SIGN_IN);
}

async function sendEmailStep(deps: ClientDependencies, html: string): Promise<string> {
  const payload = buildEmailPayload(html, deps.username);
  const response = await submitForm(deps.client, signInUrl(deps), payload, LABEL_EMAIL);
  return response.body ?? '';
}

function sendPasswordStep(deps: ClientDependencies, html: string): Promise<Response<string>> {
  const payload = buildPasswordPayload(html, deps.username, deps.password);
  return submitForm(deps.client, signInUrl(deps), payload, LABEL_PASSWORD);
}

function readSession(deps: ClientDependencies): Promise<string> {
  return requireSessionKey(deps.cookieJar, deps.baseUrl);
}

async function readMetadata(deps: ClientDependencies): Promise<Omit<LoginResult, 'sessionKey'>> {
  try {
    const html = await fetchHtml(deps.client, listsUrl(deps), LABEL_METADATA);
    return parseMetadata(html);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new OurGroceriesApiException(`Failed to retrieve metadata page: ${message}`);
  }
}

export async function login(deps: ClientDependencies): Promise<LoginResult> {
  const emailHtml = await fetchInitialHtml(deps);
  const passwordHtml = await sendEmailStep(deps, emailHtml);
  await sendPasswordStep(deps, passwordHtml);
  const sessionKey = await readSession(deps);
  const metadata = await readMetadata(deps);
  return { sessionKey, ...metadata };
}
