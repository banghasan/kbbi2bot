import { appendResponseTime, renderProcessing } from './formatter.js';

export async function answerSearchWithProgress({ message, argument, answerSearch, sendInitial, sendFallback, edit }) {
  const startedAt = typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now();
  let progressMessage;

  try {
    progressMessage = await sendInitial(renderProcessing());
  } catch (error) {
    console.warn('processing message failed', error?.message);
  }

  const sendResult = async (markdown, replyMarkup) => {
    const duration = (typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now()) - startedAt;
    const finalMarkdown = appendResponseTime(markdown, duration);
    if (progressMessage) {
      try {
        await edit(progressMessage, finalMarkdown, replyMarkup);
        return;
      } catch (error) {
        console.warn('processing message edit failed', error?.message);
      }
    }
    await sendFallback(finalMarkdown, replyMarkup);
  };

  return answerSearch({ message, argument, send: sendResult });
}
