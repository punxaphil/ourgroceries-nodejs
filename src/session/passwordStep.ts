import {
  FORM_KEY_ACTION,
  FORM_KEY_PASSWORD,
  FORM_KEY_PASSWORD_CONFIRM,
  FORM_KEY_USERNAME,
  FORM_VALUE_PASSWORD_ACTION,
} from '../constants.js';
import { InvalidLoginException } from '../errors.js';
import { parseFormInputs } from '../helpers.js';

const SIGN_IN_ACTION = '/sign-in';
const DEFAULT_LOCALE = 'en-US';
const MESSAGE_INVALID_ACCOUNT = 'Email address not associated with an existing account.';
const MESSAGE_CONFIRMATION_REQUIRED = 'Password confirmation required; complete sign-in via web interface.';
const MESSAGE_PASSWORD_MISSING = 'Failed to retrieve password form; double-check credentials.';

function normalizeAction(value: string | undefined): string | null {
  return value ? value.toLowerCase().replace(/\s+/g, '-') : null;
}

function applyLocales(fields: Record<string, string>): Record<string, string> {
  if ('locale' in fields && !fields.locale) fields.locale = DEFAULT_LOCALE;
  if ('localeInput' in fields && !fields.localeInput) fields.localeInput = DEFAULT_LOCALE;
  return fields;
}

function guardInvalid(condition: boolean, message: string): void {
  if (condition) throw new InvalidLoginException(message);
}

function ensureValid(fields: Record<string, string>): void {
  const action = normalizeAction(fields[FORM_KEY_ACTION]);
  guardInvalid(action !== null && action !== FORM_VALUE_PASSWORD_ACTION, MESSAGE_INVALID_ACCOUNT);
  guardInvalid(fields[FORM_KEY_PASSWORD_CONFIRM] !== undefined, MESSAGE_CONFIRMATION_REQUIRED);
  guardInvalid(!(FORM_KEY_PASSWORD in fields), MESSAGE_PASSWORD_MISSING);
}

export function buildPasswordPayload(html: string, username: string, password: string): Record<string, string> {
  const fields = applyLocales(parseFormInputs(html, { action: SIGN_IN_ACTION }));
  ensureValid(fields);
  fields[FORM_KEY_USERNAME] = username;
  fields[FORM_KEY_PASSWORD] = password;
  fields[FORM_KEY_ACTION] = normalizeAction(fields[FORM_KEY_ACTION]) ?? FORM_VALUE_PASSWORD_ACTION;
  return fields;
}
