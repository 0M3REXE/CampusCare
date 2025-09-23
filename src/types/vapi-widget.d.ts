type VapiTheme = 'light' | 'dark' | 'auto';

interface VapiWidgetAttributes extends Record<string, unknown> {
  'public-key'?: string;
  'assistant-id'?: string;
  theme?: VapiTheme;
  // allow generic data-* attributes without using `any`
  [attr: `data-${string}`]: string | number | boolean | undefined;
}

declare namespace JSX {
  interface IntrinsicElements {
    'vapi-widget': VapiWidgetAttributes;
  }
}


