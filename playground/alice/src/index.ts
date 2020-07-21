import SyncStorage from '../../../src/index';

const client = new SyncStorage.client('http://localhost:3001/index.html');

client.onConnect().then(() => {
  return client.set('key1', 'foo').then(() => {
    return client.set('key2', 'bar');
  })
}).then(() => {
  return client.get('key1');
}).then((res) => {
  console.log(res);
});
