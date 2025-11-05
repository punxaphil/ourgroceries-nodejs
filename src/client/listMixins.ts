import type {
  BatchItemInput,
  GroceryList,
  InsertItemResult,
  ListResponse,
  ListsOverview,
  MutationResult,
} from '../types.js';
import { OurGroceriesApiException } from '../errors.js';
import {
  fetchOverview,
  fetchList,
  createList as execCreateList,
  insertItem,
  insertItems,
  deleteItem,
  toggleItemCrossedOff,
  deleteAllCrossedOff,
  deleteList as execDeleteList,
  fetchCategoryList,
  changeItemValue,
  type ListCommandContext,
} from '../commands/lists.js';
import { normalizeItems } from '../helpers.js';

type ContextProvider = () => ListCommandContext;
type IdProvider = () => string | null;

function mergeLists(overview: ListsOverview | null | undefined): GroceryList[] {
  if (!overview) return [];
  return [...(overview.shoppingLists ?? []), ...(overview.recipeLists ?? []), ...(overview.metalists ?? [])];
}

function ensureValue(value: string | null, label: string): string {
  if (value) return value;
  throw new OurGroceriesApiException(`${label} not available.`);
}

function loadOverview(provider: ContextProvider): Promise<ListsOverview> {
  return fetchOverview(provider());
}

async function loadList(provider: ContextProvider, listId: string): Promise<ListResponse> {
  const response = await fetchList(provider(), listId);
  if (response.list?.items) response.list.items = normalizeItems(response.list.items);
  return response;
}

export interface ListMixins {
  loadOverview(): Promise<ListsOverview>;
  loadList(listId: string): Promise<ListResponse>;
  createList(name: string, type?: 'SHOPPING' | 'RECIPES'): Promise<GroceryList>;
  createCategory(name: string): Promise<InsertItemResult>;
  addItem(options: {
    listId: string;
    value: string;
    category?: string;
    autoCategory?: boolean;
    note?: string | null;
  }): Promise<InsertItemResult>;
  addItems(listId: string, items: BatchItemInput[]): Promise<MutationResult>;
  toggleCrossedOff(listId: string, itemId: string, crossedOff: boolean): Promise<MutationResult>;
  deleteItem(listId: string, itemId: string): Promise<MutationResult>;
  deleteAllCrossedOff(listId: string): Promise<MutationResult>;
  deleteList(listId: string): Promise<MutationResult>;
  getCategoryList(): Promise<ListResponse>;
  getMasterList(): Promise<ListResponse>;
  changeItem(options: { listId: string; itemId: string; categoryId: string; value: string }): Promise<MutationResult>;
}

export function createListMixins(
  contextProvider: ContextProvider,
  categoryIdProvider: IdProvider,
  masterIdProvider: IdProvider
): ListMixins {
  function loadOverviewFor(): Promise<ListsOverview> {
    return loadOverview(contextProvider);
  }

  function loadListFor(listId: string): Promise<ListResponse> {
    return loadList(contextProvider, listId);
  }

  async function createListFor(name: string, type: 'SHOPPING' | 'RECIPES' = 'SHOPPING'): Promise<GroceryList> {
    const overview = await execCreateList(contextProvider(), name, type);
    return (
      mergeLists(overview).find((list) => list.name === name) ?? {
        id: 'UNKNOWN',
        name,
        listType: type,
      }
    );
  }

  function createCategoryFor(name: string): Promise<InsertItemResult> {
    return insertItem(contextProvider(), ensureValue(categoryIdProvider(), 'Category list ID'), name);
  }

  function addItemFor(options: {
    listId: string;
    value: string;
    category?: string;
    autoCategory?: boolean;
    note?: string | null;
  }): Promise<InsertItemResult> {
    const { listId, value, category = 'uncategorized', autoCategory = false, note = null } = options;
    return insertItem(contextProvider(), listId, value, autoCategory ? undefined : category, note ?? undefined);
  }

  function addItemsFor(listId: string, items: BatchItemInput[]): Promise<MutationResult> {
    return insertItems(contextProvider(), listId, items);
  }

  function toggleCrossedOffFor(listId: string, itemId: string, crossedOff: boolean): Promise<MutationResult> {
    return toggleItemCrossedOff(contextProvider(), listId, itemId, crossedOff);
  }

  function deleteItemFor(listId: string, itemId: string): Promise<MutationResult> {
    return deleteItem(contextProvider(), listId, itemId);
  }

  function deleteAllCrossedOffFor(listId: string): Promise<MutationResult> {
    return deleteAllCrossedOff(contextProvider(), listId);
  }

  function deleteListFor(listId: string): Promise<MutationResult> {
    return execDeleteList(contextProvider(), listId);
  }

  function getCategoryListFor(): Promise<ListResponse> {
    return fetchCategoryList(contextProvider());
  }

  function getMasterListFor(): Promise<ListResponse> {
    return loadList(contextProvider, ensureValue(masterIdProvider(), 'Master list ID'));
  }

  function changeItemFor(options: {
    listId: string;
    itemId: string;
    categoryId: string;
    value: string;
  }): Promise<MutationResult> {
    const { listId, itemId, categoryId, value } = options;
    return changeItemValue(contextProvider(), listId, itemId, categoryId, value);
  }

  return {
    loadOverview: loadOverviewFor,
    loadList: loadListFor,
    createList: createListFor,
    createCategory: createCategoryFor,
    addItem: addItemFor,
    addItems: addItemsFor,
    toggleCrossedOff: toggleCrossedOffFor,
    deleteItem: deleteItemFor,
    deleteAllCrossedOff: deleteAllCrossedOffFor,
    deleteList: deleteListFor,
    getCategoryList: getCategoryListFor,
    getMasterList: getMasterListFor,
    changeItem: changeItemFor,
  };
}
