import type { OurGroceriesOptions } from '../types.js';
import { OurGroceriesApiException } from '../errors.js';
import { createDependencies, type ClientDependencies } from './dependencies.js';
import { createListMixins } from './listMixins.js';
import { createClientMethods, type ClientMethods, type SessionGuard } from './methods.js';
import { login as establishSession, type LoginResult } from '../session/login.js';
import type { ListCommandContext } from '../commands/lists.js';

function listsUrlFor(baseUrl: string): string {
  return new URL('/your-lists/', baseUrl).toString();
}

export class OurGroceries implements ClientMethods {
  private readonly deps: ClientDependencies;
  private readonly listsUrl: string;
  private session: LoginResult | null = null;
  private loginTask: Promise<void> | null = null;

  declare getMyLists: ClientMethods['getMyLists'];
  declare getListItems: ClientMethods['getListItems'];
  declare getCategoryItems: ClientMethods['getCategoryItems'];
  declare createList: ClientMethods['createList'];
  declare createCategory: ClientMethods['createCategory'];
  declare toggleItemCrossedOff: ClientMethods['toggleItemCrossedOff'];
  declare addItemToList: ClientMethods['addItemToList'];
  declare addItemsToList: ClientMethods['addItemsToList'];
  declare removeItemFromList: ClientMethods['removeItemFromList'];
  declare getMasterList: ClientMethods['getMasterList'];
  declare getCategoryList: ClientMethods['getCategoryList'];
  declare deleteList: ClientMethods['deleteList'];
  declare deleteAllCrossedOffFromList: ClientMethods['deleteAllCrossedOffFromList'];
  declare addItemToMasterList: ClientMethods['addItemToMasterList'];
  declare changeItemOnList: ClientMethods['changeItemOnList'];

  constructor(options: OurGroceriesOptions) {
    this.deps = createDependencies(options);
    this.listsUrl = listsUrlFor(this.deps.baseUrl);
    const mixins = createListMixins(
      () => this.context(),
      () => this.session?.categoryListId ?? null,
      () => this.session?.masterListId ?? null
    );
    Object.assign(this, createClientMethods(this.guard(), mixins));
  }

  login(): Promise<void> {
    return this.ensureSession();
  }

  private context(): ListCommandContext {
    return { client: this.deps.client, url: this.listsUrl, teamId: this.session?.teamId ?? null };
  }

  private guard(): SessionGuard {
    return {
      ensureSession: () => this.ensureSession(),
      requireTeamId: () => this.requireTeamId(),
      requireCategoryId: () => this.requireCategoryId(),
      requireMasterId: () => this.requireMasterId(),
    };
  }

  private async ensureSession(): Promise<void> {
    if (this.session) return;
    if (!this.loginTask) this.loginTask = this.startLogin();
    await this.loginTask;
    if (!this.session) throw new OurGroceriesApiException('Session not established.');
  }

  private async startLogin(): Promise<void> {
    try {
      this.session = await establishSession(this.deps);
    } finally {
      this.loginTask = null;
    }
  }

  private requireTeamId(): string {
    const teamId = this.session?.teamId ?? null;
    if (teamId) return teamId;
    throw new OurGroceriesApiException('Team ID not available.');
  }

  private requireCategoryId(): string {
    const categoryId = this.session?.categoryListId ?? null;
    if (categoryId) return categoryId;
    throw new OurGroceriesApiException('Category list ID not available.');
  }

  private requireMasterId(): string {
    const masterId = this.session?.masterListId ?? null;
    if (masterId) return masterId;
    throw new OurGroceriesApiException('Master list ID not available.');
  }
}

export default OurGroceries;
