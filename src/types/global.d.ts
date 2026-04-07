declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: unknown;
        getElement?: (id: string) => unknown;
      };
    };
  }
}