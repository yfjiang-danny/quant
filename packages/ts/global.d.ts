declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      TUSHARE_API: string;
      TUSHARE_TOKEN: string;
      ALPH_API: string;
      ALPH_TOKEN: string;
      EASTMONEY_API: string;
      SERVICE_API: string;
      MAIL_USER_NAME: string;
      MAIL_PASSWORD: string;
    }
  }
}
export {};
