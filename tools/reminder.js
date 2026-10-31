const TIMEZONE = 'Africa/Lagos';

const format = (ms) =>
  new Date(ms).toLocaleString('en-NG', {
    timeZone: TIMEZONE,
    dateStyle: 'full',
    timeStyle: 'short',
  });

// How we describe the tools to the model
export const reminderTools = [
  {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Get the current date and time. Use this before setting a reminder for a clock time like "5pm".',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_reminder',
      description: 'Set a reminder. The bot messages the user when the time comes. If the user has not said when, ask them when instead of calling this tool.',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'What to remind the user about' },
          minutes: { type: 'number', description: 'How many minutes from now' },
        },
        required: ['message', 'minutes'],
      },
    },
  },
];

// The functions we run when the model asks for them
export const reminderFunctions = {
  get_current_time: () => ({ now: format(Date.now()), timezone: TIMEZONE }),

  set_reminder: ({ message, minutes }, chatId, bot) => {
    if (!(minutes > 0)) return { error: 'minutes must be above 0' };

    setTimeout(() => bot.sendMessage(chatId, `⏰ Reminder: ${message}`), minutes * 60 * 1000);

    return { ok: true, message, due: format(Date.now() + minutes * 60 * 1000) };
  },
};