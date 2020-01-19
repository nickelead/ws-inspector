export function grep(text: string, regexp: RegExp) {
  if (!(text && regexp)) {
    return '';
  }
  try {
    const matchAll = text.matchAll(regexp);
    const matchAllArray = Array.from(matchAll);
    const firstMach = matchAllArray[0][1] || matchAllArray[0][0];
    if (!firstMach) {
      return '';
    }
    return firstMach;
  } catch (e) {}
  return '';
}
const padded = (num: number, d: number) => num.toFixed(0).padStart(d, '0');

export const TimeStamp = (time: Date) => {
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();
  return `${padded(h, 2)}:${padded(m, 2)}:${padded(s, 2)}.${padded(ms, 3)}`;
};

export const stringToBuffer = (str: string) => {
  const ui8 = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) {
    ui8[i] = str.charCodeAt(i);
  }
  return ui8;
};
