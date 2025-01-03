export const createSessionID = (): string => {
  const array = new Uint8Array(16); // 128-bit
  self.crypto.getRandomValues(array);
  return Array.from(array, (v) => v.toString(16).padStart(2, '0')).join('');
};
