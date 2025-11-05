import { OurGroceries, InvalidLoginException } from '../src/index.js';
import { readCredentials } from './env.js';

function createClient(): OurGroceries {
  return new OurGroceries(readCredentials());
}

async function showOverview(client: OurGroceries): Promise<void> {
  const overview = await client.getMyLists();
  console.info(overview);
}

async function run(): Promise<void> {
  const client = createClient();
  await client.login();
  await showOverview(client);
}

run().catch((error: unknown) => {
  if (error instanceof InvalidLoginException) {
    console.error('Failed to sign in. Verify OG_USERNAME and OG_PASSWORD.');
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
