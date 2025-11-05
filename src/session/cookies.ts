import { CookieJar, type Cookie } from 'tough-cookie';
import { COOKIE_KEY_SESSION } from '../constants.js';
import { InvalidLoginException } from '../errors.js';

type CookieLike = Pick<Cookie, 'key' | 'value'>;

function findCookie(cookies: CookieLike[], key: string): string | null {
  const match = cookies.find((cookie) => cookie.key === key);
  return match?.value ?? null;
}

export async function readCookieValue(jar: CookieJar, url: string, key: string): Promise<string | null> {
  const cookies = (await jar.getCookies(url)) as CookieLike[];
  return findCookie(cookies, key);
}

export async function readSessionKey(jar: CookieJar, url: string): Promise<string | null> {
  return readCookieValue(jar, url, COOKIE_KEY_SESSION);
}

export async function requireSessionKey(jar: CookieJar, url: string): Promise<string> {
  const sessionKey = await readSessionKey(jar, url);
  if (!sessionKey) {
    throw new InvalidLoginException('Session cookie not found; invalid credentials.');
  }
  return sessionKey;
}
