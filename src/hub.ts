/**
 * @example
 * ```
 * const syncWebStorageHub = new SyncWebStorageHub(window.localStorage);
 * syncWebStorageHub.init([
 *   {origin: /\.example.com$/,        allow: ['get']},
 *   {origin: /:(www\.)?example.com$/, allow: ['get', 'set', 'del']}
 * ]);
 * ```
 */

export class SyncWebStorageHub {
  private storage: Storage;
  private permissions: PermissionArray;
  private availableMethods: Methods[];

  constructor(storage: Storage) {
    this.storage = storage;
    this.permissions = [];
    this.availableMethods = ['get', 'set', 'del', 'clear', 'getKeys'];
  }

  public init = (permissions: PermissionArray): void => {
    if (this.storage) {
      this.permissions = permissions;
      this._installListener();
      window.parent.postMessage('sync-web-storage:ready', '*');
    } else {
      window.parent.postMessage('sync-web-storage:unavailable', '*');
    }
  }

  private _installListener = (): void => {
    const listener = this._listener;
    if (window.addEventListener) {
      window.addEventListener('message', listener, false);
    } else {
      window.attachEvent('onmessage', listener);
    }
  }

  private _listener = (message: SyncMessageEvent): void => {
    let errorMessage: string = '';
    let request: RequestData;
    let result: ResponseData['result'];

    try {
      request = JSON.parse(message.data);
    } catch (err) {
      return;
    }

    const event = request.method.split('sync-web-storage:')[1] as Events;
    if (!event) return;

    if (event === 'ready') return;
    if (event === 'poll') {
      return window.parent.postMessage('sync-web-storage:ready', message.origin);
    }

    try {
      const permitted = this._permitted(message.origin, event as Methods);
      if (permitted) {
        const methodName = `_${event as Methods}`;
        // Really should avoid the bracket syntax. So temporarily enabled suppressImplicitAnyIndexErrors option in tsconfig.
        result = this[methodName](request.params);
      } else {
        errorMessage = `Invalid permissions for ${event}`;
      }
    } catch (err) {
      errorMessage = err.message;
    }

    const responseData: ResponseData = {
      id: request.id,
      error: errorMessage,
      result: result,
    };
    const targetOrigin = (message.origin === 'null') ? '*' : message.origin;

    window.parent.postMessage(JSON.stringify(responseData), targetOrigin);
  }

  private _permitted = (origin: string, method: Methods): boolean => {
    if (!this.availableMethods.includes(method)) return false;

    return this.permissions.some(permission => {
      const match = permission.origin.test(origin);
      const allow = permission.allow.includes(method);
      return match && allow;
    });
  }

  private _set = (params: KeyValueParams): void => {
    this.storage.setItem(params.key, params.value);
  }

  private _get = (params: KeyArrayParams): string | null | (string | null)[] => {
    const result = params.keys.map(key => {
      try {
        return this.storage.getItem(key);
      } catch (e) {
        return null;
      }
    })
    return (result.length > 1) ? result : result[0];
  };

  private _del = (params: KeyArrayParams): void => {
    params.keys.forEach(key => {
      this.storage.removeItem(key);
    });
  };

  private _clear = (): void => {
    this.storage.clear();
  };

  private _getKeys = (): (string | null)[] => {
    return [...Array(this.storage.length)].map((_, i) => this.storage.key(i));
  };
}
