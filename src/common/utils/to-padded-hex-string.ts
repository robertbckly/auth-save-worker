export const toPaddedHexString = (arrayBuffer: ArrayBuffer) =>
  Array.from(new Uint8Array(arrayBuffer), (v) => v.toString(16).padStart(2, '0')).join('');
