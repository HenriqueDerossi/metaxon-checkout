"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const params  = useSearchParams();
  const email   = params.get("email") || "";
  const upsell  = params.get("upsell") === "1";

  const NEXT_STEPS = [
    { step: "1", title: "Check your email", desc: "Your access link is on its way to " + (email || "your inbox") + ". Check spam if needed." },
    { step: "2", title: "Click the link",   desc: "One tap — no password needed. You'll be inside in seconds." },
    { step: "3", title: "Start Module 1",   desc: "Begin with the Elite Protocol. 20 minutes is all you need to start." },
  ];

  return (
    <div className="min-h-screen bg-navy relative z-10 flex flex-col">
      {/* Top bar */}
      <div className="bg-ink border-b border-gold/10 py-2.5 px-4">
        <p className="text-center text-[11px] tracking-widest text-muted uppercase font-body">
          Metaxon™ Protocol
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center">

          {/* Checkmark animation */}
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

          {/* Next steps */}
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

          {/* Support */}
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
