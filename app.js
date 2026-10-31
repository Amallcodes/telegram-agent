import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import Groq from 'groq-sdk';
import { timeTool, getCurrentTime } from './tools/time.js'; // NEW

// Initialize clients
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const messageHistory = [
  { role: 'system', content: 'You are a friendly assistant. Keep answers short.' },
];

// NEW: web search and our own tool
// NEW: web search, a remote MCP server, and our own tool
const tools = [
  { type: 'browser_search' },
  { type: 'mcp', server_label: 'Huggingface', server_url: 'https://huggingface.co/mcp' },
  timeTool,
];
const toolFunctions = { get_current_time: getCurrentTime };

async function askGroq(userText) {
  messageHistory.push({ role: 'user', content: userText });

  // NEW: loop until the model gives a final answer instead of asking for a tool
  for (let i = 0; i < 5; i++) {
    const res = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: messageHistory,
      tools,
    });

    const message = res.choices[0].message;
    messageHistory.push({
      role: 'assistant',
      content: message.content || '',
      ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
    });

    // No tool asked for, so this is the final answer
    if (!message.tool_calls?.length) return msg.content || 'Done.';

    // The model asked for our tool: run it and send the result back
    for (const call of message.tool_calls) {
      console.log('Tool used:', call.function.name);

      // const result = toolFunctions[call.function.name]() || { error: 'Unknown tool' };

      let result;

      if (call.function.name === 'get_current_time') {
        result = getCurrentTime();
      }

      messageHistory.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }

  return 'I got stuck on that one. Please try again.';
}

bot.on('message', async (textMsg) => {
  const chatId = textMsg.chat.id;
  const userText = textMsg.text;

  // Ignore anything that isn't plain text (photos, stickers, commands)
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