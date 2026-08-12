export const LANGUAGE_CODE_TO_NAME: Record<string, string> = {
  en: 'English',
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Tagalog',
  vi: 'Vietnamese',
  fr: 'French',
  ru: 'Russian',
  th: 'Thai',
  ceb: 'Cebuano',
  cmn: 'Traditional Chinese',
  yue: 'Cantonese',
  ko: 'Korean',
};

export const getLanguageName = (code?: string) => {
  if (!code) return '';
  if (!LANGUAGE_CODE_TO_NAME[code]) return code;
  return LANGUAGE_CODE_TO_NAME[code];
};
