import { SyncWebStorageClient } from '../../../src/client';

const syncWebStorageClient = new SyncWebStorageClient('http://localhost:3001/index.html');

const setKey1 = () => syncWebStorageClient.onConnect().then(() => syncWebStorageClient.set('key1', 'foo'));
const setKey2 = () => syncWebStorageClient.onConnect().then(() => syncWebStorageClient.set('key2', 'bar'));
const getKey1 = () => syncWebStorageClient.onConnect().then(() => {
  syncWebStorageClient.get('key1').then((res) => {
    console.log(res)
    alert(res)
  });
});
const getKey2 = () => syncWebStorageClient.onConnect().then(() => {
  syncWebStorageClient.get('key2').then((res) => alert(res));
});
const getKey1and2 = () => syncWebStorageClient.onConnect().then(() => {
  syncWebStorageClient.get(['key1', 'key2']).then((res) => alert(res));
});

const clearStorage = () => {
  syncWebStorageClient.onConnect().then(() => {
    syncWebStorageClient.clear();
  });
};

const set1 = document.getElementById('set1');
const set2 = document.getElementById('set2');
const get1 = document.getElementById('get1');
const get2 = document.getElementById('get2');
const get3 = document.getElementById('get3');
const clear = document.getElementById('clear');

set1.addEventListener('click', setKey1);
set2.addEventListener('click', setKey2);
get1.addEventListener('click', getKey1);
get2.addEventListener('click', getKey2);
get3.addEventListener('click', getKey1and2);
clear.addEventListener('click', clearStorage);
