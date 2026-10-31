import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import Groq from 'groq-sdk';

// Initialize clients
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const messageHistory = [
  { role: 'system', content: 'You are a friendly assistant. Keep answers short.' },
];

async function askGroq(userText) {
  messageHistory.push({ role: 'user', content: userText });

  const res = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: messageHistory,
  });

  const message = res.choices[0].message.content;
  messageHistory.push({ role: 'assistant', content: message });
  return reply;
}

bot.on('message', async (textMsg) => {
  const chatId = textMsg.chat.id;
  const userText = textMsg.text;

  if (!userText || userText.startsWith('/')) return;

  try {
    const groqResponse = await askGroq(userText);
    bot.sendMessage(chatId, groqResponse);
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'Sorry, I had trouble thinking. Please try again.');
  }
});

bot.on('polling_error', (err) => console.log('Polling error:', err.code));

console.log('Bot is running...');