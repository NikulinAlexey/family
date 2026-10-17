// Общие логгеры приложения (используются в App и компонентах списков).
export const log = (message, data) =>
  data === undefined ? console.log(`[APP] ${message}`) : console.log(`[APP] ${message}`, data);

export const logError = (message, error) => {
  console.group(`[APP ERROR] ${message}`);
  console.error(error);
  console.groupEnd();
};
