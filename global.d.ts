declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vapi-widget': {
        'public-key'?: string;
        'assistant-id'?: string;
        theme?: 'light' | 'dark' | 'auto';
        // allow additional arbitrary attributes (e.g., data-*)
        [key: string]: unknown;
      };
    }
  }
}

export {};
