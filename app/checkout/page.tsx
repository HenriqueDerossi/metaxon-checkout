"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  { icon: "📖", label: "Component 1", text: "Metaxon™ Scientific Manual", sub: "7-chapter eBook · dosage tables · 20+ peer-reviewed references" },
  { icon: "🧬", label: "Component 2", text: "Neurofunctional Compounds Guide", sub: "17 bioactive compounds · mechanism · optimal timing · 5 synergies" },
  { icon: "📅", label: "Component 3", text: "30-Day Neurobiological Protocol", sub: "Step-by-step plan: Foundation → Stack → Full System → Automation" },
  { icon: "✅", label: "Component 4", text: "Daily Performance Checklist", sub: "Daily tracker · compound logging · 6 cognitive metrics" },
  { icon: "🗺", label: "Component 5", text: "Circadian Implementation Map", sub: "Full visual protocol · waking → wind-down · glymphatic optimization" },
  { icon: "🧠", label: "Component 6", text: "Neuroplasticity Framework", sub: "3-phase consolidation model · conscious effort → automatic performance" },
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

const ORDER_BUMP_PRICE = 27;
const MAIN_PRICE = 97;

export default function CheckoutPage() {
  const [step, setStep]             = useState<"info" | "payment">("info");
  const [name,  setName]            = useState("");
  const [email, setEmail]           = useState("");
  const [orderBump, setOrderBump]   = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId,   setCustomerId]   = useState<string>("");
  const [countdown, setCountdown] = useState("23:59:59");
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState<string | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const total = MAIN_PRICE + (orderBump ? ORDER_BUMP_PRICE : 0);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContinue = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/create-payment-intent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, orderBump }),
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
  }, [name, email, orderBump]);

  // ── Countdown synced to 12:00 PM local time ─────────────────
  // Always counts down to the next noon — same deadline for everyone.
  useEffect(() => {
    function getNextNoon(): number {
      const now  = new Date();
      const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
      if (now >= noon) noon.setDate(noon.getDate() + 1); // past noon → tomorrow
      return noon.getTime();
    }

    let expiry = getNextNoon();

    function pad(n: number) { return n < 10 ? "0" + n : String(n); }

    const tick = () => {
      const now = Date.now();
      if (now >= expiry) expiry = getNextNoon(); // recalculate across midnight
      const diff = Math.max(0, expiry - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(pad(h) + ":" + pad(m) + ":" + pad(s));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-navy relative z-10">

      {/* ── STICKY BOTTOM CTA ─────────────────────────────────── */}
      <div style={{
        position:   "fixed",
        bottom:     0, left: 0, right: 0,
        zIndex:     999,
        padding:    "12px 20px",
        background: "rgba(10,18,28,0.97)",
        borderTop:  "1px solid rgba(176,138,58,0.3)",
        backdropFilter: "blur(12px)",
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        gap:        "16px",
        flexWrap:   "wrap",
        transform:  showSticky ? "translateY(0)" : "translateY(110%)",
        transition: "transform 0.35s ease",
        boxShadow:  "0 -4px 32px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", marginBottom: "2px" }}>
            Today Only
          </span>
          <span style={{ fontFamily: "system-ui" }}>
            <span style={{ fontSize: "12px", textDecoration: "line-through", color: "rgba(255,255,255,0.3)", marginRight: "6px" }}>$297</span>
            <span style={{ fontSize: "15px", fontWeight: "bold", color: "#B08A3A" }}>$97</span>
          </span>
        </div>
        <button
          onClick={scrollToForm}
          style={{
            background:    "linear-gradient(135deg, #B08A3A, #D4AA60)",
            color:         "#0a1218",
            fontFamily:    "system-ui, sans-serif",
            fontSize:      "14px",
            fontWeight:    "bold",
            letterSpacing: "0.04em",
            padding:       "13px 36px",
            border:        "none",
            cursor:        "pointer",
            flex:          "1",
            maxWidth:      "360px",
            transition:    "opacity 0.2s",
            borderRadius:  "4px",
          }}
        >
          🔓 Unlock My Performance Now →
        </button>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "system-ui" }}>
          🛡 30-day guarantee
        </span>
      </div>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <div className="bg-ink border-b border-gold/10 py-2.5 px-4">
        <p className="text-center text-[11px] tracking-widest text-muted uppercase">
          🔒 &nbsp; Secure Checkout &nbsp;·&nbsp; 256-bit SSL &nbsp;·&nbsp; Stripe &amp; PayPal Accepted
        </p>
      </div>

      {/* ── Urgency bar ───────────────────────────────────────── */}
      <div style={{ background: "#1a0a0a", borderBottom: "1px solid rgba(231,76,60,0.3)", padding: "8px 16px" }}>
        <p style={{ textAlign: "center", fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.85)", margin: 0 }}>
          <span style={{ color: "#e74c3c", fontWeight: "bold" }}>⚡ &nbsp;</span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>This price will </span>
          <span style={{ color: "#fff", fontWeight: "bold" }}>not be available again</span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}> after this session &nbsp;—&nbsp; </span>
          <span style={{ color: "#fff", fontWeight: "bold", letterSpacing: "0.12em" }}>{countdown}</span>
        </p>
      </div>

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="py-8 px-4 text-center border-b border-gold/10 animate-fade-in">
        <div className="text-[11px] tracking-[0.3em] text-gold uppercase mb-3 font-body">
          Metaxon™ Performance System
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-light text-white tracking-wide max-w-2xl mx-auto leading-tight mb-2">
          You&apos;re one step away from restoring<br className="hidden md:block" /> your cognitive performance
        </h1>
        <p className="text-gold/80 text-sm md:text-base mt-2 font-body max-w-lg mx-auto">
          Get instant access and start seeing changes in as little as 30 days
        </p>
      </header>

      {/* ── Main layout ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start" style={{ paddingBottom: "100px" }}>

        {/* ── LEFT: Product Summary ─────────────────────────── */}
        <div className="space-y-7 animate-fade-up">

          {/* Price block */}
          <div className="bg-ink border border-gold/20 rounded-lg p-6">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>Total Value:</span>
              <span style={{ fontSize: "16px", textDecoration: "line-through", color: "rgba(255,255,255,0.35)", fontFamily: "system-ui" }}>$297</span>
            </div>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="font-display text-5xl font-light text-white">$97</span>
              <span className="bg-gold/15 text-gold text-xs font-body font-semibold px-2.5 py-1 rounded-full tracking-wide uppercase">
                Save 67% Today
              </span>
            </div>
            <p className="text-muted text-sm font-body leading-relaxed">
              One-time payment. Lifetime access. No subscription.
            </p>
          </div>

          {/* EMOTIONAL REINFORCEMENT */}
          <div style={{
            background: "rgba(176,138,58,0.06)", border: "1px solid rgba(176,138,58,0.2)",
            borderLeft: "4px solid #B08A3A", padding: "22px", borderRadius: "6px",
          }}>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", lineHeight: "1.8", fontFamily: "system-ui", margin: 0 }}>
              This is where most people quit.
            </p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: "1.8", fontFamily: "system-ui", marginTop: "10px" }}>
              Not because it doesn&apos;t work —<br />but because they hesitate.
            </p>
            <p style={{ fontSize: "15px", color: "#B08A3A", fontWeight: "bold", fontFamily: "system-ui", marginTop: "10px", lineHeight: "1.7" }}>
              The ones who move forward?<br />They&apos;re the ones who fix it.
            </p>
          </div>

          {/* 6 Components */}
          <div>
            <h3 className="font-display text-xl text-white mb-1 tracking-wide">What You&apos;ll Receive</h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", marginBottom: "12px", fontStyle: "italic" }}>
              6 components · instant digital access · fully in English
            </p>
            {/* Product Mockup Image */}
            <div style={{ marginBottom: "16px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(176,138,58,0.2)" }}>
              <img
                src="/mockup-components.webp"
                alt="Metaxon™ System — 6 complete components"
                loading="lazy"
                decoding="async"
                width="1200"
                height="800"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            <ul className="space-y-3">
              {BENEFITS.map((b, i) => (
                <li key={i} style={{
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(176,138,58,0.12)",
                  borderLeft: "3px solid rgba(176,138,58,0.4)", padding: "12px 14px", borderRadius: "4px",
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>{b.icon}</span>
                  <div>
                    <span style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B08A3A", fontFamily: "system-ui", display: "block", marginBottom: "2px" }}>{b.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", fontFamily: "system-ui", display: "block", marginBottom: "3px" }}>{b.text}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontFamily: "system-ui", lineHeight: "1.5" }}>{b.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="gold-divider" />

          {/* Aggressive social proof strip */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px", padding: "18px 20px",
          }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B08A3A", fontFamily: "system-ui", marginBottom: "14px", textAlign: "center" }}>
              Trusted by high-performance professionals:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["My focus came back in 4 days.", "I stopped relying on caffeine.", "This actually works."].map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#B08A3A", fontSize: "13px" }}>★</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontFamily: "system-ui", fontStyle: "italic" }}>&ldquo;{q}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>

          {/* GUARANTEE — prominent */}
          <div style={{
            background: "rgba(39,174,96,0.07)", border: "2px solid rgba(39,174,96,0.3)",
            borderRadius: "8px", padding: "22px", display: "flex", gap: "16px", alignItems: "flex-start",
          }}>
            <div style={{ fontSize: "36px", flexShrink: 0 }}>🛡</div>
            <div>
              <p style={{ color: "#27ae60", fontFamily: "system-ui", fontSize: "14px", fontWeight: "bold", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                Try it for 30 days.
              </p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontFamily: "system-ui", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>
                If you don&apos;t feel a real difference in your focus and energy,<br />
                you get <strong style={{ color: "#fff" }}>100% of your money back.</strong><br />
                No questions asked.
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <p className="text-center text-muted text-xs font-body tracking-wider uppercase mb-4">
              Trusted by <span className="text-gold font-semibold">2,000+ professionals</span> worldwide
            </p>
            <div className="space-y-4">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-ink border border-white/5 rounded-lg p-4">
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
          </div>

          <p className="text-[11px] text-muted font-body leading-relaxed border-t border-white/5 pt-4">
            For educational purposes only. Not medical advice. Individual results may vary.
            Consult a healthcare professional before beginning any supplementation program.
          </p>
        </div>

        {/* ── RIGHT: Order Form ─────────────────────────────── */}
        <div ref={formRef} className="lg:sticky lg:top-10 animate-fade-up delay-200">
          <div className="bg-ink border border-gold/20 rounded-xl p-7 shadow-2xl">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body transition-colors ${step === "info" ? "bg-gold text-navy" : "bg-gold/20 text-gold"}`}>1</div>
              <div className="flex-1 h-px bg-gold/20" />
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body transition-colors ${step === "payment" ? "bg-gold text-navy" : "bg-white/10 text-muted"}`}>2</div>
            </div>

            {step === "info" ? (
              <form onSubmit={handleContinue} className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-light text-white mb-1">Your Information</h2>
                  <p className="text-muted text-sm font-body">Where should we send your access?</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gold mb-2 font-body">First Name</label>
                  <input type="text" className="field-input" placeholder="Your first name"
                    value={name} onChange={e => setName(e.target.value)} required autoComplete="given-name" />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gold mb-2 font-body">Email Address</label>
                  <input type="email" className="field-input" placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  <p className="text-[11px] text-muted mt-1.5 font-body">Your access link will be sent here.</p>
                </div>

                {/* ORDER BUMP — repositioned as "missing piece" */}
                <div
                  onClick={() => setOrderBump(v => !v)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${orderBump ? "border-gold bg-gold/10" : "border-gold/30 bg-gold/5 hover:border-gold/60"}`}
                >
                  <p style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#e74c3c", fontFamily: "system-ui", fontWeight: "bold", marginBottom: "10px" }}>
                    ⚠ Add the missing piece of your performance system
                  </p>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${orderBump ? "bg-gold border-gold" : "border-gold/40 bg-transparent"}`}>
                      {orderBump && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4L4.5 7.5L11 1" stroke="#0f1e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-gold text-xs font-body font-semibold uppercase tracking-widest">Yes! Add to my order</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted line-through text-xs font-body">$47</span>
                          <span className="text-gold font-semibold text-sm font-body">+$27</span>
                        </div>
                      </div>
                      <p className="text-white text-sm font-body font-semibold mb-1">🌙 Deep Sleep Optimization Guide</p>
                      <p className="text-muted text-xs font-body leading-relaxed">
                        Without deep sleep, your brain cannot reset. This guide ensures the system actually works at full capacity — maximizing slow-wave and REM cycles, the biological foundation of next-day focus.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded px-4 py-3 text-red-300 text-sm">{error}</div>
                )}

                {/* PAYPAL NOTICE */}
                <div style={{
                  background: "rgba(0,100,255,0.06)", border: "1px solid rgba(0,100,255,0.2)",
                  borderRadius: "6px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span style={{ fontSize: "18px" }}>🅿</span>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", fontFamily: "system-ui", margin: 0, lineHeight: "1.5" }}>
                    <strong style={{ color: "rgba(255,255,255,0.85)" }}>PayPal accepted</strong> — card, PayPal &amp; more available on the next screen.
                  </p>
                </div>

                <button type="submit" className="btn-cta" disabled={loading || !name || !email}>
                  {loading ? "Please wait..." : `Unlock My Performance Now → $${total}`}
                </button>

                <p className="text-center text-xs text-muted font-body">
                  ⚡ Instant access. Takes less than 2 minutes.
                </p>
                <p className="text-center text-xs text-muted font-body">
                  We collect only what&apos;s necessary. Your data is never sold.
                </p>
              </form>

            ) : clientSecret ? (
              <div>
                <div className="mb-5">
                  <h2 className="font-display text-2xl font-light text-white mb-1">Payment Details</h2>
                  <p className="text-muted text-sm font-body">Secure payment for {email}</p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px", marginTop: "10px",
                    padding: "8px 12px", background: "rgba(0,100,255,0.06)",
                    border: "1px solid rgba(0,100,255,0.18)", borderRadius: "5px",
                  }}>
                    <span style={{ fontSize: "14px" }}>🅿</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontFamily: "system-ui" }}>
                      Select <strong style={{ color: "rgba(255,255,255,0.8)" }}>PayPal</strong> tab above the card fields to pay with PayPal
                    </span>
                  </div>
                </div>
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: APPEARANCE }}>
                  <CheckoutForm name={name} email={email} customerId={customerId} />
                </Elements>
                <button onClick={() => setStep("info")} className="mt-4 text-xs text-muted hover:text-white transition-colors font-body w-full text-center">
                  ← Edit your information
                </button>
              </div>
            ) : (
              <p className="text-muted text-center py-8 font-body">Initializing...</p>
            )}

            {/* Order summary */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="flex justify-between text-sm font-body mb-1">
                <span className="text-muted">Metaxon™ Performance System</span>
                <span className="text-white flex items-center gap-2">
                  <span className="line-through text-muted text-xs">$297.00</span>
                  $97.00
                </span>
              </div>
              {orderBump && (
                <div className="flex justify-between text-sm font-body mb-1">
                  <span className="text-muted">Deep Sleep Guide</span>
                  <span className="text-white flex items-center gap-2">
                    <span className="line-through text-muted text-xs">$47.00</span>
                    $27.00
                  </span>
                </div>
              )}
              <div className="gold-divider my-3" />
              <div className="flex justify-between font-body font-semibold">
                <span className="text-white">Total</span>
                <span className="text-gold text-lg">${total}.00</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            <TrustBadge icon="🔒" text="SSL Secured" />
            <TrustBadge icon="💳" text="Stripe Payments" />
            <TrustBadge icon="🅿" text="PayPal Accepted" />
            <TrustBadge icon="🛡" text="30-Day Guarantee" />
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
