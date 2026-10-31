// How we describe the tool to the model
export const timeTool = {
  type: 'function',
  function: {
    name: 'get_current_time',
    description: 'Get the current date and time in Lagos.',
    parameters: { type: 'object', properties: {} },
  },
};

// The function we run when the model asks for it
export function getCurrentTime() {
  return {
    now: new Date().toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'full',
      timeStyle: 'short',
    }),
  };
}