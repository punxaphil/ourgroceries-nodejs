import { FORM_KEY_ACTION, FORM_KEY_USERNAME, FORM_VALUE_EMAIL_ACTION } from '../constants.js';
import { parseFormInputs } from '../helpers.js';

const SIGN_IN_ACTION = '/sign-in';
const DEFAULT_LOCALE = 'en-US';

function applyLocales(fields: Record<string, string>): Record<string, string> {
  if ('locale' in fields && !fields.locale) fields.locale = DEFAULT_LOCALE;
  if ('localeInput' in fields && !fields.localeInput) fields.localeInput = DEFAULT_LOCALE;
  return fields;
}

export function buildEmailPayload(html: string, username: string): Record<string, string> {
  const fields = applyLocales(parseFormInputs(html, { action: SIGN_IN_ACTION }));
  fields[FORM_KEY_USERNAME] = username;
  fields[FORM_KEY_ACTION] = fields[FORM_KEY_ACTION] ?? FORM_VALUE_EMAIL_ACTION;
  return fields;
}
