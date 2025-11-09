// Система валидации для форм регистрации и входа
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface ValidationConfig {
  maxNicknameLength: number;
  maxPasswordLength: number;
  maxEmailLength: number;
  nicknamePattern: RegExp;
  passwordPattern: RegExp;
}

// Константы валидации
const VALIDATION_CONFIG: ValidationConfig = {
  maxNicknameLength: 24,
  maxPasswordLength: 48,
  maxEmailLength: 254,
  nicknamePattern: /^[A-Za-z0-9._-]{1,24}$/,
  passwordPattern: /^[\x20-\x7E]{1,48}$/
};

// Разрешенные символы для никнейма
const NICKNAME_ALLOWED_CHARS = /[A-Za-z0-9._-]/;

/**
 * Санитизация никнейма - удаляет недопустимые символы
 */
export function sanitizeNickname(value: string): string {
  if (!value) return '';
  
  let sanitized = '';
  for (const char of value) {
    if (NICKNAME_ALLOWED_CHARS.test(char)) {
      sanitized += char;
    }
  }
  
  return sanitized.slice(0, VALIDATION_CONFIG.maxNicknameLength);
}

/**
 * Санитизация пароля - оставляет только печатные ASCII символы
 */
export function sanitizePassword(value: string): string {
  if (!value) return '';
  
  let sanitized = '';
  for (const char of value) {
    const code = char.charCodeAt(0);
    // Печатные ASCII символы (32-126)
    if (code >= 32 && code <= 126) {
      sanitized += char;
    }
  }
  
  return sanitized.slice(0, VALIDATION_CONFIG.maxPasswordLength);
}

/**
 * Валидация никнейма
 */
export function validateNickname(value: string): ValidationResult {
  const trimmedValue = (value || '').trim();
  
  if (!trimmedValue) {
    return {
      isValid: false,
      message: 'Nickname is required'
    };
  }
  
  if (trimmedValue.length < 3) {
    return {
      isValid: false,
      message: 'Nickname must be at least 3 characters'
    };
  }
  
  if (!VALIDATION_CONFIG.nicknamePattern.test(trimmedValue)) {
    return {
      isValid: false,
      message: 'Nickname is invalid (A–Z, a–z, 0–9, . _ -, max 24)'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}

/**
 * Валидация пароля
 */
export function validatePassword(value: string): ValidationResult {
  const trimmedValue = (value || '').trim();
  
  if (!trimmedValue) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }
  
  if (trimmedValue.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters'
    };
  }
  
  if (!VALIDATION_CONFIG.passwordPattern.test(trimmedValue)) {
    return {
      isValid: false,
      message: 'Password is invalid (printable ASCII, max 48)'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}

/**
 * Валидация email
 */
export function validateEmail(value: string): ValidationResult {
  const trimmedValue = (value || '').trim();
  
  if (!trimmedValue) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }
  
  if (trimmedValue.length > VALIDATION_CONFIG.maxEmailLength) {
    return {
      isValid: false,
      message: 'Email is too long (max 254 characters)'
    };
  }
  
  if (!trimmedValue.includes('@')) {
    return {
      isValid: false,
      message: 'Email must contain @'
    };
  }
  
  // Базовая проверка формата email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedValue)) {
    return {
      isValid: false,
      message: 'Email format is invalid'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}

/**
 * Composable для использования валидации в Vue компонентах
 */
export function useValidation() {
  return {
    sanitizeNickname,
    sanitizePassword,
    validateNickname,
    validatePassword,
    validateEmail,
    VALIDATION_CONFIG
  };
}
