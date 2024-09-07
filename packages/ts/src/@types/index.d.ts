declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TUSHARE_API: string;
      TUSHARE_TOKEN: string;

      ALPH_API: string;
      ALPH_TOKEN: string;

      EASTMONEY_API: string;

      MAIL_USER_NAME: string;
      MAIL_PASSWORD: string;

      QQ_MAIL_USER_NAME: string;
      QQ_MAIL_PASSWORD: string;

      ROOT: string;

      POSTGRES_HOST: string;
      POSTGRES_PORT: string;
      POSTGRES_DB: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
