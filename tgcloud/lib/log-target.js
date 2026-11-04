export function logTarget(config = {}) {
  const chatId = String(config.chatId ?? '').trim();
  if (!chatId) return null;
  const threadId = String(config.threadId ?? '').trim();
  if (threadId && (!/^[1-9]\d*$/.test(threadId) || !Number.isSafeInteger(Number(threadId)))) {
    throw new Error('KBBI_LOG_THREAD_ID harus berupa bilangan bulat positif.');
  }
  return {
    chat_id: chatId,
    ...(threadId ? { message_thread_id: Number(threadId) } : {}),
  };
}
