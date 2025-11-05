import type {
  BatchItemInput,
  GroceryList,
  InsertItemResult,
  ListResponse,
  ListsOverview,
  MutationResult,
} from '../types.js';
import type { ListMixins } from './listMixins.js';

export interface SessionGuard {
  ensureSession(): Promise<void>;
  requireTeamId(): string;
  requireCategoryId(): string;
  requireMasterId(): string;
}

export interface ClientMethods {
  getMyLists(): Promise<ListsOverview>;
  getListItems(listId: string): Promise<ListResponse>;
  getCategoryItems(): Promise<ListResponse>;
  createList(name: string, type?: 'SHOPPING' | 'RECIPES'): Promise<GroceryList>;
  createCategory(name: string): Promise<InsertItemResult>;
  toggleItemCrossedOff(listId: string, itemId: string, crossedOff: boolean): Promise<MutationResult>;
  addItemToList(
    listId: string,
    value: string,
    category?: string,
    autoCategory?: boolean,
    note?: string | null
  ): Promise<InsertItemResult>;
  addItemsToList(listId: string, items: BatchItemInput[]): Promise<MutationResult>;
  removeItemFromList(listId: string, itemId: string): Promise<MutationResult>;
  getMasterList(): Promise<ListResponse>;
  getCategoryList(): Promise<ListResponse>;
  deleteList(listId: string): Promise<MutationResult>;
  deleteAllCrossedOffFromList(listId: string): Promise<MutationResult>;
  addItemToMasterList(value: string, categoryId: string): Promise<InsertItemResult>;
  changeItemOnList(listId: string, itemId: string, categoryId: string, newValue: string): Promise<MutationResult>;
}

export function createClientMethods(guard: SessionGuard, mixins: ListMixins): ClientMethods {
  async function getMyLists(): Promise<ListsOverview> {
    await guard.ensureSession();
    return mixins.loadOverview();
  }

  async function getListItems(listId: string): Promise<ListResponse> {
    await guard.ensureSession();
    return mixins.loadList(listId);
  }

  async function getCategoryItems(): Promise<ListResponse> {
    await guard.ensureSession();
    return mixins.loadList(guard.requireCategoryId());
  }

  async function createList(name: string, type: 'SHOPPING' | 'RECIPES' = 'SHOPPING'): Promise<GroceryList> {
    await guard.ensureSession();
    return mixins.createList(name, type);
  }

  async function createCategory(name: string): Promise<InsertItemResult> {
    await guard.ensureSession();
    return mixins.createCategory(name);
  }

  async function toggleItemCrossedOff(listId: string, itemId: string, crossedOff: boolean): Promise<MutationResult> {
    await guard.ensureSession();
    return mixins.toggleCrossedOff(listId, itemId, crossedOff);
  }

  async function addItemToList(
    listId: string,
    value: string,
    category: string = 'uncategorized',
    autoCategory: boolean = false,
    note: string | null = null
  ): Promise<InsertItemResult> {
    await guard.ensureSession();
    return mixins.addItem({ listId, value, category, autoCategory, note });
  }

  async function addItemsToList(listId: string, items: BatchItemInput[]): Promise<MutationResult> {
    await guard.ensureSession();
    return mixins.addItems(listId, items);
  }

  async function removeItemFromList(listId: string, itemId: string): Promise<MutationResult> {
    await guard.ensureSession();
    return mixins.deleteItem(listId, itemId);
  }

  async function getMasterList(): Promise<ListResponse> {
    await guard.ensureSession();
    return mixins.getMasterList();
  }

  async function getCategoryList(): Promise<ListResponse> {
    await guard.ensureSession();
    guard.requireTeamId();
    return mixins.getCategoryList();
  }

  async function deleteList(listId: string): Promise<MutationResult> {
    await guard.ensureSession();
    guard.requireTeamId();
    return mixins.deleteList(listId);
  }

  async function deleteAllCrossedOffFromList(listId: string): Promise<MutationResult> {
    await guard.ensureSession();
    return mixins.deleteAllCrossedOff(listId);
  }

  async function addItemToMasterList(value: string, categoryId: string): Promise<InsertItemResult> {
    await guard.ensureSession();
    const listId = guard.requireMasterId();
    return mixins.addItem({ listId, value, category: categoryId });
  }

  async function changeItemOnList(
    listId: string,
    itemId: string,
    categoryId: string,
    newValue: string
  ): Promise<MutationResult> {
    await guard.ensureSession();
    guard.requireTeamId();
    return mixins.changeItem({ listId, itemId, categoryId, value: newValue });
  }

  return {
    getMyLists,
    getListItems,
    getCategoryItems,
    createList,
    createCategory,
    toggleItemCrossedOff,
    addItemToList,
    addItemsToList,
    removeItemFromList,
    getMasterList,
    getCategoryList,
    deleteList,
    deleteAllCrossedOffFromList,
    addItemToMasterList,
    changeItemOnList,
  };
}
