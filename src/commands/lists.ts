import type { Got } from 'got';
import {
  COMMAND_GET_OVERVIEW,
  COMMAND_GET_LIST,
  COMMAND_CREATE_LIST,
  COMMAND_INSERT_ITEM,
  COMMAND_INSERT_ITEMS,
  COMMAND_DELETE_ITEM,
  COMMAND_SET_ITEM_CROSSED_OFF,
  COMMAND_DELETE_ALL_CROSSED_OFF_ITEMS,
  COMMAND_DELETE_LIST,
  COMMAND_GET_CATEGORY_LIST,
  COMMAND_CHANGE_ITEM_VALUE,
} from '../constants.js';
import {
  type BatchItemInput,
  type CommandResponse,
  type InsertItemResult,
  type ListResponse,
  type ListsOverview,
  type MutationResult,
  type OurGroceriesCommand,
} from '../types.js';
import { sendCommand } from './sendCommand.js';
import { batchItemsToPayload } from '../helpers.js';

export interface ListCommandContext {
  client: Got;
  url: string;
  teamId: string | null;
}

type Payload = Record<string, unknown>;

function runCommand<C extends OurGroceriesCommand>(
  ctx: ListCommandContext,
  command: C,
  extra?: Payload
): Promise<CommandResponse<C>> {
  return sendCommand(ctx.client, ctx.url, command, ctx.teamId, extra);
}

function cleanPayload(payload: Payload): Payload {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

export function fetchOverview(ctx: ListCommandContext): Promise<ListsOverview> {
  return runCommand(ctx, COMMAND_GET_OVERVIEW);
}

export function fetchList(ctx: ListCommandContext, listId: string): Promise<ListResponse> {
  return runCommand(ctx, COMMAND_GET_LIST, { listId });
}

export function createList(ctx: ListCommandContext, name: string, listType: string): Promise<ListsOverview> {
  return runCommand(ctx, COMMAND_CREATE_LIST, { name, listType: listType.toUpperCase() });
}

export function insertItem(
  ctx: ListCommandContext,
  listId: string,
  value: string,
  categoryId?: string,
  note?: string | null
): Promise<InsertItemResult> {
  return runCommand(ctx, COMMAND_INSERT_ITEM, cleanPayload({ listId, value, categoryId, note: note ?? undefined }));
}

export function insertItems(ctx: ListCommandContext, listId: string, items: BatchItemInput[]): Promise<MutationResult> {
  return runCommand(ctx, COMMAND_INSERT_ITEMS, { items: batchItemsToPayload(items, listId) });
}

export function deleteItem(ctx: ListCommandContext, listId: string, itemId: string): Promise<MutationResult> {
  return runCommand(ctx, COMMAND_DELETE_ITEM, { listId, itemId });
}

export function toggleItemCrossedOff(
  ctx: ListCommandContext,
  listId: string,
  itemId: string,
  crossedOff: boolean
): Promise<MutationResult> {
  return runCommand(ctx, COMMAND_SET_ITEM_CROSSED_OFF, { listId, itemId, crossedOff });
}

export function deleteAllCrossedOff(ctx: ListCommandContext, listId: string): Promise<MutationResult> {
  return runCommand(ctx, COMMAND_DELETE_ALL_CROSSED_OFF_ITEMS, { listId });
}

export function deleteList(ctx: ListCommandContext, listId: string): Promise<MutationResult> {
  return runCommand(ctx, COMMAND_DELETE_LIST, cleanPayload({ listId }));
}

export function fetchCategoryList(ctx: ListCommandContext): Promise<ListResponse> {
  return runCommand(ctx, COMMAND_GET_CATEGORY_LIST);
}

export function changeItemValue(
  ctx: ListCommandContext,
  listId: string,
  itemId: string,
  categoryId: string,
  newValue: string
): Promise<MutationResult> {
  return runCommand(ctx, COMMAND_CHANGE_ITEM_VALUE, cleanPayload({ listId, itemId, categoryId, newValue }));
}
