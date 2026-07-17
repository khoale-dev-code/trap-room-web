const CHANNEL_NAME = "trap-room-data-sync";
const STORAGE_KEY = "trap-room:last-data-change";
const EVENT_NAME = "trap:data-changed";

let channel;

function getChannel() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }

  return channel;
}

export function notifyDataChanged(detail = {}) {
  if (typeof window === "undefined") return;

  const message = {
    type: "DATA_CHANGED",
    timestamp: Date.now(),
    ...detail,
  };

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: message }));

  try {
    getChannel()?.postMessage(message);
  } catch {
    // BroadcastChannel can be unavailable in private browsing modes.
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch {
    // localStorage can be unavailable in private browsing modes.
  }
}

export function subscribeDataChanged(callback) {
  if (typeof window === "undefined") return () => {};

  const handleLocal = (event) => callback(event.detail || {});
  const handleChannel = (event) => callback(event.data || {});
  const handleStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;

    try {
      callback(JSON.parse(event.newValue));
    } catch {
      callback({});
    }
  };

  const activeChannel = getChannel();

  window.addEventListener(EVENT_NAME, handleLocal);
  window.addEventListener("storage", handleStorage);
  activeChannel?.addEventListener("message", handleChannel);

  return () => {
    window.removeEventListener(EVENT_NAME, handleLocal);
    window.removeEventListener("storage", handleStorage);
    activeChannel?.removeEventListener("message", handleChannel);
  };
}
