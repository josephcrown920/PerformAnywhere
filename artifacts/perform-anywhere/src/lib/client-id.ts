const KEY = "ps_client_id";

export function getClientId(): string {
  let id = window.localStorage.getItem(KEY);
  if (!id || !isUuid(id)) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function resetClientId(): string {
  const id = crypto.randomUUID();
  window.localStorage.setItem(KEY, id);
  return id;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
