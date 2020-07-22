import SyncWebStorage from '../../../src/index';

const syncWebStorageHub = new SyncWebStorage.hub(window.localStorage);
syncWebStorageHub.init([
  {origin: /.*localhost:300\d$/, allow: ['get', 'set', 'del', 'clear', 'getKeys']}
]);
