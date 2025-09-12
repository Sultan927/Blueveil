export const truncate = (text: string, max: number): string => {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
};

export const sanitizeSingleLine = (text: string): string => {
  return text.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim();
};

export const normalizeBullet = (text: string): string => {
  const t = sanitizeSingleLine(text);
  return t.replace(/^[-•\u2022\u25CF\u25A0\s]+/, "");
};

export const ensurePeriod = (text: string): string => {
  const t = text.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
};

