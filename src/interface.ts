type Methods = 'get' | 'set' | 'del' | 'clear' | 'getKeys';
type State = 'unavailable' | 'ready' | 'poll';
type Events = Methods | State;
type EventKeys =
  'sync-web-storage:get' |
  'sync-web-storage:set' |
  'sync-web-storage:del' |
  'sync-web-storage:clear' |
  'sync-web-storage:getKeys' |
  'sync-web-storage:unavailable' |
  'sync-web-storage:ready' |
  'sync-web-storage:poll';

type Permission = { origin: RegExp, allow: Methods[] };
type PermissionArray = Permission[];
type KeyValueParams = { key: string; value: string };
type KeyArrayParams = { keys: string[] };

type MessageId = string; // `${uuid}:${count}`
type RequestData = {
  id: MessageId;
  method: EventKeys;
  params: KeyValueParams | KeyArrayParams;
};
type ResponseData = {
  id: MessageId;
  error: Error | string;
  result: void | string | string[];
};
interface SyncMessageEvent extends MessageEvent {
  data: string; // JSON.stringify(RequestData | ResponseData)
}

type ClientOptions = {
  timeout?: number;
};

interface  Window {
  attachEvent(event: string, listener: EventListener): boolean;
  detachEvent(event: string, listener: EventListener): void;
}
