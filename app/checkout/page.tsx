"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#B08A3A", colorBackground: "#0f2133",
    colorText: "#ffffff", colorDanger: "#e74c3c",
    colorTextSecondary: "rgba(255,255,255,0.55)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    borderRadius: "6px", spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(176,138,58,0.3)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", padding: "12px 14px" },
    ".Input:focus": { border: "1px solid #B08A3A", boxShadow: "0 0 0 3px rgba(176,138,58,0.15)" },
    ".Label": { color: "rgba(255,255,255,0.6)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" },
    ".Tab": { border: "1px solid rgba(176,138,58,0.2)", backgroundColor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.55)" },
    ".Tab--selected": { border: "1px solid #B08A3A", backgroundColor: "rgba(176,138,58,0.08)", color: "#fff", boxShadow: "0 0 0 1px #B08A3A" },
    ".Tab:hover": { color: "#fff" },
    ".Block": { border: "1px solid rgba(176,138,58,0.15)" },
    ".BlockDivider": { backgroundColor: "rgba(176,138,58,0.15)" },
  },
};

const BENEFITS = [
  "The Metaxon™ Protocol — complete 7-module system",
  "30-Day Neurobiological Implementation Plan",
  "17 Neurofunctional Compounds Reference Guide",
  "Daily Elite Performance Checklist",
  "Complete Circadian Optimization Framework",
  "Neuroplasticity Acceleration Framework",
];

const TESTIMONIALS = [
  { name: "Marcus T.", role: "Founder & CEO, New York", text: "I've invested in dozens of performance systems. Metaxon is the first one built on actual peer-reviewed neuroscience. My cognitive output improved measurably within 10 days.", stars: 5 },
  { name: "Dr. Sarah L.", role: "Board-Certified Neurosurgeon, Boston", text: "As a physician, I'm skeptical of performance protocols. The compound science behind Metaxon is legitimate and the protocols are clinically actionable.", stars: 5 },
  { name: "James R.", role: "VP at Goldman Sachs, Chicago", text: "Running 70-hour weeks, burnout was inevitable. This system gave me the framework to sustain peak output without the crash. ROI is 10x what I paid.", stars: 5 },
];

export default function CheckoutPage() {
  const [step, setStep] = useState<"info" | "payment">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/create-payment-intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");
      setClientSecret(data.clientSecret); setCustomerId(data.customerId || ""); setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  }, [name, email]);

  return (
    <div className="min-h-screen bg-navy relative z-10">
      {/* Urgency bar */}
      <div style={{ background: "linear-gradient(90deg,#8B6820,#B08A3A,#8B6820)" }} className="py-2.5 px-4">
        <p className="text-center text-[11px] tracking-widest text-navy font-body font-bold uppercase">
          ⚡ Launch Pricing — Save $200 Today Only &nbsp;|&nbsp; 30-Day Money-Back Guarantee
        </p>
      </div>

      {/* Trust bar */}
      <div className="bg-ink border-b border-gold/10 py-2.5 px-4">
        <div className="flex items-center justify-center gap-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-muted"><span className="text-sm">🔒</span><span className="text-[11px] font-body">SSL Encrypted</span></div>
          <span className="text-white/10 hidden sm:block">|</span>
          <div className="flex items-center gap-1.5"><span className="bg-[#635bff] text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-body">stripe</span><span className="text-[11px] text-muted font-body">Secured Payments</span></div>
          <span className="text-white/10 hidden sm:block">|</span>
          <div className="flex items-center gap-1.5 text-muted"><span className="text-sm">🛡</span><span className="text-[11px] font-body">30-Day Guarantee</span></div>
        </div>
      </div>

      {/* Header */}
      <header className="py-8 px-4 text-center border-b border-gold/10 animate-fade-in">
        <div className="text-[10px] tracking-[0.35em] text-gold uppercase mb-3 font-body font-medium">Metaxon™ Protocol — Secure Checkout</div>
        <h1 className="font-display text-3xl md:text-4xl font-light text-white tracking-wide mb-2">You&apos;re One Step Away</h1>
        <p className="text-muted text-sm font-body">Complete your order below · Instant access · No subscription</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

        {/* LEFT */}
        <div className="space-y-7 animate-fade-up">
          {/* Price + benefits */}
          <div className="bg-ink border border-gold/20 rounded-xl p-6">
            <div className="flex items-baseline gap-4 mb-5">
              <span className="font-display text-5xl font-light text-white">$97</span>
              <span className="text-muted line-through text-xl font-body">$297</span>
              <span className="bg-gold/15 text-gold text-[10px] font-body font-bold px-2.5 py-1 rounded-full tracking-widest uppercase border border-gold/20">Save $200</span>
            </div>
            <h3 className="font-display text-xl text-white mb-4 tracking-wide">Everything Included:</h3>
            <ul className="space-y-2.5">
              {BENEFITS.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-gold flex-shrink-0 mt-0.5 font-body font-bold">✓</span>
                  <span className="text-white/80 text-sm font-body leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-muted text-xs font-body">One-time payment · Lifetime access · Instant digital delivery</p>
            </div>
          </div>

          {/* 30-day guarantee */}
          <div className="bg-ink border-2 border-gold/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl flex-shrink-0">🛡</div>
              <div>
                <p className="text-gold font-body font-bold text-sm tracking-widest uppercase mb-2">30-Day Money-Back Guarantee</p>
                <p className="text-white/75 text-sm font-body leading-relaxed">
                  Try the complete Metaxon™ Protocol for a full 30 days. If you don&apos;t experience a measurable improvement in your cognitive performance and focus, email us for a <strong className="text-white">complete refund — no questions asked.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="bg-ink border border-white/5 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted font-body mb-4 text-center">Accepted Payment Methods</p>
            <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-1.5 bg-[#635bff]/10 border border-[#635bff]/30 rounded-md px-3 py-1.5">
                <span className="bg-[#635bff] text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-body">stripe</span>
                <span className="text-[11px] text-muted font-body">Secured</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-md px-3 py-1.5">
                <span className="text-white text-sm">🍎</span>
                <span className="text-[11px] text-muted font-body">Apple Pay</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-md px-3 py-1.5">
                <span className="text-sm font-bold text-blue-400 font-body">G</span>
                <span className="text-[11px] text-muted font-body">Google Pay</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#003087]/20 border border-[#009cde]/20 rounded-md px-3 py-1.5">
                <span className="text-[#009cde] text-sm font-bold font-body">P</span>
                <span className="text-[11px] text-muted font-body">PayPal</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              {["VISA","MC","AMEX","DISC"].map((c) => (
                <span key={c} className="text-[9px] font-bold tracking-wider border border-white/10 rounded px-2 py-0.5 text-muted font-body">{c}</span>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <p className="text-center text-muted text-xs font-body tracking-wider uppercase">
            Trusted by <span className="text-gold font-semibold">2,000+ high-performance professionals</span> across the US
          </p>

          {/* Testimonials */}
          <div className="space-y-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-ink border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">{Array.from({length:t.stars}).map((_,s)=><span key={s} className="text-gold text-xs">★</span>)}</div>
                  <span className="text-[10px] text-green-400 font-body font-medium">✓ Verified Purchase</span>
                </div>
                <p className="text-white/75 text-sm font-body leading-relaxed italic mb-3">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">{t.name[0]}</div>
                  <div><p className="text-white text-xs font-semibold font-body">{t.name}</p><p className="text-muted text-[11px] font-body">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted font-body leading-relaxed border-t border-white/5 pt-4">
            For educational and informational purposes only. Not medical advice. Individual results may vary.
          </p>
        </div>

        {/* RIGHT */}
        <div className="lg:sticky lg:top-6 animate-fade-up delay-200">
          <div className="bg-ink border border-gold/20 rounded-2xl overflow-hidden shadow-2xl">
            {/* Form header */}
            <div className="bg-gradient-to-r from-gold/15 via-gold/8 to-gold/15 border-b border-gold/15 px-7 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-widest text-gold uppercase font-body font-medium">Secure Order Form</p>
                  <h2 className="font-display text-xl font-light text-white mt-0.5">Complete Your Purchase</h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1"><span className="text-green-400 text-xs">🔒</span><span className="text-[10px] text-muted font-body">256-bit SSL</span></div>
                  <span className="bg-[#635bff] text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-body">stripe secured</span>
                </div>
              </div>
            </div>

            <div className="p-7">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body transition-all ${step==="info"?"bg-gold text-navy":"bg-gold/20 text-gold"}`}>{step==="payment"?"✓":"1"}</div>
                <div className="flex-1 h-px bg-gold/20"/>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body transition-all ${step==="payment"?"bg-gold text-navy":"bg-white/8 text-muted"}`}>2</div>
              </div>

              {step === "info" ? (
                <form onSubmit={handleContinue} className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-light text-white mb-1">Your Information</h3>
                    <p className="text-muted text-xs font-body">Where should we send your access details?</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gold mb-2 font-body font-medium">First Name</label>
                    <input type="text" className="field-input" placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)} required autoComplete="given-name"/>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gold mb-2 font-body font-medium">Email Address</label>
                    <input type="email" className="field-input" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
                    <p className="text-[11px] text-muted mt-1.5 font-body">Your instant access link will be sent here immediately after purchase.</p>
                  </div>
                  {error && <div className="bg-red-900/30 border border-red-500/30 rounded px-4 py-3 text-red-300 text-sm font-body">{error}</div>}
                  <button type="submit" className="btn-cta" disabled={loading||!name||!email}>{loading?"Please wait...":"Continue to Secure Payment →"}</button>
                  <p className="text-center text-[11px] text-muted font-body">🔒 Your information is 100% secure and encrypted</p>
                </form>
              ) : clientSecret ? (
                <div>
                  <div className="mb-4">
                    <h3 className="font-display text-xl font-light text-white mb-1">Payment</h3>
                    <p className="text-muted text-xs font-body">Choose your preferred payment method below</p>
                  </div>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-[10px] text-muted font-body uppercase tracking-wider">Pay with:</span>
                    <span className="bg-[#635bff]/15 border border-[#635bff]/25 text-[10px] px-2 py-0.5 rounded text-muted font-body">Card</span>
                    <span className="bg-white/5 border border-white/10 text-[10px] px-2 py-0.5 rounded text-muted font-body">🍎 Pay</span>
                    <span className="bg-white/5 border border-white/10 text-[10px] px-2 py-0.5 rounded text-muted font-body">G Pay</span>
                    <span className="bg-[#003087]/15 border border-[#009cde]/15 text-[10px] px-2 py-0.5 rounded text-muted font-body">PayPal</span>
                  </div>
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: APPEARANCE }}>
                    <CheckoutForm name={name} email={email} customerId={customerId}/>
                  </Elements>
                  <button onClick={()=>setStep("info")} className="mt-3 text-xs text-muted hover:text-white/60 transition-colors font-body w-full text-center">← Edit your information</button>
                </div>
              ) : (
                <p className="text-muted text-center py-8 font-body text-sm">Initializing secure session...</p>
              )}

              {/* Order summary */}
              <div className="mt-6 pt-5 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-muted font-body mb-3">Order Summary</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-body"><span className="text-muted">Metaxon™ Protocol (7 modules)</span><span className="text-white/50 line-through">$297.00</span></div>
                  <div className="flex justify-between text-sm font-body"><span className="text-green-400 font-medium">Launch discount</span><span className="text-green-400 font-medium">-$200.00</span></div>
                </div>
                <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-white/5">
                  <span className="text-white font-body font-semibold">Total Today</span>
                  <div className="text-right">
                    <span className="font-display text-2xl text-gold font-light">$97.00</span>
                    <p className="text-[10px] text-muted font-body">One-time · No recurring charges</p>
                  </div>
                </div>
              </div>

              {/* Guarantee mini */}
              <div className="mt-4 flex items-center gap-2.5 bg-gold/5 border border-gold/15 rounded-lg px-4 py-3">
                <span className="text-2xl flex-shrink-0">🛡</span>
                <p className="text-[11px] text-muted font-body leading-relaxed">
                  <span className="text-gold font-semibold">30-Day Money-Back Guarantee.</span> Try it risk-free. Full refund if you&apos;re not satisfied.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 mt-5 flex-wrap">
            <div className="flex items-center gap-1.5 text-muted"><span className="text-sm">🔒</span><span className="text-[11px] font-body">SSL Encrypted</span></div>
            <div className="flex items-center gap-1.5 text-muted"><span className="text-sm">⚡</span><span className="text-[11px] font-body">Instant Delivery</span></div>
            <div className="flex items-center gap-1.5 text-muted"><span className="text-sm">🛡</span><span className="text-[11px] font-body">30-Day Guarantee</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
