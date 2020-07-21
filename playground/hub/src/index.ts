import SyncStorage from '../../../src/index';

const syncStorageHub = new SyncStorage.hub(window.localStorage);
syncStorageHub.init([
  {origin: /.*localhost:300\d$/, allow: ['get', 'set', 'del']}
]);
