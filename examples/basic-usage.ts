import {
  OurGroceries,
  InvalidLoginException,
  type GroceryList,
  type ListResponse,
  type BatchItemInput,
} from '../src/index.js';
import { readCredentials, isReadOnly } from './env.js';
import { printList } from './render.js';
const SINGLE_ITEM_VALUE = 'Example Item';
const SINGLE_ITEM_CATEGORY = 'uncategorized';
const SINGLE_ITEM_NOTE = 'Added by example';
const BATCH_ITEMS: BatchItemInput[] = ['Milk', ['Bread', 'Bakery'], ['Eggs', 'Dairy']];
interface DemoContext {
  client: OurGroceries;
  list: GroceryList;
  readOnly: boolean;
}
function createClient(): OurGroceries {
  const credentials = readCredentials();
  return new OurGroceries(credentials);
}
async function loginClient(client: OurGroceries): Promise<void> {
  console.info('Logging in...');
  await client.login();
  console.info('Login complete.');
}
async function fetchLists(client: OurGroceries): Promise<GroceryList[]> {
  console.info('Retrieving shopping lists...');
  const overview = await client.getMyLists();
  const lists = overview.shoppingLists ?? [];
  console.info(`Lists available: ${lists.length}`);
  return lists;
}
function chooseTargetList(lists: GroceryList[]): GroceryList | null {
  return lists[0] ?? null;
}
function resolveTargetList(lists: GroceryList[]): GroceryList | null {
  const list = chooseTargetList(lists);
  if (list) return list;
  console.info('No shopping list available for demo.');
  return null;
}
async function showList(client: OurGroceries, list: GroceryList): Promise<ListResponse> {
  console.info(`Loading list: ${list.name}`);
  const response = await client.getListItems(list.id);
  printList(response.list);
  return response;
}
async function addSampleItems(client: OurGroceries, list: GroceryList): Promise<void> {
  await client.addItemToList(list.id, SINGLE_ITEM_VALUE, SINGLE_ITEM_CATEGORY, false, SINGLE_ITEM_NOTE);
  await client.addItemsToList(list.id, BATCH_ITEMS);
}
async function toggleFirstItem(client: OurGroceries, response: ListResponse): Promise<void> {
  const first = response.list.items?.[0];
  if (!first) return;
  await client.toggleItemCrossedOff(response.list.id, first.id, true);
  console.info(`Crossed off: ${first.value}`);
}
async function prepareDemo(): Promise<DemoContext | null> {
  const client = createClient();
  const readOnly = isReadOnly();
  await loginClient(client);
  const lists = await fetchLists(client);
  const list = resolveTargetList(lists);
  if (!list) return null;
  return { client, list, readOnly };
}
function refreshList(ctx: DemoContext): Promise<ListResponse> {
  return showList(ctx.client, ctx.list);
}
async function mutateActiveList(ctx: DemoContext): Promise<void> {
  await addSampleItems(ctx.client, ctx.list);
  const updated = await refreshList(ctx);
  await toggleFirstItem(ctx.client, updated);
  await refreshList(ctx);
}
async function runDemoForContext(ctx: DemoContext): Promise<void> {
  await refreshList(ctx);
  if (ctx.readOnly) {
    console.info('Read-only mode; skipping mutations.');
    return;
  }
  await mutateActiveList(ctx);
  console.info('Demo complete.');
}
async function runDemo(): Promise<void> {
  const context = await prepareDemo();
  if (!context) return;
  await runDemoForContext(context);
}
runDemo().catch((error: unknown) => {
  if (error instanceof InvalidLoginException) {
    console.error('Failed to sign in. Verify OG_USERNAME and OG_PASSWORD.');
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
