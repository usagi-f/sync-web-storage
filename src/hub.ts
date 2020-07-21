type Method = 'get' | 'set' | 'del' | 'clear' | 'getKeys';
type State = 'ready' | 'poll';
type Event = Method | State;
type EventKeys =
  'sync-storage:get' |
  'sync-storage:set' |
  'sync-storage:del' |
  'sync-storage:clear' |
  'sync-storage:getKeys' |
  'sync-storage:ready' |
  'sync-storage:poll';

type Permission = { origin: RegExp, allow: Method[] };
type Permissions = Permission[];
type KeyValueParams = { key: string; value: string };
type KeyArrayParams = { keys: string[] };

type Request = {
  id: any;
  method: EventKeys;
  params: KeyValueParams | KeyArrayParams;
};

declare global {
  interface Window {
    attachEvent(event: string, listener: EventListener): boolean;
    detachEvent(event: string, listener: EventListener): void;
  }
}

const availableMethods: Method[] = ['get', 'set', 'del', 'clear', 'getKeys'];

/**
 * @example
 * ```
 * const syncStorageHub = new SyncStorageHub(window.localStorage);
 * syncStorageHub.init([
 *   {origin: /\.example.com$/,        allow: ['get']},
 *   {origin: /:(www\.)?example.com$/, allow: ['get', 'set', 'del']}
 * ]);
 * ```
 */

export default class SyncStorageHub {
  private storage: Storage;
  private permissions: Permissions;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  public init(permissions: Permissions): void {
    this.permissions = permissions || [];
    this._installListener();
    window.parent.postMessage('sync-storage:ready', '*');
  }

  private _installListener(): void {
    const listener = this._listener;
    if (window.addEventListener) {
      window.addEventListener('message', listener, false);
    } else {
      window.attachEvent('onmessage', listener);
    }
  }

  private _listener(message: MessageEvent): void {
    let errorMessage: string;
    let request: Request;
    let result: Function;

    try {
      request = JSON.parse(message.data);
    } catch (err) {
      return;
    }

    const event = request.method.split('sync-storage:')[1] as Event;
    if (!event) return;

    if (event === 'ready') return;
    if (event === 'poll') {
      return window.parent.postMessage('sync-storage:ready', message.origin);
    }

    try {
      const permitted = this._permitted(message.origin, event);
      if (permitted) {
        result = this[`_${event}`](request.params);
      } else {
        errorMessage = `Invalid permissions for ${event}`;
      }
    } catch (err) {
      errorMessage = err.message;
    }

    const response = JSON.stringify({
      id: request.id,
      error: errorMessage,
      result: result,
    });

    const targetOrigin = (message.origin === 'null') ? '*' : message.origin;

    window.parent.postMessage(response, targetOrigin);
  }

  private _permitted(origin: string, method: Method): boolean {
    if (availableMethods.includes(method)) return false;

    this.permissions.forEach(permission => {
      const match = permission.origin.test(origin);
      const allow = permission.allow.includes(method);
      if (match && allow) return true;
    });

    return false;
  }

  private _set(params: KeyValueParams): void {
    this.storage.setItem(params.key, params.value);
  }

  private _get(params: KeyArrayParams): string | string[] {
    const result = params.keys.map(key => {
      try {
        return this.storage.getItem(key);
      } catch (e) {
        return null;
      }
    })
    return (result.length > 1) ? result : result[0];
  };

  private _del(params: KeyArrayParams): void {
    params.keys.forEach(key => {
      this.storage.removeItem(key);
    });
  };

  private _clear(): void {
    this.storage.clear();
  };

  private _getKeys(): string[] {
    return [...Array(this.storage.length)].map((_, i) => this.storage.key(i));
  };
}
