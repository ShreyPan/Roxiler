const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const sanitizeTextInput = (value = '') => String(value).replace(CONTROL_CHAR_REGEX, '');

export const sanitizeSearchInput = (value = '') => sanitizeTextInput(value)
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '');

export const sanitizeEmailInput = (value = '') => sanitizeTextInput(value)
    .replace(/\s+/g, '')
    .toLowerCase();

export const sanitizePasswordInput = (value = '') => String(value).replace(/[\u0000-\u001F\u007F]/g, '');

export const normalizeSingleLineForSubmit = (value = '') => sanitizeTextInput(value)
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeMultilineForSubmit = (value = '') => sanitizeTextInput(value)
    .replace(/\s+/g, ' ')
    .trim();