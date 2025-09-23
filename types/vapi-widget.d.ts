declare namespace JSX {
  interface IntrinsicElements {
    'vapi-widget': {
      'public-key'?: string;
      'assistant-id'?: string;
      theme?: 'light' | 'dark' | 'auto';
      [key: string]: unknown;
    };
  }
}
