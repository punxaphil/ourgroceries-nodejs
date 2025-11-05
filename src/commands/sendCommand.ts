import type { Got, Response } from 'got';
import { OurGroceriesApiException } from '../errors.js';
import { buildCommandPayload, safeJsonParse } from '../helpers.js';
import type { CommandResponse, OurGroceriesCommand } from '../types.js';

type Payload = Record<string, unknown>;

function describeStatus(response: Response<string>, command: OurGroceriesCommand): void {
  if (response.statusCode >= 400) throw OurGroceriesApiException.fromStatus(command, response.statusCode);
}

async function postCommand(
  client: Got,
  url: string,
  command: OurGroceriesCommand,
  payload: Payload
): Promise<Response<string>> {
  try {
    return await client.post(url, { json: payload, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    throw OurGroceriesApiException.fromTransport(command, error);
  }
}

function parseBody<C extends OurGroceriesCommand>(response: Response<string>, command: C): CommandResponse<C> {
  const body = response.body ?? '';
  if (!body) return {} as CommandResponse<C>;
  const parsed = safeJsonParse<CommandResponse<C>>(body);
  if (parsed.ok) return parsed.value;
  throw new OurGroceriesApiException(`Failed to parse JSON for command '${command}': ${parsed.error.message}`, command);
}

export async function sendCommand<C extends OurGroceriesCommand>(
  client: Got,
  url: string,
  command: C,
  teamId: string | null,
  extra?: Payload
): Promise<CommandResponse<C>> {
  const payload = buildCommandPayload(command, teamId, extra);
  const response = await postCommand(client, url, command, payload);
  describeStatus(response, command);
  return parseBody(response, command);
}
