let listeners = [];
let idCounter = 0;

export function showToast(message, type = 'success') {
  const id = idCounter++;
  const toast = { id, message, type };
  listeners.forEach(l => l(toast));
}

export function subscribeToasts(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}
