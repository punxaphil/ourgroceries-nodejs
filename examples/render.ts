import type { GroceryItem, GroceryList } from '../src/index.js';

function statusSymbol(item: GroceryItem): string {
  return item.crossedOff ? '✓' : ' ';
}

function noteSuffix(item: GroceryItem): string {
  return item.note ? ` (note: ${item.note})` : '';
}

function formatItem(item: GroceryItem): string {
  return `[${statusSymbol(item)}] ${item.value}${noteSuffix(item)}`;
}

function listHeading(list: GroceryList): string {
  return `List: ${list.name} (${list.id})`;
}

function renderItems(items: GroceryItem[] | undefined): string[] {
  if (!items || items.length === 0) return ['  (no items)'];
  return items.map((item) => `  ${formatItem(item)}`);
}

function renderList(list: GroceryList): string {
  return [listHeading(list), ...renderItems(list.items)].join('\n');
}

export function printList(list: GroceryList, log: (message: string) => void = console.info): void {
  renderList(list)
    .split('\n')
    .forEach((line) => log(line));
}
