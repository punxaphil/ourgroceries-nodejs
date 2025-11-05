import got, { type Got } from 'got';
import { CookieJar } from 'tough-cookie';
import { BASE_URL, DEFAULT_TIMEOUT_MS, DEFAULT_USER_AGENT } from '../constants.js';
import type { OurGroceriesOptions } from '../types.js';

export interface ClientDependencies {
  baseUrl: string;
  client: Got;
  cookieJar: CookieJar;
  username: string;
  password: string;
}

export function createDependencies(options: OurGroceriesOptions): ClientDependencies {
  const baseUrl = options.baseUrl ?? BASE_URL;
  const cookieJar = new CookieJar();
  const client = got.extend({
    cookieJar,
    timeout: { request: options.timeoutMs ?? DEFAULT_TIMEOUT_MS },
    headers: { 'User-Agent': DEFAULT_USER_AGENT, 'Accept': 'text/html,application/json' },
    retry: { limit: 0 },
  });

  return {
    baseUrl,
    client,
    cookieJar,
    username: options.username,
    password: options.password,
  };
}
