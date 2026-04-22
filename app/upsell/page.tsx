"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#B08A3A",
    colorBackground: "#0f1e2e",
    colorText: "#ffffff",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    borderRadius: "6px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(176,138,58,0.3)", backgroundColor: "rgba(255,255,255,0.05)" },
    ".Input:focus": { border: "1px solid #B08A3A", boxShadow: "0 0 0 3px rgba(176,138,58,0.15)" },
    ".Label": { color: "rgba(255,255,255,0.6)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" },
    ".Tab": { border: "1px solid rgba(176,138,58,0.2)" },
    ".Tab--selected": { border: "1px solid #B08A3A" },
  },
};

function UpsellPayForm({ email, name, onDecline }: { email: string; name: string; onDecline: () => void }) {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you?upsell=1&email=${encodeURIComponent(email)}`,
        receipt_email: email,
        payment_method_data: { billing_details: { name, email } },
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "never", email: "never" } },
        }}
      />
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      <button type="submit" disabled={!stripe || loading} className="btn-cta">
        {loading ? "Processing..." : "Yes! Add Sleep Guide for $47 →"}
      </button>
      <button
        type="button"
        onClick={onDecline}
        className="w-full text-xs text-muted hover:text-white/60 transition-colors py-2 font-body text-center"
      >
        No thanks, I&apos;ll skip this one-time offer
      </button>
    </form>
  );
}

function UpsellContent() {
  const params = useSearchParams();
  const router = useRouter();
  const email  = params.get("email") || "";
  const name   = params.get("name")  || "";
  const cid    = params.get("cid")   || "";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [accepted, setAccepted]         = useState(false);

  const initUpsell = useCallback(async () => {
    if (loading || clientSecret) return;
    setLoading(true);
    const res  = await fetch("/api/create-upsell-intent", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, name, customerId: cid }),
    });
    const data = await res.json();
    if (data.clientSecret) setClientSecret(data.clientSecret);
    setLoading(false);
  }, [email, name, cid, loading, clientSecret]);

  const handleDecline = () => {
    router.push(`/thank-you?email=${encodeURIComponent(email)}`);
  };

  const handleAccept = () => {
    setAccepted(true);
    initUpsell();
  };

  const SLEEP_BENEFITS = [
    "Complete circadian rhythm optimization protocol",
    "17 neurofunctional compounds for deep sleep",
    "Pre-sleep mental deactivation framework",
    "Hormonal recovery & metabolic reset guide",
    "Morning cognitive priming sequence",
  ];

  return (
    <div className="min-h-screen bg-navy relative z-10">
      {/* Top bar */}
      <div className="bg-ink border-b border-gold/10 py-2.5 px-4">
        <p className="text-center text-[11px] tracking-widest text-gold uppercase font-body">
          ⚡ &nbsp; Special One-Time Offer — Never Shown Again
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-xs tracking-[0.3em] text-gold uppercase font-body mb-3">
            Wait — Before You Access Your Material
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-white leading-tight mb-4">
            Unlock the Missing<br />
            <span className="text-gold italic">Sleep Protocol</span>
          </h1>
          <p className="text-muted font-body text-base leading-relaxed max-w-lg mx-auto">
            Your cognitive output is only as strong as your recovery. The Elite Sleep Guide is the
            companion protocol that elite performers use to make everything else work better.
          </p>
        </div>

        {/* Offer card */}
        <div className="bg-ink border border-gold/25 rounded-xl overflow-hidden animate-fade-up delay-100">

          {/* Banner */}
          <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-b border-gold/20 px-6 py-3 text-center">
            <p className="text-gold text-xs font-body font-semibold tracking-widest uppercase">
              Exclusive Add-On — One-Time Offer
            </p>
          </div>

          <div className="p-7">
            <div className="flex items-baseline gap-4 mb-5">
              <span className="font-display text-5xl font-light text-white">$47</span>
              <span className="text-muted line-through text-xl font-body">$97</span>
              <span className="bg-gold/15 text-gold text-xs font-body font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                52% Off
              </span>
            </div>

            <h2 className="font-display text-2xl font-light text-white mb-4">
              Metaxon™ Elite Sleep Guide
            </h2>

            <ul className="space-y-2.5 mb-6">
              {SLEEP_BENEFITS.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-white/80 text-sm font-body">
                  <span className="text-gold flex-shrink-0 mt-0.5">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="gold-divider mb-5" />

            {/* Scarcity — genuine, not fake */}
            <div className="bg-gold/5 border border-gold/20 rounded px-4 py-3 mb-5">
              <p className="text-gold text-xs font-body text-center tracking-wide">
                ⚠️ This discounted offer disappears when you leave this page
              </p>
            </div>

            {!accepted ? (
              <div className="space-y-3">
                <button onClick={handleAccept} className="btn-cta">
                  Yes! Add Sleep Guide for $47 →
                </button>
                <button
                  onClick={handleDecline}
                  className="w-full text-xs text-muted hover:text-white/60 transition-colors py-2 font-body text-center"
                >
                  No thanks, I&apos;ll skip this one-time offer
                </button>
              </div>
            ) : loading ? (
              <p className="text-center text-muted font-body py-4">Initializing payment...</p>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: APPEARANCE }}>
                <UpsellPayForm email={email} name={name} onDecline={handleDecline} />
              </Elements>
            ) : null}
          </div>
        </div>

        {/* Trust footer */}
        <p className="text-center text-[11px] text-muted font-body mt-6 leading-relaxed">
          🔒 Secure payment powered by Stripe &nbsp;·&nbsp; 7-day money-back guarantee &nbsp;·&nbsp; Instant delivery
        </p>
      </div>
    </div>
  );
}

export default function UpsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <UpsellContent />
    </Suspense>
  );
}
