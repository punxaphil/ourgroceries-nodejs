export interface GroceryItem {
  id: string;
  value: string;
  categoryId?: string;
  crossedOff: boolean;
  note?: string;
  [key: string]: unknown;
}

export type ListType = 'SHOPPING' | 'RECIPES' | 'CATEGORY' | string;

export interface GroceryList {
  id: string;
  name: string;
  listType: ListType;
  items?: GroceryItem[];
  [key: string]: unknown;
}

export interface ListsOverview {
  shoppingLists: GroceryList[];
  recipeLists?: GroceryList[];
  metalists?: GroceryList[];
  [key: string]: unknown;
}

export interface ListResponse {
  list: GroceryList;
  [key: string]: unknown;
}

export type BatchItemInput = string | [value: string, category?: string, note?: string];

export interface OurGroceriesOptions {
  username: string;
  password: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface MutationResult {
  ok?: boolean;
  id?: string;
  [key: string]: unknown;
}

export interface InsertItemResult extends MutationResult {
  itemId?: string;
}

export interface CommandResponseMap {
  getOverview: ListsOverview;
  getList: ListResponse;
  setItemCrossedOff: MutationResult;
  insertItem: InsertItemResult;
  insertItems: MutationResult;
  deleteItem: MutationResult;
  createList: ListsOverview;
  deleteList: MutationResult;
  getCategoryList: ListResponse;
  changeItemValue: MutationResult;
  deleteAllCrossedOffItems: MutationResult;
}

export type OurGroceriesCommand = keyof CommandResponseMap;
export type CommandResponse<C extends OurGroceriesCommand> = CommandResponseMap[C];
export type AnyCommandResponse = CommandResponseMap[OurGroceriesCommand];
