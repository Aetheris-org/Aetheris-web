/**
 * Утилита для логирования
 * В production все логи отключены, в development - включены
 */
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    // Ошибки всегда логируем
    console.error(...args)
  },
  warn: (...args: any[]) => {
    // Предупреждения всегда логируем
    console.warn(...args)
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args)
    }
  },
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args)
    }
  },
}


