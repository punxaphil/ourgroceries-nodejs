export const BASE_URL = 'https://www.ourgroceries.com';
export const SIGN_IN_URL = `${BASE_URL}/sign-in`;
export const YOUR_LISTS_URL = `${BASE_URL}/your-lists/`;

export const COOKIE_KEY_SESSION = 'ourgroceries-auth';

export const FORM_KEY_USERNAME = 'emailAddress';
export const FORM_KEY_PASSWORD = 'password';
export const FORM_KEY_PASSWORD_CONFIRM = 'passwordAgain';
export const FORM_KEY_ACTION = 'action';
export const FORM_VALUE_EMAIL_ACTION = 'email-address';
export const FORM_VALUE_PASSWORD_ACTION = 'sign-in';

export const COMMAND_GET_LIST = 'getList';
export const COMMAND_GET_OVERVIEW = 'getOverview';
export const COMMAND_SET_ITEM_CROSSED_OFF = 'setItemCrossedOff';
export const COMMAND_INSERT_ITEM = 'insertItem';
export const COMMAND_INSERT_ITEMS = 'insertItems';
export const COMMAND_DELETE_ITEM = 'deleteItem';
export const COMMAND_CREATE_LIST = 'createList';
export const COMMAND_DELETE_LIST = 'deleteList';
export const COMMAND_GET_CATEGORY_LIST = 'getCategoryList';
export const COMMAND_CHANGE_ITEM_VALUE = 'changeItemValue';
export const COMMAND_DELETE_ALL_CROSSED_OFF_ITEMS = 'deleteAllCrossedOffItems';

export const REGEX_TEAM_ID = /g_teamId = "(.*)";/;
export const REGEX_STATIC_METALIST = /g_staticMetalist = (\[.*]);/;
export const REGEX_MASTER_LIST_ID = /g_masterListUrl = "\/your-lists\/list\/(\S*)"/;

export const DEFAULT_TIMEOUT_MS = 15_000;
export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; OurGroceriesTSClient/1.0; +https://www.ourgroceries.com)';
