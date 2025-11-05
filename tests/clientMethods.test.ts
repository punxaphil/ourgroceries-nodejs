import { test, expect, vi } from 'vitest';
import { createClientMethods, type SessionGuard } from '../src/client/methods.js';
import type { ListMixins } from '../src/client/listMixins.js';
import type { InsertItemResult, ListResponse, ListsOverview, MutationResult } from '../src/types.js';

function asyncStub<T>(value: T) {
  return vi.fn(async () => value);
}

function makeGuard() {
  const ensureSession = vi.fn(async () => {});
  const requireTeamId = vi.fn(() => 'TEAM');
  const requireCategoryId = vi.fn(() => 'CAT');
  const requireMasterId = vi.fn(() => 'MASTER');
  const guard: SessionGuard = { ensureSession, requireTeamId, requireCategoryId, requireMasterId };
  return { guard, ensureSession, requireTeamId, requireCategoryId, requireMasterId };
}

function makeAddItemStub() {
  return vi.fn(async (entry: { listId: string; value: string }) => ({ itemId: entry.listId }) as InsertItemResult);
}

function makeMixins() {
  const loadOverview = asyncStub({ shoppingLists: [] } as ListsOverview);
  const loadList = vi.fn(async (id: string) => ({ list: { id, name: '' } }) as ListResponse);
  const addItem = makeAddItemStub();
  const deleteList = asyncStub({} as MutationResult);
  const getCategoryList = asyncStub({ list: { id: 'CAT', name: '' } } as ListResponse);
  const mixins = { loadOverview, loadList, addItem, deleteList, getCategoryList } as unknown as ListMixins;
  return { mixins, loadOverview, loadList, addItem, deleteList, getCategoryList };
}

test('ensures session before overview', async () => {
  const { guard, ensureSession } = makeGuard();
  const { mixins, loadOverview } = makeMixins();
  await createClientMethods(guard, mixins).getMyLists();
  expect(ensureSession).toHaveBeenCalledTimes(1);
  expect(loadOverview).toHaveBeenCalledTimes(1);
});

test('uses category guard when fetching category items', async () => {
  const { guard, ensureSession, requireCategoryId } = makeGuard();
  const { mixins, loadList } = makeMixins();
  await createClientMethods(guard, mixins).getCategoryItems();
  expect(ensureSession).toHaveBeenCalledTimes(1);
  expect(requireCategoryId).toHaveBeenCalledTimes(1);
  expect(loadList).toHaveBeenCalledWith('CAT');
});

test('requires team guard before deleting list', async () => {
  const { guard, ensureSession, requireTeamId } = makeGuard();
  const { mixins, deleteList } = makeMixins();
  await createClientMethods(guard, mixins).deleteList('LIST');
  expect(ensureSession).toHaveBeenCalledTimes(1);
  expect(requireTeamId).toHaveBeenCalledTimes(1);
  expect(deleteList).toHaveBeenCalledWith('LIST');
});

test('adds master list item with guarded identifier', async () => {
  const { guard, ensureSession, requireMasterId } = makeGuard();
  const { mixins, addItem } = makeMixins();
  await createClientMethods(guard, mixins).addItemToMasterList('Bread', 'CAT');
  expect(ensureSession).toHaveBeenCalledTimes(1);
  expect(requireMasterId).toHaveBeenCalledTimes(1);
  expect(addItem).toHaveBeenCalledWith({ listId: 'MASTER', value: 'Bread', category: 'CAT' });
});
