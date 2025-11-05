# OurGroceries API - Node.js

Unofficial Node.js wrapper for the Our Groceries API. Requires Node.js >=20.8.1. This is a Node.js port of the original Python library by Leonardo Merza.

## Quick Start

```bash
npm install ourgroceries
```

Minimal usage (environment variables recommended for credentials):

```typescript
import { OurGroceries } from 'ourgroceries';

const og = new OurGroceries(process.env.OG_USERNAME!, process.env.OG_PASSWORD!);

async function main(): Promise<void> {
  await og.login();
  const lists = await og.getMyLists();
  console.log(lists);
}

main().catch(console.error);
```

## Common Operations

Get all lists:

```javascript
const { shoppingLists } = await og.getMyLists();
shoppingLists.forEach((list) => console.log(`${list.name} (${list.id})`));
```

Get items in a list:

```javascript
const { list } = await og.getListItems('list-id');
list.items.forEach((item) => {
  console.log(`[${item.crossedOff ? '✓' : ' '}] ${item.value}`);
});
```

Add a single item:

```javascript
await og.addItemToList('list-id', 'Milk', 'Dairy', false, 'Get 2%');
```

Add multiple items:

```javascript
await og.addItemsToList('list-id', ['Bread', ['Eggs', 'Dairy'], ['Apples', 'Produce', 'Honeycrisp']]);
```

Cross off an item:

```javascript
await og.toggleItemCrossedOff('list-id', 'item-id', true);
```

Create lists:

```javascript
await og.createList('Weekly Shopping', 'SHOPPING');
await og.createList('Favorite Recipes', 'RECIPES');
```

Delete list:

```javascript
await og.deleteList('list-id');
```

Remove all crossed off items:

```javascript
await og.deleteAllCrossedOffFromList('list-id');
```

## Full Example

See examples/basic-usage.ts. To explore without mutating your lists, run the bundled npm script in read-only mode:

```bash
npm run example:readonly
```

The script expects `OG_USERNAME` and `OG_PASSWORD` environment variables for authentication and skips write operations when `OG_READONLY=true` is set (this flag is applied automatically by the npm script). Example scripts automatically load these values from a local `.env` file when it exists.

## TypeScript

```typescript
import { OurGroceries, InvalidLoginException } from 'ourgroceries';

const og = new OurGroceries(process.env.OG_USERNAME!, process.env.OG_PASSWORD!);

async function run(): Promise<void> {
  await og.login();
  const { shoppingLists } = await og.getMyLists();
  shoppingLists.forEach((list) => console.log(list.name, list.id));
}

run().catch(console.error);
```

## API Methods

### `login()`

Logs into Our Groceries. Returns `Promise<void>`

### `getMyLists()`

Gets all lists. Returns `Promise<Object>`

### `getCategoryItems()`

Gets all category items. Returns `Promise<Object>`

### `getListItems(listId)`

Items for a specific list. Returns `Promise<Object>`

### `createList(name, listType='SHOPPING')`

Create a new list. Returns `Promise<Object>`

### `createCategory(name)`

Create a new category. Returns `Promise<Object>`

### `toggleItemCrossedOff(listId, itemId, crossOff=false)`

Toggle crossed-off state. Returns `Promise<Object>`

### `addItemToList(listId, value, category="uncategorized", autoCategory=false, note=null)`

Add a single item. Returns `Promise<Object>`

### `addItemsToList(listId, items)`

Add multiple items. Returns `Promise<Object>`

### `removeItemFromList(listId, itemId)`

Remove one item. Returns `Promise<Object>`

### `getMasterList()`

Get master list. Returns `Promise<Object>`

### `getCategoryList()`

Get category list. Returns `Promise<Object>`

### `deleteList(listId)`

Delete a list. Returns `Promise<Object>`

### `deleteAllCrossedOffFromList(listId)`

Bulk delete crossed-off items. Returns `Promise<Object>`

### `addItemToMasterList(value, categoryId)`

Add item to master list. Returns `Promise<Object>`

### `changeItemOnList(listId, itemId, categoryId, value)`

Modify an item. Returns `Promise<Object>`

## Exceptions

`InvalidLoginException` is thrown on failed login.

## Tips & Best Practices

1. Always call `await og.login()` first
2. Reuse a single `OurGroceries` instance
3. Cache frequently used list IDs
4. Use `autoCategory=true` when unsure of category
5. Wrap API calls in try/catch
6. Never hardcode credentials

## Troubleshooting

Missing credentials:

- Ensure `OG_USERNAME` and `OG_PASSWORD` are set
- Check with:
  ```bash
  echo $OG_USERNAME
  echo $OG_PASSWORD
  ```

Items not appearing:

- Confirm the correct `listId`
- Ensure `await og.login()` succeeded

Categorization issues:

- Try `autoCategory=true`

Transient failures:

- Add simple retry logic with backoff

## Testing (Vitest)

This project uses Vitest for testing.

Run the test suite:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT

## Credits

Original Python version: https://github.com/ljmerza/py-our-groceries
