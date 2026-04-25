"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const PIXEL_ID = "1435231174585042";
const MAIN_VALUE  = 97.00;
const UPSELL_VALUE = 47.00;

// ── Pixel helpers ─────────────────────────────────────────────
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return m ? decodeURIComponent(m[2]) : "";
}

function generateEventId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

async function sendCAPI(
  eventName: string,
  value: number,
  currency: string,
  eventId: string
) {
  try {
    const fbc = getCookie("_fbc");
    const fbp = getCookie("_fbp");
    await fetch("/.netlify/functions/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        userData: { fbc, fbp },
        eventData: {
          url: window.location.href,
          customData: { value, currency, content_type: "product" },
        },
      }),
      keepalive: true,
    });
  } catch (_) {}
}

// ── Main component ────────────────────────────────────────────
function ThankYouContent() {
  const params  = useSearchParams();
  const email   = params.get("email") || "";
  const upsell  = params.get("upsell") === "1";

  const value    = upsell ? MAIN_VALUE + UPSELL_VALUE : MAIN_VALUE;
  const currency = "USD";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventId = generateEventId();

    if (!(window as any).fbq) {
      const script = document.createElement("script");
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
      `;
      document.head.appendChild(script);
    }

    const fbq = (window as any).fbq;
    if (!fbq) return;

    fbq("track", "Purchase", {
      value,
      currency,
      content_type: "product",
      content_name: upsell ? "Metaxon™ Protocol + Sleep Guide" : "Metaxon™ Protocol",
    }, { eventID: eventId });

    sendCAPI("Purchase", value, currency, eventId);

  }, [upsell, value]);

  const NEXT_STEPS = [
    {
      step: "1",
      title: "Check your email",
      desc: `Your access link is on its way to ${email || "your inbox"}. Check spam if needed.`,
    },
    {
      step: "2",
      title: "Click the link",
      desc: "One tap — no password needed. You'll be inside in seconds.",
    },
    {
      step: "3",
      title: "Start Module 1",
      desc: "Begin with the Elite Protocol. 20 minutes is all you need to start.",
    },
  ];

  return (
    <div className="min-h-screen bg-navy relative z-10 flex flex-col">
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=Purchase&noscript=1`}
          alt=""
        />
      </noscript>

      <div className="bg-ink border-b border-gold/10 py-2.5 px-4">
        <p className="text-center text-[11px] tracking-widest text-muted uppercase font-body">
          Metaxon™ Protocol
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center">

          <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center mx-auto mb-8 animate-fade-in">
            <svg className="w-9 h-9 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="animate-fade-up">
            <p className="text-xs tracking-[0.3em] text-gold uppercase font-body mb-3">
              Payment Confirmed
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-light text-white leading-tight mb-4">
              You&apos;re In.
            </h1>
            <p className="text-muted font-body text-base leading-relaxed mb-2">
              Welcome to the Metaxon™ Protocol.
              {upsell && " Your Elite Sleep Guide has been added to your access."}
            </p>
            {email && (
              <p className="text-white/60 font-body text-sm">
                Confirmation sent to <span className="text-gold">{email}</span>
              </p>
            )}
          </div>

          <div className="mt-12 space-y-4 text-left animate-fade-up delay-200">
            <h2 className="font-display text-xl text-white text-center mb-6 tracking-wide">
              What Happens Next
            </h2>
            {NEXT_STEPS.map((s) => (
              <div key={s.step} className="flex gap-4 bg-ink border border-white/5 rounded-lg p-4">
                <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold text-sm font-bold font-body">
                  {s.step}
                </div>
                <div>
                  <p className="text-white font-body font-medium text-sm">{s.title}</p>
                  <p className="text-muted font-body text-sm leading-relaxed mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted text-xs font-body mt-10 leading-relaxed animate-fade-up delay-300">
            Questions? Email us at{" "}
            <a href="mailto:support@nsupplement.com" className="text-gold hover:underline">
              support@nsupplement.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <ThankYouContent />
    </Suspense>
  );
}
