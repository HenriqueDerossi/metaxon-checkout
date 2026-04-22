"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary:        "#B08A3A",
    colorBackground:     "#0f1e2e",
    colorText:           "#ffffff",
    colorDanger:         "#e74c3c",
    fontFamily:          "'DM Sans', system-ui, sans-serif",
    borderRadius:        "6px",
    spacingUnit:         "4px",
  },
  rules: {
    ".Input": {
      border:           "1px solid rgba(176,138,58,0.3)",
      backgroundColor:  "rgba(255,255,255,0.05)",
      color:            "#fff",
    },
    ".Input:focus": {
      border:    "1px solid #B08A3A",
      boxShadow: "0 0 0 3px rgba(176,138,58,0.15)",
    },
    ".Label": {
      color:          "rgba(255,255,255,0.6)",
      fontSize:       "12px",
      letterSpacing:  "0.08em",
      textTransform:  "uppercase",
    },
    ".Tab": { border: "1px solid rgba(176,138,58,0.2)", color: "rgba(255,255,255,0.6)" },
    ".Tab--selected": { border: "1px solid #B08A3A", color: "#fff" },
  },
};

const BENEFITS = [
  { icon: "⚡", text: "7 comprehensive modules delivered instantly" },
  { icon: "🧠", text: "Evidence-based neurobiological protocols" },
  { icon: "📅", text: "Structured 30-day implementation plan" },
  { icon: "✅", text: "Daily performance checklist included" },
  { icon: "🗺", text: "Complete circadian optimization framework" },
];

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "Founder & CEO",
    text: "I've tried dozens of productivity systems. Metaxon is the first one built on actual neuroscience. My focus improved noticeably in the first week.",
    stars: 5,
  },
  {
    name: "Dr. Sarah L.",
    role: "Neurosurgeon",
    text: "As a physician, I'm skeptical of performance protocols. This one is different — the compound science is legitimate and the protocols are actionable.",
    stars: 5,
  },
  {
    name: "James R.",
    role: "Investment Banker",
    text: "I work 70-hour weeks. This system helped me maintain peak cognitive output without burning out. Worth every dollar.",
    stars: 5,
  },
];

export default function CheckoutPage() {
  const [step, setStep]             = useState<"info" | "payment">("info");
  const [name,  setName]            = useState("");
  const [email, setEmail]           = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId,   setCustomerId]   = useState<string>("");
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState<string | null>(null);

  const handleContinue = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/create-payment-intent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");

      setClientSecret(data.clientSecret);
      setCustomerId(data.customerId || "");
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [name, email]);

  return (
    <div className="min-h-screen bg-navy relative z-10">
      {/* ── Trust bar ──────────────────────────────────────── */}
      <div className="bg-ink border-b border-gold/10 py-2.5 px-4">
        <p className="text-center text-[11px] tracking-widest text-muted uppercase">
          🔒 &nbsp; Secure Checkout &nbsp;·&nbsp; 256-bit SSL Encryption &nbsp;·&nbsp; Powered by Stripe
        </p>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="py-8 px-4 text-center border-b border-gold/10 animate-fade-in">
        <div className="text-[11px] tracking-[0.3em] text-gold uppercase mb-2 font-body">
          Metaxon™ Protocol
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-light text-white tracking-wide">
          Complete Your Order
        </h1>
        <p className="text-muted text-sm mt-2 font-body">
          A structured system for optimizing cognitive performance
        </p>
      </header>

      {/* ── Main layout ────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

        {/* ── LEFT: Product Summary ─────────────────────────── */}
        <div className="space-y-8 animate-fade-up">

          {/* Price block */}
          <div className="bg-ink border border-gold/20 rounded-lg p-6">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="font-display text-5xl font-light text-white">$97</span>
              <span className="text-muted line-through text-xl font-body">$297</span>
              <span className="bg-gold/15 text-gold text-xs font-body font-semibold px-2.5 py-1 rounded-full tracking-wide uppercase">
                Save 67%
              </span>
            </div>
            <p className="text-muted text-sm font-body leading-relaxed">
              One-time payment. Lifetime access. No subscription.
            </p>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-display text-xl text-white mb-4 tracking-wide">
              What You Get
            </h3>
            <ul className="space-y-3">
              {BENEFITS.map((b, i) => (
                <li key={i} className={`flex items-start gap-3 animate-fade-up delay-${(i+1)*100}`}>
                  <span className="text-lg flex-shrink-0 mt-0.5">{b.icon}</span>
                  <span className="text-white/80 text-sm font-body leading-relaxed">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="gold-divider" />

          {/* Guarantee */}
          <div className="flex items-center gap-4 bg-gold/5 border border-gold/20 rounded-lg p-4">
            <div className="text-4xl flex-shrink-0">🛡</div>
            <div>
              <p className="text-gold font-body font-semibold text-sm tracking-wide uppercase">
                7-Day Risk-Free Guarantee
              </p>
              <p className="text-muted text-sm font-body leading-relaxed mt-1">
                Try it for 7 days. If it doesn&apos;t deliver, get a full refund — no questions asked.
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div className="text-center">
            <p className="text-muted text-xs font-body tracking-wider uppercase">
              Trusted by <span className="text-gold font-semibold">2,000+ professionals</span> worldwide
            </p>
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`bg-ink border border-white/5 rounded-lg p-4 animate-fade-up delay-${(i+3)*100}`}>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-gold text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/75 text-sm font-body leading-relaxed italic mb-3">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold font-body">{t.name}</p>
                    <p className="text-muted text-[11px] font-body">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-muted font-body leading-relaxed border-t border-white/5 pt-4">
            For educational purposes only. Not medical advice. Individual results may vary.
            Consult a healthcare professional before beginning any supplementation program.
          </p>
        </div>

        {/* ── RIGHT: Order Form ─────────────────────────────── */}
        <div className="lg:sticky lg:top-10 animate-fade-up delay-200">
          <div className="bg-ink border border-gold/20 rounded-xl p-7 shadow-2xl">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body transition-colors ${step === "info" ? "bg-gold text-navy" : "bg-gold/20 text-gold"}`}>1</div>
              <div className="flex-1 h-px bg-gold/20" />
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body transition-colors ${step === "payment" ? "bg-gold text-navy" : "bg-white/10 text-muted"}`}>2</div>
            </div>

            {step === "info" ? (
              /* ── Step 1: Name + Email ── */
              <form onSubmit={handleContinue} className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-light text-white mb-1">
                    Your Information
                  </h2>
                  <p className="text-muted text-sm font-body">
                    Where should we send your access?
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gold mb-2 font-body">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Your first name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gold mb-2 font-body">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <p className="text-[11px] text-muted mt-1.5 font-body">
                    Your access link will be sent here.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded px-4 py-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-cta" disabled={loading || !name || !email}>
                  {loading ? "Please wait..." : "Continue to Payment →"}
                </button>

                <p className="text-center text-xs text-muted font-body">
                  We collect only what&apos;s necessary. Your data is never sold.
                </p>
              </form>

            ) : clientSecret ? (
              /* ── Step 2: Payment ── */
              <div>
                <div className="mb-5">
                  <h2 className="font-display text-2xl font-light text-white mb-1">
                    Payment Details
                  </h2>
                  <p className="text-muted text-sm font-body">
                    Secure payment for {email}
                  </p>
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: APPEARANCE }}
                >
                  <CheckoutForm name={name} email={email} customerId={customerId} />
                </Elements>

                <button
                  onClick={() => setStep("info")}
                  className="mt-4 text-xs text-muted hover:text-white transition-colors font-body w-full text-center"
                >
                  ← Edit your information
                </button>
              </div>

            ) : (
              <p className="text-muted text-center py-8 font-body">Initializing...</p>
            )}

            {/* Order summary at bottom */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="flex justify-between text-sm font-body mb-1">
                <span className="text-muted">Metaxon™ Protocol</span>
                <span className="text-white">$97.00</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted">Discount applied</span>
                <span className="text-green-400">-$200.00</span>
              </div>
              <div className="gold-divider my-3" />
              <div className="flex justify-between font-body font-semibold">
                <span className="text-white">Total</span>
                <span className="text-gold text-lg">$97.00</span>
              </div>
            </div>
          </div>

          {/* Trust badges below form */}
          <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
            <TrustBadge icon="🔒" text="SSL Secured" />
            <TrustBadge icon="💳" text="Stripe Payments" />
            <TrustBadge icon="🛡" text="7-Day Guarantee" />
          </div>
        </div>
      </main>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted">
      <span className="text-sm">{icon}</span>
      <span className="text-[11px] font-body tracking-wide">{text}</span>
    </div>
  );
}
