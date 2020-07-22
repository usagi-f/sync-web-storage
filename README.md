# sync-web-storage

Sharing a value at storage (e.g. local storage) between cross domains. You can work with same storage space from multiple client-side environments. with permissions.

This is a re-implementation of [zendesk/cross-storage](https://github.com/zendesk/cross-storage) with a TypeScript based.
Some interfaces have been changed but the basic structure is the same.
Beased on the Apache-2.0 license, my purpose of this is to keep maintenance easy.

Also, in the original library it was only local storage can be used, but the sync-web-storage injects the Storage interface when creating an instance, so it is theoretically possible to also use session storage.

## Overview

We need to maintain a common state across multiple domain environments for a scalable Web frontend.
A web storage currently exists in the modern browser, which is ideal for keeping client state.
You can use a specific shared storage between multiple domains using the postMessage API.

**Hub**

First, create an instance in the domain that actually holds Storage as Hub, and injects the Storage used here. Generally it is local storage.

After that, it initializes with the permissions setting(a definition of the origin and the methods) to make available.

```js
const syncWebStorageHub = new SyncWebStorage.hub(window.localStorage);
syncWebStorageHub.init([
  {origin: /\.example.com$/,            allow: ['get']},
  {origin: /:\/\/(www\.)?example.com$/, allow: ['get', 'set', 'del']}
]);
```

**Client**

Next, in the domain to be used as Client, generate an instance using the URL of Hub's HTML file.
When you executing, the iframe will be inject to the document and you can share the value using the postMessage API. This iframe element is invisible (by CSS).

```js
const syncWebStorageClient = new SyncWebStorage.client('https://store.example.com/hub.html');

syncWebStorageClient.onConnect().then(() => {
  return client.set('Key', 'foobar');
}).then(() => {
  return client.get('existingKey');
}).then((res) => {
  console.log(res.length); // 2
}).catch((err) => {
  // Handle error
});
```
## Installation

```bash
$ npm i sync-web-storage
```

## API

#### new SyncWebStorage.hub(Storage)

Pass the Storage object and create an instance. An argument interface is Web Storage API.

```js
// localStorage
const syncWebStorageHub = new SyncWebStorage.hub(window.localStorage);

// sessionStorage
const syncWebStorageHub = new SyncWebStorage.hub(window.sessionStorage);
```

#### syncWebStorageHub.init(permissions)

```js
syncWebStorageHub.init([
  {origin: /\.example.com$/,            allow: ['get']},
  {origin: /:\/\/(www\.)?example.com$/, allow: ['get', 'set', 'del']}
]);
```

#### new SyncWebStorage.client(url, [opts])

Pass the HTML file of Hub. Optionally override the timeout setting for async processing. The initial value is `5000`. In the sync-web-storage, the option is only that.

```js
const syncWebStorageClient = new SyncWebStorage.client('https://store.example.com/hub.html');

const syncWebStorageClient = new SyncWebStorage.client('https://store.example.com/hub.html', {
  timeout: 10000,
});
```

#### syncWebStorageClient.onConnect()

A Promise will be returned when the connection with the Hub is established. This is to prevent requests from being sent before initialization.

```js
syncWebStorageClient.onConnect().then(() => {
  // ready!
});
```

#### syncWebStorageClient.set(key, value)

```js
syncWebStorageClient.onConnect().then(() => {
  return syncWebStorageClient.set('key', JSON.stringify({foo: 'bar'}));
});
```

#### syncWebStorageClient.get(key)

If you pass a string, you get a single value.

Unlike cross-storage, if you want to get multiple values, please pass an array of strings without increasing the number of arguments.

```js
syncWebStorageClient.onConnect().then(() => {
  return syncWebStorageClient.get('key1');
}).then((res) => {
  return syncWebStorageClient.get(['key1', 'key2', 'key3']);
}).then((res) => {
  // ...
});
```

#### syncWebStorageClient.del(key)

Pass an array of strings if you want to delete multiple like a get method.

```js
syncWebStorageClient.onConnect().then(() => {
  return syncWebStorageClient.del(['key1', 'key2']);
});
```

#### syncWebStorageClient.getKeys()

```js
syncWebStorageClient.onConnect().then(() => {
  return syncWebStorageClient.getKeys();
}).then((keys) => {
  // ['key1', 'key2', ...]
});
```

#### syncWebStorageClient.clear()

```js
syncWebStorageClient.onConnect().then(() => {
  return syncWebStorageClient.clear();
});
```

#### syncWebStorageClient.close()

Disconnect, communication is stop and remove the iframe from the client. Storage cannot be reuse after it is closed.

```js
syncWebStorageClient.onConnect().then(() => {
  return syncWebStorageClient.set('key1', 'foo');
}).catch((err) => {
  // Handle error
}).then(() => {
  syncWebStorageClient.close();
});
```

## License

I will publish it as Apache-2.0 license along with the original [zendesk/cross-storage](https://github.com/zendesk/cross-storage).
The modified contents are clarified by this readme and the released source code.

http://www.apache.org/licenses/LICENSE-2.0
