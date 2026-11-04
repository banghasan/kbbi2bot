export function isAdmin(message, adminIds = []) {
  const id = message?.from?.id;
  return id != null && adminIds.includes(String(id));
}
