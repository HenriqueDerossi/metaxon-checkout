"use client";

import { useState, useEffect } from "react";

function useNoonCountdown() {
  function getNextNoon(): number {
    const now = new Date();
    const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    if (now >= noon) noon.setDate(noon.getDate() + 1);
    return noon.getTime();
  }
  const [timeStr, setTimeStr] = useState("--:--:--");
  useEffect(() => {
    let expiry = getNextNoon();
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      if (Date.now() >= expiry) expiry = getNextNoon();
      const diff = Math.max(0, expiry - Date.now());
      setTimeStr(`${pad(Math.floor(diff/3600000))}:${pad(Math.floor((diff%3600000)/60000))}:${pad(Math.floor((diff%60000)/1000))}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeStr;
}

const COMPONENTS = [
  { icon: "📖", label: "Metaxon™ Scientific Manual", detail: "7-chapter eBook · dosage tables · 20+ peer-reviewed references" },
  { icon: "🧬", label: "Neurofunctional Compounds Guide", detail: "17 bioactive compounds · mechanism · optimal timing" },
  { icon: "📅", label: "30-Day Neurobiological Protocol", detail: "Foundation → Stack → Full System → Automation" },
  { icon: "✅", label: "Daily Performance Checklist", detail: "Compound logging · 6 cognitive self-assessment metrics" },
  { icon: "🗺", label: "Circadian Implementation Map", detail: "Full visual protocol · waking to wind-down" },
  { icon: "🧠", label: "Neuroplasticity Framework", detail: "3-phase consolidation · effort → automatic performance" },
];

const REVIEWS = [
  { text: "My focus came back in 4 days. I haven't had a productive streak like this in over a year.", name: "Marcus T.", role: "Founder & CEO, New York" },
  { text: "I've been practicing medicine for 12 years. The compound science is legitimate and the protocols are actionable. Rare for this category.", name: "Dr. Sarah L.", role: "Internal Medicine Physician, Seattle" },
  { text: "I work 70-hour weeks in finance. This system helped me maintain peak cognitive output without the crash. Worth every dollar.", name: "James R.", role: "Investment Banker, Chicago" },
];

export default function CheckoutPage() {
  const [bumpAdded, setBumpAdded] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const countdown = useNoonCountdown();
  const total = bumpAdded ? 124 : 97;

  function validate() {
    const e: { name?: string; email?: string } = {};
    if (!firstName.trim()) e.name = "Please enter your first name.";
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddPaymentInfo", {
        value: total, currency: "USD",
        content_name: bumpAdded ? "Metaxon Protocol + Sleep Guide" : "Metaxon Protocol",
      });
    }
    // ⚠️ Substitua pelos seus links reais do Stripe
    const url = bumpAdded
      ? "https://buy.stripe.com/REPLACE_BUMP_LINK"
      : "https://buy.stripe.com/REPLACE_MAIN_LINK";
    window.location.href = url;
  }

  const S = {
    page: { background:"#FAFAF7", minHeight:"100vh", fontFamily:"Georgia,serif" } as React.CSSProperties,
    topBar: { background:"#0D1B2A", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", borderBottom:"2px solid #B08A3A" } as React.CSSProperties,
    wrap: { maxWidth:620, margin:"0 auto", padding:"28px 20px 100px" } as React.CSSProperties,
    card: { background:"#fff", border:"1px solid #EEE9DE", borderRadius:10, overflow:"hidden", marginBottom:20 } as React.CSSProperties,
    cardBody: { padding:"16px 20px" } as React.CSSProperties,
    label: { fontFamily:"Arial,sans-serif", fontSize:12, color:"#5A5A68", display:"block", marginBottom:5 } as React.CSSProperties,
    input: (err: boolean) => ({ width:"100%", border:`1.5px solid ${err?"#C0392B":"#EEE9DE"}`, borderRadius:6, padding:"11px 14px", fontFamily:"Arial,sans-serif", fontSize:15, color:"#1A1A28", outline:"none", boxSizing:"border-box" }) as React.CSSProperties,
    errMsg: { fontFamily:"Arial,sans-serif", fontSize:11, color:"#C0392B", marginTop:4 } as React.CSSProperties,
    hint: { fontFamily:"Arial,sans-serif", fontSize:11, color:"#5A5A68", marginTop:4 } as React.CSSProperties,
    sectionTitle: { fontFamily:"Arial,sans-serif", fontSize:11, fontWeight:"bold", letterSpacing:".14em", textTransform:"uppercase", color:"#1A4A7A", marginBottom:14, display:"flex", alignItems:"center", gap:8 } as React.CSSProperties,
    btn: (disabled: boolean) => ({ width:"100%", background:disabled?"#999":"#1A4A7A", color:"#fff", fontFamily:"Arial,sans-serif", fontSize:18, fontWeight:"bold", letterSpacing:".04em", padding:"18px 24px", border:"none", borderRadius:8, cursor:disabled?"not-allowed":"pointer", boxShadow:"0 4px 18px rgba(26,74,122,.4)", display:"block", textAlign:"center" }) as React.CSSProperties,
  };

  return (
    <div style={S.page}>

      {/* ── STICKY FOOTER CTA — always visible ── */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:999,
        padding:"10px 20px",
        background:"rgba(10,18,28,0.97)",
        borderTop:"1px solid rgba(176,138,58,0.3)",
        backdropFilter:"blur(12px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        gap:14, flexWrap:"wrap",
        boxShadow:"0 -4px 32px rgba(0,0,0,.5)",
      }}>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <span style={{ display:"block", fontSize:10, letterSpacing:".15em", textTransform:"uppercase" as const, color:"rgba(255,255,255,.4)", fontFamily:"Arial,sans-serif", marginBottom:2 }}>Today Only</span>
          <span style={{ fontFamily:"Arial,sans-serif" }}>
            <span style={{ fontSize:12, textDecoration:"line-through", color:"rgba(255,255,255,.3)", marginRight:6 }}>$297</span>
            <span style={{ fontSize:16, fontWeight:"bold", color:"#B08A3A" }}>$97</span>
          </span>
        </div>
        <button
          onClick={() => document.getElementById("co-email")?.focus()}
          style={{ background:"linear-gradient(135deg,#B08A3A,#D4AA60)", color:"#0a1218", fontFamily:"Arial,sans-serif", fontSize:14, fontWeight:"bold", letterSpacing:".04em", padding:"12px 32px", border:"none", cursor:"pointer", flex:1, maxWidth:340, transition:"opacity .2s", borderRadius:4 }}
          onMouseOver={e=>(e.currentTarget.style.opacity=".88")}
          onMouseOut={e=>(e.currentTarget.style.opacity="1")}
        >
          🔓 Unlock My Performance Now →
        </button>
        <span style={{ fontSize:11, color:"rgba(255,255,255,.35)", fontFamily:"Arial,sans-serif", flexShrink:0 }}>🛡 30-day guarantee</span>
      </div>

      {/* TOP BAR */}
      <header style={S.topBar}>
        <span style={{ color:"#D4AA60", fontFamily:"Arial,sans-serif", fontWeight:"bold", fontSize:14, letterSpacing:".1em" }}>
          METAXON™ PROTOCOL
        </span>
        <span style={{ color:"rgba(255,255,255,.55)", fontFamily:"Arial,sans-serif", fontSize:12 }}>
          🔒 Secure Checkout · 256-bit SSL
        </span>
      </header>

      {/* PROGRESS */}
      <div style={{ background:"#E8EFF6", padding:"12px 24px" }}>
        <div style={{ maxWidth:600, margin:"0 auto", display:"flex", alignItems:"center" }}>
          {["Order","Checkout","Access"].map((step, i) => {
            const isDone = i===0, isActive = i===1;
            return (
              <div key={step} style={{ flex:1, textAlign:"center", position:"relative" }}>
                {i < 2 && <div style={{ position:"absolute", top:14, left:"50%", width:"100%", height:2, background:isDone?"#1a7a3a":"#EEE9DE", zIndex:0 }} />}
                <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Arial,sans-serif", fontSize:12, fontWeight:"bold", position:"relative", zIndex:1, margin:"0 auto 4px", background:isDone?"#1a7a3a":isActive?"#1A4A7A":"#EEE9DE", color:(!isDone&&!isActive)?"#5A5A68":"#fff" }}>
                  {isDone ? "✓" : i+1}
                </div>
                <div style={{ fontFamily:"Arial,sans-serif", fontSize:10, letterSpacing:".08em", textTransform:"uppercase", color:isActive?"#1A4A7A":"#5A5A68", fontWeight:isActive?"bold":"normal" }}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={S.wrap}>

        {/* HEADLINE */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <span style={{ fontFamily:"Arial,sans-serif", fontSize:11, letterSpacing:".2em", textTransform:"uppercase", color:"#1A4A7A", display:"block", marginBottom:6 }}>
            Metaxon™ Performance System
          </span>
          <h1 style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:"bold", color:"#0D1B2A", lineHeight:1.25, marginBottom:8 }}>
            You're one step away from restoring your cognitive performance
          </h1>
          <p style={{ fontFamily:"Arial,sans-serif", fontSize:14, color:"#5A5A68", fontStyle:"italic" }}>
            Get instant access and start seeing changes in as little as 7 days
          </p>
        </div>

        {/* COUNTDOWN */}
        <div style={{ background:"#0D1B2A", display:"flex", alignItems:"center", justifyContent:"center", gap:14, padding:"12px 20px", marginBottom:20, borderRadius:6, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"Arial,sans-serif", fontSize:11, color:"rgba(255,255,255,.5)", letterSpacing:".08em" }}>LAUNCH PRICE EXPIRES IN</span>
          <span style={{ fontFamily:"monospace", fontSize:20, fontWeight:"bold", color:"#fff", letterSpacing:".1em" }}>{countdown}</span>
          <span style={{ fontFamily:"Arial,sans-serif", fontSize:13, color:"#D4AA60", fontWeight:"bold" }}>$97 (reg. $297)</span>
        </div>

        {/* TRUST STRIP */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
          {[{icon:"🔒",t:"256-bit SSL",s:"Encrypted"},{icon:"💳",t:"Stripe",s:"Card · Apple Pay"},{icon:"🅿",t:"PayPal",s:"Accepted"},{icon:"🛡",t:"30-Day Guarantee",s:"Full refund"}].map(({icon,t,s})=>(
            <div key={t} style={{ background:"#fff", border:"1px solid #EEE9DE", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:3 }}>{icon}</div>
              <span style={{ fontFamily:"Arial,sans-serif", fontSize:11, fontWeight:"bold", color:"#0D1B2A", display:"block" }}>{t}</span>
              <span style={{ fontFamily:"Arial,sans-serif", fontSize:10, color:"#5A5A68" }}>{s}</span>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <div style={S.card}>
          <div style={{ background:"#E8EFF6", padding:"12px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:12, fontWeight:"bold", color:"#0D1B2A", letterSpacing:".06em" }}>YOUR ORDER SUMMARY</span>
            <span style={{ background:"#1a7a3a", color:"#fff", fontFamily:"Arial,sans-serif", fontSize:10, fontWeight:"bold", padding:"3px 10px", borderRadius:999 }}>SAVE 67%</span>
          </div>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid #EEE9DE" }}>
            <p style={{ fontSize:15, fontWeight:"bold", color:"#0D1B2A", marginBottom:8 }}>Metaxon™ Performance System</p>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:12, color:"#5A5A68", lineHeight:1.9 }}>
              {COMPONENTS.map(c=><div key={c.label}>✓ {c.label}</div>)}
            </div>
          </div>
          <div style={{ padding:"12px 20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontFamily:"Arial,sans-serif", fontSize:13, color:"#5A5A68" }}>
              <span>Regular price</span><span style={{ textDecoration:"line-through" }}>$297.00</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontFamily:"Arial,sans-serif", fontSize:13, color:"#1a7a3a", fontWeight:"bold" }}>
              <span>Launch discount</span><span>−$200.00</span>
            </div>
            {bumpAdded && (
              <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontFamily:"Arial,sans-serif", fontSize:13, color:"#1a7a3a", fontWeight:"bold" }}>
                <span>Deep Sleep Guide (add-on)</span><span>+$27.00</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 4px", borderTop:"2px solid #EEE9DE", marginTop:8, fontFamily:"Arial,sans-serif", fontSize:17, fontWeight:"bold", color:"#0D1B2A" }}>
              <span>Total today</span><span>${total}.00</span>
            </div>
            <p style={{ fontFamily:"Arial,sans-serif", fontSize:11, color:"#5A5A68", marginTop:4 }}>One-time payment. Lifetime access. No subscription.</p>
          </div>
        </div>

        {/* ── ORDER BUMP — preço único, claro, sem "$47+$27" ── */}
        <div
          onClick={() => setBumpAdded(p => !p)}
          style={{ background:bumpAdded?"linear-gradient(135deg,#f0f8f2,#e8f5ec)":"linear-gradient(135deg,#f5fbf7,#eef7f1)", border:`2px solid ${bumpAdded?"#1a7a3a":"#4caf7d"}`, borderRadius:10, padding:20, marginBottom:20, cursor:"pointer", transition:"border-color .2s" }}
        >
          <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
            {/* Checkbox */}
            <div style={{ width:24, height:24, borderRadius:5, border:`2px solid ${bumpAdded?"#1a7a3a":"#4caf7d"}`, background:bumpAdded?"#1a7a3a":"#fff", flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center", transition:"background .2s" }}>
              {bumpAdded && <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ flex:1 }}>
              <span style={{ display:"inline-block", background:"#1a7a3a", color:"#fff", fontFamily:"Arial,sans-serif", fontSize:10, fontWeight:"bold", padding:"3px 10px", borderRadius:999, marginBottom:8, letterSpacing:".06em" }}>
                ⚠ ADD THIS TO YOUR ORDER — ONE TIME OFFER
              </span>
              <h3 style={{ fontSize:15, fontWeight:"bold", color:"#0D1B2A", marginBottom:8, lineHeight:1.35 }}>
                🌙 Deep Sleep Optimization Guide — Complete System
              </h3>
              <p style={{ fontFamily:"Arial,sans-serif", fontSize:13, color:"#444", lineHeight:1.75, marginBottom:10 }}>
                The Metaxon™ Protocol activates all 4 cognitive levers — but <strong>sleep is when all 4 consolidate.</strong> Without optimized deep sleep, your brain cannot complete the glymphatic clearing cycle that makes the protocol work at full capacity. This guide covers slow-wave and REM optimization, the full wind-down stack, and the sleep pressure protocol from Chapter 5 — fully expanded into a standalone implementation guide.
              </p>
              
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:19, fontWeight:"bold", color:"#1a7a3a", fontFamily:"Arial,sans-serif" }}>Add for $27</span>
                <span style={{ fontSize:13, color:"rgba(90,90,104,.5)", textDecoration:"line-through", fontFamily:"Arial,sans-serif" }}>$47 separately</span>
                <span style={{ fontSize:11, color:"#1a7a3a", fontWeight:"bold", fontFamily:"Arial,sans-serif", background:"rgba(26,122,58,.1)", padding:"2px 8px", borderRadius:999 }}>Save $50</span>
              </div>
              <p style={{ fontFamily:"Arial,sans-serif", fontSize:11, color:"#5A5A68", marginTop:8 }}>
                ✓ Instant digital access &nbsp;·&nbsp; ✓ Same 30-day guarantee &nbsp;·&nbsp; ✓ Added to your total above
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div style={{ background:"#fff", border:"1px solid #EEE9DE", borderRadius:10, padding:"22px 20px", marginBottom:20 }}>

          <div style={S.sectionTitle}>
            <span>1 — Your Information</span>
            <div style={{ flex:1, height:1, background:"#EEE9DE" }} />
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={S.label}>First Name</label>
            <input type="text" value={firstName} placeholder="Your first name" autoComplete="given-name"
              onChange={e=>{setFirstName(e.target.value);setErrors(p=>({...p,name:undefined}));}}
              style={S.input(!!errors.name)} />
            {errors.name && <p style={S.errMsg}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={S.label}>Email Address</label>
            <input type="email" value={email} placeholder="you@email.com" autoComplete="email" id="co-email"
              onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:undefined}));}}
              style={S.input(!!errors.email)} />
            {errors.email
              ? <p style={S.errMsg}>{errors.email}</p>
              : <p style={S.hint}>🔒 Your access link will be sent here. Check spam if not received within 5 min.</p>
            }
          </div>

          <div style={S.sectionTitle}>
            <span>2 — Payment</span>
            <div style={{ flex:1, height:1, background:"#EEE9DE" }} />
          </div>

          {bumpAdded && (
            <div style={{ background:"rgba(26,122,58,.06)", border:"1px solid rgba(26,122,58,.2)", borderRadius:6, padding:"8px 14px", marginBottom:14, fontFamily:"Arial,sans-serif", fontSize:12, color:"#2a6a3a" }}>
              ✓ <strong>Deep Sleep Guide added</strong> — $27 included in total
            </div>
          )}

          <div style={{ background:"#E8EFF6", borderRadius:6, padding:"14px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <span style={{ fontFamily:"Arial,sans-serif", fontSize:11, color:"#5A5A68", display:"block" }}>Order total</span>
              <span style={{ fontSize:24, fontWeight:"bold", color:"#0D1B2A", fontFamily:"Arial,sans-serif" }}>${total}.00</span>
            </div>
            <div style={{ textAlign:"right", fontFamily:"Arial,sans-serif", fontSize:11, color:"#5A5A68" }}>
              One-time payment<br/>Lifetime access · No subscription
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={S.btn(loading)}>
            {loading ? "Redirecting…" : "🔓 Unlock My Performance Now →"}
          </button>

          <p style={{ fontFamily:"Arial,sans-serif", fontSize:12, color:"#5A5A68", textAlign:"center", marginTop:10, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            🔒 Secure checkout · Takes less than 2 minutes
          </p>

          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:14, flexWrap:"wrap" }}>
            {["💳 Card","🅿 PayPal","🍎 Apple Pay","G Google Pay"].map(p=>(
              <span key={p} style={{ background:"#f5f5f5", border:"1px solid #e0e0e0", borderRadius:5, padding:"6px 12px", fontFamily:"Arial,sans-serif", fontSize:12, color:"#555", fontWeight:"bold" }}>{p}</span>
            ))}
          </div>

          <p style={{ fontFamily:"Arial,sans-serif", fontSize:11, color:"#5A5A68", textAlign:"center", marginTop:12 }}>
            We collect only what's necessary. Your data is never sold or shared.
          </p>
        </div>

        {/* GUARANTEE */}
        <div style={{ background:"rgba(26,122,58,.06)", border:"2px solid rgba(26,122,58,.25)", borderRadius:10, padding:"18px 20px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:14 }}>
          <span style={{ fontSize:32, flexShrink:0 }}>🛡</span>
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:13, color:"#333", lineHeight:1.7 }}>
            <strong style={{ color:"#1a7a3a", display:"block", fontSize:14, marginBottom:4 }}>30-Day Money-Back Guarantee</strong>
            Try the full system for 30 days. If you don't experience a measurable improvement in focus, energy, and cognitive consistency — contact us for a complete refund. No questions, no hassle. Your purchase is fully protected.
          </div>
        </div>

        {/* WHAT YOU GET */}
        <div style={{ background:"#fff", border:"1px solid #EEE9DE", borderRadius:10, overflow:"hidden", marginBottom:20 }}>
          <img
            src="/mockup-full.png"
            alt="Metaxon™ System — 6 complete components: Scientific Manual, Compounds Guide, 30-Day Protocol, Daily Checklist, Circadian Map and Neuroplasticity Framework"
            loading="eager"
            decoding="async"
            width="1340"
            height="754"
            style={{ width:"100%", height:"auto", display:"block" }}
          />
        </div>

        {/* SOCIAL PROOF */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {REVIEWS.map(({text,name,role})=>(
            <div key={name} style={{ background:"#fff", border:"1px solid #EEE9DE", borderRadius:8, padding:"14px 16px" }}>
              <div style={{ color:"#F5A623", fontSize:13, marginBottom:4 }}>★★★★★</div>
              <p style={{ fontSize:13, color:"#333", fontStyle:"italic", lineHeight:1.65, marginBottom:8 }}>&ldquo;{text}&rdquo;</p>
              <span style={{ fontFamily:"Arial,sans-serif", fontSize:12, fontWeight:"bold", color:"#0D1B2A" }}>{name} — {role}</span>
            </div>
          ))}
        </div>

        {/* LEGAL */}
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:11, color:"rgba(90,90,104,.6)", textAlign:"center", lineHeight:1.8 }}>
          For educational purposes only. Not medical advice. Individual results may vary.<br/>
          Consult a healthcare professional before beginning any supplementation program.<br/><br/>
          <a href="https://nsupplement.com/privacy-policy.html" style={{ color:"#5A5A68" }}>Privacy Policy</a> &nbsp;·&nbsp;
          <a href="https://nsupplement.com/terms.html" style={{ color:"#5A5A68" }}>Terms of Service</a> &nbsp;·&nbsp;
          <a href="https://nsupplement.com/disclaimer.html" style={{ color:"#5A5A68" }}>Disclaimer</a> &nbsp;·&nbsp;
          <a href="mailto:support@nsupplement.com" style={{ color:"#5A5A68" }}>Contact</a><br/><br/>
          NSupplement LLC · support@nsupplement.com · © 2026
        </div>

      </div>
    </div>
  );
}
