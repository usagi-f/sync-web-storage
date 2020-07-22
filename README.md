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
const syncStorageHub = new SyncStorage.hub(window.localStorage);
syncStorageHub.init([
  {origin: /\.example.com$/,            allow: ['get']},
  {origin: /:\/\/(www\.)?example.com$/, allow: ['get', 'set', 'del']}
]);
```

**Client**

Next, in the domain to be used as Client, generate an instance using the URL of Hub's HTML file.
When you executing, the iframe will be inject to the document and you can share the value using the postMessage API. This iframe element is invisible (by CSS).

```js
const syncStorageClient = new SyncStorage.client('https://store.example.com/hub.html');

syncStorageClient.onConnect().then(() => {
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

WIP

## API

#### new SyncStorage.hub(Storage)

Pass the Storage object and create an instance. An argument interface is Web Storage API.

```js
// localStorage
const syncStorageHub = new SyncStorage.hub(window.localStorage);

// sessionStorage
const syncStorageHub = new SyncStorage.hub(window.sessionStorage);
```

#### syncStorageHub.init(permissions)

```js
syncStorageHub.init([
  {origin: /\.example.com$/,            allow: ['get']},
  {origin: /:\/\/(www\.)?example.com$/, allow: ['get', 'set', 'del']}
]);
```

#### new SyncStorage.client(url, [opts])

Pass the HTML file of Hub. Optionally override the timeout setting for async processing. The initial value is `5000`. In the sync-web-storage, the option is only that.

```js
const syncStorageClient = new SyncStorage.client('https://store.example.com/hub.html');

const syncStorageClient = new SyncStorage.client('https://store.example.com/hub.html', {
  timeout: 10000,
});
```

#### syncStorageClient.onConnect()

A Promise will be returned when the connection with the Hub is established. This is to prevent requests from being sent before initialization.

```js
syncStorageClient.onConnect().then(() => {
  // ready!
});
```

#### syncStorageClient.set(key, value)

```js
syncStorageClient.onConnect().then(() => {
  return syncStorageClient.set('key', JSON.stringify({foo: 'bar'}));
});
```

#### syncStorageClient.get(key)

If you pass a string, you get a single value.

Unlike cross-storage, if you want to get multiple values, please pass an array of strings without increasing the number of arguments.

```js
syncStorageClient.onConnect().then(() => {
  return syncStorageClient.get('key1');
}).then((res) => {
  return syncStorageClient.get(['key1', 'key2', 'key3']);
}).then((res) => {
  // ...
});
```

#### syncStorageClient.del(key)

Pass an array of strings if you want to delete multiple like a get method.

```js
syncStorageClient.onConnect().then(() => {
  return syncStorageClient.del(['key1', 'key2']);
});
```

#### syncStorageClient.getKeys()

```js
syncStorageClient.onConnect().then(() => {
  return syncStorageClient.getKeys();
}).then((keys) => {
  // ['key1', 'key2', ...]
});
```

#### syncStorageClient.clear()

```js
syncStorageClient.onConnect().then(() => {
  return syncStorageClient.clear();
});
```

#### syncStorageClient.close()

Disconnect, communication is stop and remove the iframe from the client. Storage cannot be reuse after it is closed.

```js
syncStorageClient.onConnect().then(() => {
  return syncStorageClient.set('key1', 'foo');
}).catch((err) => {
  // Handle error
}).then(() => {
  syncStorageClient.close();
});
```

## License

I will publish it as Apache-2.0 license along with the original [zendesk/cross-storage](https://github.com/zendesk/cross-storage).
The modified contents are clarified by this readme and the released source code.

http://www.apache.org/licenses/LICENSE-2.0
