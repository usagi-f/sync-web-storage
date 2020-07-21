import SyncStorage from '../../../src/index';

const client = new SyncStorage.client('http://localhost:3001/index.html');

const setKey1 = () => client.onConnect().then(() => client.set('key1', 'foo'));
const setKey2 = () => client.onConnect().then(() => client.set('key2', 'bar'));
const getKey1 = () => client.onConnect().then(() => {
  client.get('key1').then((res) => {
    console.log(res)
    alert(res)
  });
});
const getKey2 = () => client.onConnect().then(() => {
  client.get('key2').then((res) => alert(res));
});
const getKey1and2 = () => client.onConnect().then(() => {
  client.get(['key1', 'key2']).then((res) => alert(res));
});

const clearStorage = () => {
  client.onConnect().then(() => {
    client.clear();
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
