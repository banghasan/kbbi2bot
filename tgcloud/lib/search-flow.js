import { renderProcessing, responseTimeFooter } from './formatter.js';

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
    const footer = responseTimeFooter(duration);
    if (progressMessage) {
      try {
        await edit(progressMessage, markdown, replyMarkup, footer);
        return;
      } catch (error) {
        console.warn('processing message edit failed', error?.message);
      }
    }
    await sendFallback(markdown, replyMarkup, footer);
  };

  return answerSearch({ message, argument, send: sendResult });
}
