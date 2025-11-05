export interface ParseFormOptions {
  action?: string;
  includeButtons?: boolean;
}
const FORM_END = '</form>';
const FORM_PATTERN = /<form\b[^>]*>/gi;
const INPUT_PATTERN = /<input\b[^>]*>/gi;
const BUTTON_PATTERN = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
function attributePattern(name: string): RegExp {
  return new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
}

function lower(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  return value.toLowerCase();
}

function fieldValue(value: string | null, type: string | null): string {
  if (value !== null && value !== undefined) return value;
  return type === 'checkbox' || type === 'radio' ? 'on' : '';
}
function includeField(type: string | null, includeButtons: boolean): boolean {
  if (!type) return true;
  if (type === 'submit') return true;
  if (includeButtons) return true;
  return !['button', 'image', 'reset'].includes(type);
}

function extractAttribute(tag: string, name: string): string | null {
  const match = attributePattern(name).exec(tag);
  if (!match) return null;
  if (match[2] !== undefined) return match[2];
  if (match[3] !== undefined) return match[3];
  if (match[4] !== undefined) return match[4];
  return null;
}

function locateFormBody(html: string, desired: string | null): string | null {
  for (const match of html.matchAll(FORM_PATTERN)) {
    const tag = match[0];
    if (desired && lower(extractAttribute(tag, 'action')) !== desired) continue;
    const start = (match.index ?? 0) + tag.length;
    const end = html.indexOf(FORM_END, start);
    if (end !== -1) return html.slice(start, end);
  }
  return null;
}

function applyInput(result: Record<string, string>, tag: string, includeButtons: boolean): void {
  const name = extractAttribute(tag, 'name');
  if (!name) return;
  const type = lower(extractAttribute(tag, 'type'));
  if (!includeField(type, includeButtons)) return;
  const value = fieldValue(extractAttribute(tag, 'value'), type);
  result[name] = value;
}

function collectInputs(markup: string, includeButtons: boolean): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of markup.matchAll(INPUT_PATTERN)) {
    applyInput(result, match[0], includeButtons);
  }
  return result;
}

function applyButton(result: Record<string, string>, match: RegExpMatchArray, includeButtons: boolean): void {
  const full = match[0];
  const end = full.indexOf('>');
  const tag = end === -1 ? full : full.slice(0, end + 1);
  const name = extractAttribute(tag, 'name');
  if (!name) return;
  const type = lower(extractAttribute(tag, 'type'));
  if (!includeField(type, includeButtons)) return;
  const content = (match[1] ?? '').trim();
  const value = extractAttribute(tag, 'value') ?? content;
  result[name] = value;
}

export function parseFormInputs(html: string, options: ParseFormOptions = {}): Record<string, string> {
  const markup = locateFormBody(html, lower(options.action));
  if (!markup) return {};
  const includeButtons = options.includeButtons ?? false;
  const result = collectInputs(markup, includeButtons);
  for (const match of markup.matchAll(BUTTON_PATTERN)) {
    applyButton(result, match, includeButtons);
  }
  return result;
}

export function buildFormBody(fields: Record<string, string | number | boolean | undefined | null>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  return params.toString();
}
