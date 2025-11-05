import type { BatchItemInput, GroceryItem } from '../types.js';

function crossedFlag(value: unknown): boolean {
  return typeof value === 'boolean' ? value : Boolean(value);
}

export function normalizeItem(raw: Record<string, unknown>): GroceryItem {
  return {
    ...(raw as GroceryItem),
    crossedOff: crossedFlag((raw as { crossedOff?: unknown }).crossedOff),
  };
}

export function normalizeItems(raw: Array<Record<string, unknown>> | null | undefined): GroceryItem[] {
  return raw && raw.length ? raw.map(normalizeItem) : [];
}

function fromTuple([value, category, note]: [string, string?, string?], listId: string): Record<string, unknown> {
  return {
    value,
    listId,
    ...(category ? { categoryId: category } : {}),
    ...(note ? { note } : {}),
  };
}

function fromString(value: string, listId: string): Record<string, unknown> {
  return { value, listId };
}

function toPayload(item: BatchItemInput, listId: string): Record<string, unknown> {
  return Array.isArray(item) ? fromTuple(item, listId) : fromString(item, listId);
}

export function batchItemsToPayload(items: BatchItemInput[], listId: string): Record<string, unknown>[] {
  return items.map((item) => toPayload(item, listId));
}
