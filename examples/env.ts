const truthyValues = ['1', 'true', 'yes', 'on'];

function readEnv(name: string, env: NodeJS.ProcessEnv = process.env): string | null {
  const value = env[name];
  return value && value.length > 0 ? value : null;
}

export function requireEnv(name: string, env: NodeJS.ProcessEnv = process.env): string {
  const value = readEnv(name, env);
  if (value) return value;
  throw new Error(`${name} is missing. Set OG_USERNAME and OG_PASSWORD before running.`);
}

export function envFlag(name: string, env: NodeJS.ProcessEnv = process.env): boolean {
  const value = readEnv(name, env);
  if (!value) return false;
  return truthyValues.includes(value.toLowerCase());
}

export function isReadOnly(env: NodeJS.ProcessEnv = process.env): boolean {
  return envFlag('OG_READONLY', env);
}

export interface Credentials {
  username: string;
  password: string;
}

export function readCredentials(env: NodeJS.ProcessEnv = process.env): Credentials {
  return {
    username: requireEnv('OG_USERNAME', env),
    password: requireEnv('OG_PASSWORD', env),
  };
}
