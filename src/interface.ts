type Methods = 'get' | 'set' | 'del' | 'clear' | 'getKeys';
type State = 'unavailable' | 'ready' | 'poll';
type Events = Methods | State;
type EventKeys =
  'sync-storage:get' |
  'sync-storage:set' |
  'sync-storage:del' |
  'sync-storage:clear' |
  'sync-storage:getKeys' |
  'sync-storage:ready' |
  'sync-storage:poll';

type Permission = { origin: RegExp, allow: Methods[] };
type PermissionArray = Permission[];
type KeyValueParams = { key: string; value: string };
type KeyArrayParams = { keys: string[] };

type MessageData = {
  id: any;
  method: EventKeys;
  params: KeyValueParams | KeyArrayParams;
};

interface  Window {
  attachEvent(event: string, listener: EventListener): boolean;
  detachEvent(event: string, listener: EventListener): void;
}
