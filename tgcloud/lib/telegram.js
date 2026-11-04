import { api } from 'sdk';
import { richMessage } from './formatter.js';

function replyParameters(message) {
  if (!message?.message_id) return undefined;
  return { message_id: message.message_id, allow_sending_without_reply: true };
}

export async function sendRichToChat(message, markdown, replyMarkup, footer) {
  const payload = {
    chat_id: message.chat.id,
    rich_message: richMessage(markdown, replyMarkup, footer),
  };
  const reply = replyParameters(message);
  if (reply) payload.reply_parameters = reply;
  return api.sendRichMessage(payload);
}

export async function editRichToChat(message, sentMessage, markdown, replyMarkup, footer) {
  if (!sentMessage?.message_id) throw new Error('Missing sent message_id for edit');
  return api.editMessageText({
    chat_id: message.chat.id,
    message_id: sentMessage.message_id,
    rich_message: richMessage(markdown, replyMarkup, footer),
  });
}

function guestResultId(queryId) {
  const safe = String(queryId).replace(/[^a-zA-Z0-9_-]/g, '').slice(-56) || String(Date.now());
  return `kbbi-${safe}`.slice(0, 64);
}

export async function answerGuestRich(message, markdown, replyMarkup, footer) {
  if (!message?.guest_query_id) throw new Error('Missing guest_query_id');
  return api.answerGuestQuery({
    guest_query_id: message.guest_query_id,
    result: {
      type: 'article',
      id: guestResultId(message.guest_query_id),
      title: 'KBBI',
      description: 'Hasil pencarian KBBI',
      input_message_content: { rich_message: richMessage(markdown, replyMarkup, footer) },
    },
  });
}

export async function editGuestRich(sentMessage, markdown, replyMarkup, footer) {
  if (!sentMessage?.inline_message_id) throw new Error('Missing guest inline_message_id for edit');
  return api.editMessageText({
    inline_message_id: sentMessage.inline_message_id,
    rich_message: richMessage(markdown, replyMarkup, footer),
  });
}
