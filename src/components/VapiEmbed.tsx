'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  publicKey?: string;
  assistantId?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
};

export default function VapiEmbed({ publicKey, assistantId, theme = 'auto', className }: Props) {
  const apiKey = publicKey ?? process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const asstId = assistantId ?? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scriptId = 'vapi-web-widget-script';

    const waitForCustomElement = async () => {
      // If already defined, we're ready
      if (customElements.get('vapi-widget')) return true;
      // Wait until defined
      try {
        await customElements.whenDefined('vapi-widget');
      } catch {
        // noop
      }
      return !!customElements.get('vapi-widget');
    };

    const ensureScript = async () => {
      if (document.getElementById(scriptId)) {
        return waitForCustomElement();
      }
      return new Promise<boolean>((resolve) => {
        const s = document.createElement('script');
        s.id = scriptId;
        s.async = true;
        s.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/browser/index.js';
        s.onload = async () => {
          const ok = await waitForCustomElement();
          resolve(ok);
        };
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
      });
    };

    let cancelled = false;
    ensureScript().then((ok) => {
      if (!cancelled) setReady(!!ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !apiKey || !asstId) return;
    const host = containerRef.current;
    if (!host) return;
    // Clear any prior instance
    host.innerHTML = '';
    // Create and configure the widget element
    type VapiWidgetElement = HTMLElement & {
      start?: () => void;
      stop?: () => void;
    };
    const widget = document.createElement('vapi-widget') as unknown as VapiWidgetElement;
    widget.setAttribute('public-key', String(apiKey));
    widget.setAttribute('assistant-id', String(asstId));
    widget.setAttribute('theme', theme);
    host.appendChild(widget);
    // Try to auto-start mic/session when mounted
    try {
      if (widget.start) widget.start();
    } catch {
      // ignore
    }
    // Cleanup: stop and remove element
    return () => {
      try {
        if (widget.stop) widget.stop();
      } catch {
        // ignore
      }
      if (host.contains(widget)) host.removeChild(widget);
    };
  }, [ready, apiKey, asstId, theme]);

  if (!apiKey || !asstId) {
    return (
      <div className={className}>
        <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
          Voice is not configured. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID to your .env.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {!ready && (
        <div className="mb-2 text-sm text-foreground/70">Loading voice assistant…</div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
