import { v4 as uuidv4 } from 'uuid';

/**
 * @example
 * ```
 * const syncWebStorageClient = new SyncWebStorageClient('https://*.com/hub.html');
 * ```
 * @example
 * ```
 * const syncWebStorageClient = new SyncWebStorageClient('https://*.com/hub.html', {
 *   timeout: 5000,
 * });
 * ```
 */

export default class SyncWebStorageClient {
  private id: string;
  private frameId: string;
  private origin: string;
  private requests: {connect: any[]};
  private connected: boolean;
  private closed: boolean;
  private count: number;
  private timeout: number;
  private listener: (message: MessageEvent) => void;
  private frame: HTMLIFrameElement;
  private hub: Window;

  constructor(url: string, options?: ClientOptions) {
    this.id        = uuidv4();
    this.frameId   = `SyncWebStorageClient-${this.id}`;
    this.origin    = this._getOrigin(url);
    this.requests  = {connect: []};
    this.connected = false;
    this.closed    = false;
    this.count     = 0;
    this.timeout   = options?.timeout || 5000;
    this.listener  = null;

    this._installListener();

    this.frame = this._createFrame(url);
    this._poll();

    this.hub = this.frame.contentWindow;
  }

  private _getOrigin = (url: string): string => {
    if (URL) {
      const hub = new URL(url);
      return hub.origin;
    } else {
      const uri = document.createElement('a');
      uri.href = url;
      return `${uri.protocol}//${uri.hostname}`;
    }
  }

  private _createFrame = (url: string): HTMLIFrameElement => {
    const element = document.createElement('iframe');
    element.id = this.frameId;
    element.setAttribute('style', 'display:none;');

    document.body.appendChild(element);
    element.src = url;
    return element;
  }

  private _installListener = (): void => {
    this.listener = (message: SyncMessageEvent): void => {
      let response: ResponseData;
      let error: ResponseData['error'];

      // newした時に設定したoriginではない場合は処理しない
      if (this.closed || message.origin !== this.origin) return;
      if (message.data === 'sync-web-storage:unavailable') {
        if (!this.closed) this.close();
        if (!this.requests.connect) return;

        error = new Error('Closing client. Could not access storage in hub.');
        [...Array(this.requests.connect.length)].map((_, i) => {
          this.requests.connect[i](error);
        });
        return;
      }

      // Initial connection
      if (message.data.includes('sync-web-storage:') && !this.connected) {
        this.connected = true;
        if (!this.requests.connect) return;

        [...Array(this.requests.connect.length)].map((_, i) => {
          this.requests.connect[i](error);
        });
        delete this.requests.connect;
      }

      if (message.data === 'sync-web-storage:ready') return;

      try {
        response = JSON.parse(message.data);
      } catch (err) {
        return;
      }

      if (!response.id) return;
      if (this.requests[response.id]) {
        this.requests[response.id](response.error, response.result);
      }
    }

    if (window.addEventListener) {
      window.addEventListener('message', this.listener, false);
    } else {
      window.attachEvent('onmessage', this.listener);
    }
  }

  public onConnect = (): Promise<any> => {
    if (this.connected) {
      return Promise.resolve();
    } else if (this.closed) {
      return Promise.reject(new Error('SyncWebStorageClient has closed'));
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('SyncWebStorageClient could not connect'));
      }, this.timeout);

      this.requests.connect.push((err: Error) => {
        clearTimeout(timeout);
        if (err) return reject(err);
        resolve();
      })
    })
  }

  private _request = (method: Methods, params?: KeyValueParams | KeyArrayParams): Promise<any> => {
    if (this.closed) {
      return Promise.reject(new Error('CrossStorageClient has closed'));
    }

    this.count++;

    const request: RequestData = {
      id: `${this.id}:${this.count}`,
      method: `sync-web-storage:${method}` as EventKeys,
      params,
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!this.requests[request.id]) return;

        delete this.requests[request.id];
        reject(new Error(`Timeout: could not perform ${request.method}`));
      }, this.timeout);

      // Add request callback
      this.requests[request.id] = (err: string, result: ResponseData['result']) => {
        clearTimeout(timeout);
        if (err) return reject(new Error(err));
        resolve(result);
      }

      const targetOrigin = (this.origin === 'null') ? '*' : this.origin;

      this.hub.postMessage(JSON.stringify(request), targetOrigin);
    })
  }

  private _poll = (): void => {
    const targetOrigin = (this.origin === 'null') ? '*' : this.origin;

    const interval = setInterval(() => {
      if (this.connected) return clearInterval(interval);
      if (!this.hub) return;

      this.hub.postMessage('cross-storage:poll', targetOrigin);
    }, 1000);
  }

  public set = (key: string, value: string): Promise<void> => {
    return this._request('set', { key, value });
  }

  public get = (key: string | string[]): Promise<string> => {
    const keys = typeof key === 'string' ? [key] : key;
    return this._request('get', { keys });
  }

  public del = (key: string | string[]): Promise<void> => {
    const keys = typeof key === 'string' ? [key] : key;
    return this._request('del', { keys });
  }

  public clear = (): Promise<void> => {
    return this._request('clear');
  }

  public getKeys = (): Promise<string[]> => {
    return this._request('getKeys');
  }

  public close = (): void => {
    const element = document.getElementById(this.frameId);
    if (element) {
      element.parentNode.removeChild(element);
    }

    if (window.removeEventListener) {
      window.removeEventListener('message', this.listener, false);
    } else {
      window.detachEvent('onmessage', this.listener);
    }

    this.connected = false;
    this.closed = true;
  }
}
