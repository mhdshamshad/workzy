export type AuthSyncEvent =
  | { type: 'LOGOUT'; timestamp?: number }
  | { type: 'LOGIN'; timestamp?: number };

const CHANNEL_NAME = 'workzy_auth_sync';
const STORAGE_KEY = 'workzy_auth_sync_event';

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (err) {
    console.warn('BroadcastChannel not supported or restricted:', err);
  }
}

export function broadcastAuthEvent(event: AuthSyncEvent): void {
  const payload = { ...event, timestamp: Date.now() };

  if (channel) {
    try {
      channel.postMessage(payload);
    } catch (err) {
      console.warn('Failed to post message to BroadcastChannel:', err);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to set auth sync event in localStorage:', err);
  }
}

export function subscribeToAuthSync(onEvent: (event: AuthSyncEvent) => void): () => void {
  let lastProcessedTimestamp = 0;

  const handleMessage = (eventPayload: AuthSyncEvent) => {
    if (!eventPayload || !eventPayload.type) {return;}
    if (eventPayload.timestamp && eventPayload.timestamp <= lastProcessedTimestamp) {
      return;
    }
    if (eventPayload.timestamp) {
      lastProcessedTimestamp = eventPayload.timestamp;
    }
    onEvent(eventPayload);
  };

  const bcListener = (e: MessageEvent<AuthSyncEvent>) => {
    handleMessage(e.data);
  };

  const storageListener = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as AuthSyncEvent;
        handleMessage(parsed);
      } catch (err) {
        console.error('Failed to parse storage auth sync event:', err);
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', bcListener);
  }
  window.addEventListener('storage', storageListener);

  return () => {
    if (channel) {
      channel.removeEventListener('message', bcListener);
    }
    window.removeEventListener('storage', storageListener);
  };
}
