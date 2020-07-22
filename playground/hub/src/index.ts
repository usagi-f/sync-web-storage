import { SyncWebStorageHub } from '../../../src/hub';

const syncWebStorageHub = new SyncWebStorageHub(window.localStorage);
syncWebStorageHub.init([
  {origin: /.*localhost:300\d$/, allow: ['get', 'set', 'del', 'clear', 'getKeys']}
]);
