/*disable-eslint*/
'use client';

import { useEffect } from 'react';

type VapiWidgetProps = {
  publicKey?: string;
  assistantId?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
};

/**
 * Client-side wrapper for the Vapi Web Widget.
 * It lazy-loads the Vapi web component script and renders <vapi-widget>.
 *
 * Configure using public env vars in .env:
 * - NEXT_PUBLIC_VAPI_PUBLIC_KEY
 * - NEXT_PUBLIC_VAPI_ASSISTANT_ID
 */
export default function VapiWidget({
  publicKey,
  assistantId,
  theme = 'auto',
  className,
}: VapiWidgetProps) {
  const apiKey = publicKey ?? process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const asstId = assistantId ?? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scriptId = 'vapi-web-widget-script';
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) return; // already loaded

    const s = document.createElement('script');
    s.id = scriptId;
    s.async = true;
    // Fallback to jsDelivr if primary fails could be added, keep simple here
    s.src = 'https://unpkg.com/@vapi-ai/web@latest/dist/browser/index.js';
    document.head.appendChild(s);
  }, []);

  if (!apiKey || !asstId) {
    return (
      <div className={className}>
        <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
          Missing Vapi config. Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID in your .env.
        </div>
      </div>
    );
  }

  // Note: Attribute names follow the commonly used Vapi snippet (public-key, assistant-id).
  // If your account uses different attribute names, update them below to match your snippet.
  return (
    <div className={className}>
      {
        // Render the custom element directly so it upgrades once the script loads
      }
      <vapi-widget public-key={apiKey} assistant-id={asstId} theme={theme} />
    </div>
  );
}
