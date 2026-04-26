// METAXON™ — Stripe Webhook v2
// Handles:
//   checkout.session.completed  → from Stripe Checkout (old flow)
//   payment_intent.succeeded    → from custom checkout (new Next.js flow)
//   charge.refunded             → blocks member on refund
//
// Supabase → Edge Functions → stripe-webhook → replace code → Deploy
// Also add event in Stripe Dashboard: payment_intent.succeeded

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto }       from "https://deno.land/std@0.168.0/crypto/mod.ts"

// ── CONFIG ───────────────────────────────────────────────────
const SITE_URL              = "https://nsupplement.com"
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
const STRIPE_SECRET_KEY     = Deno.env.get("STRIPE_SECRET_KEY")!
const RESEND_KEY            = Deno.env.get("RESEND_API_KEY") ?? ""

// ── PERMISSÕES — PRODUTO PRINCIPAL ──────────────────────────
const MAIN_DOCS = [
  { id: "elite_protocol",  can_view: true, can_pdf: false },
  { id: "protocolo_elite", can_view: true, can_pdf: false },
  { id: "guia17",          can_view: true, can_pdf: false },
  { id: "p30",             can_view: true, can_pdf: true  },
  { id: "checklist",       can_view: true, can_pdf: true  },
  { id: "mapa",            can_view: true, can_pdf: false },
  { id: "framework",       can_view: true, can_pdf: false },
]
const PROT = { prot_print: true, prot_copy: true, prot_screen: true }

// ── SUPABASE ─────────────────────────────────────────────────
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization,x-client-info,apikey,content-type,stripe-signature",
  "Content-Type": "application/json",
}

function res(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS })
}
function log(icon: string, msg: string, extra?: unknown) {
  console.log(`${icon} [stripe] ${msg}`, extra !== undefined ? JSON.stringify(extra) : "")
}

// ── VALIDAÇÃO DE ASSINATURA ──────────────────────────────────
async function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts    = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")))
    const ts       = parts["t"]
    const v1       = parts["v1"]
    if (!ts || !v1) return false
    const key      = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    const signed   = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${rawBody}`))
    const expected = Array.from(new Uint8Array(signed)).map((b) => b.toString(16).padStart(2, "0")).join("")
    if (expected.length !== v1.length) return false
    let ok = true
    for (let i = 0; i < expected.length; i++) { if (expected[i] !== v1[i]) ok = false }
    return ok
  } catch (e) { log("⚠️", "verifySignature:", e); return false }
}

// ── IDENTIFICAR PRODUTO ──────────────────────────────────────
// Para checkout.session.completed: usa metadata.product_type
// Para payment_intent.succeeded: usa metadata.product_type
function detectProductType(obj: Record<string, unknown>): "main" | "upsell" {
  const meta = (obj?.metadata ?? {}) as Record<string, string>
  if (meta?.product_type === "upsell") return "upsell"
  if (meta?.product_type === "main")   return "main"
  // Fallback: valor em centavos ≤ 5000 = upsell ($47)
  const amount = Number(obj?.amount_total ?? obj?.amount ?? 0)
  return amount <= 5000 ? "upsell" : "main"
}

// ── EXTRAIR EMAIL ────────────────────────────────────────────
function extractEmail(obj: Record<string, unknown>): string {
  const meta = (obj?.metadata ?? {}) as Record<string, string>
  return String(
    obj?.customer_email
    ?? (obj?.customer_details as Record<string,unknown>)?.email
    ?? meta?.customer_email
    ?? obj?.receipt_email
    ?? ""
  ).toLowerCase().trim()
}

function extractName(obj: Record<string, unknown>): string {
  const meta = (obj?.metadata ?? {}) as Record<string, string>
  return String(
    (obj?.customer_details as Record<string,unknown>)?.name
    ?? meta?.customer_name
    ?? ""
  ).trim()
}

// ── OBTER OU CRIAR MEMBRO ─────────────────────────────────────
async function getOrCreateMember(email: string, name: string, orderId: string) {
  const { data: listData } = await supabase.auth.admin.listUsers()
  const existing = listData?.users?.find((u) => u.email === email)
  let userId: string; let isNew: boolean

  if (existing) {
    userId = existing.id; isNew = false
    log("✅", `Existente: ${email}`)
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { name: name || email.split("@")[0] },
    })
    if (error) throw new Error(`createUser: ${error.message}`)
    userId = created.user!.id; isNew = true
    log("✅", `Criado: ${userId}`)
  }

  const now = new Date(); const expiresAt = new Date(now)
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { error: upsertErr } = await supabase.from("members").upsert({
    id: userId, email, name: name || email.split("@")[0],
    status: "active", kiwify_order_id: orderId,
    subscribed_at: now.toISOString(), expires_at: expiresAt.toISOString(),
    created_at: now.toISOString(),
  }, { onConflict: "email" })

  if (upsertErr) throw new Error(`upsert members: ${upsertErr.message}`)

  const { data: row } = await supabase.from("members").select("id").eq("email", email).single()
  const memberId = row?.id ?? userId
  log("✅", `Member pronto: ${memberId}`)
  return { memberId, isNew }
}

// ── LIBERAR PRODUTO PRINCIPAL ─────────────────────────────────
async function grantMainPermissions(memberId: string) {
  const rows = MAIN_DOCS.map((d) => ({
    member_id: memberId, content_id: d.id,
    can_view: d.can_view, can_pdf: d.can_pdf, ...PROT,
  }))
  const { error } = await supabase.from("content_permissions").upsert(rows, { onConflict: "member_id,content_id" })
  if (error) log("⚠️", "grantMain:", error.message)
  else log("✅", `${rows.length} módulos liberados`)
}

// ── LIBERAR UPSELL SLEEP GUIDE ────────────────────────────────
async function grantUpsellSono(memberId: string, sessionId: string) {
  const { error: permErr } = await supabase.from("content_permissions").upsert({
    member_id: memberId, content_id: "sono",
    can_view: true, can_pdf: true, ...PROT,
  }, { onConflict: "member_id,content_id" })
  if (permErr) log("⚠️", "grantSono perm:", permErr.message)

  const expiresAt = new Date(); expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  const { error: upErr } = await supabase.from("upsell_permissions").upsert({
    member_id: memberId, upsell_id: "sono", kiwify_id: sessionId,
    purchased_at: new Date().toISOString(), expires_at: expiresAt.toISOString(),
  }, { onConflict: "member_id,upsell_id" })

  if (upErr) log("⚠️", "grantSono:", upErr.message)
  else log("✅", `Sleep Guide liberado: ${memberId}`)
}

// ── BLOQUEAR MEMBRO (reembolso) ───────────────────────────────
async function blockMember(email: string) {
  await supabase.from("members").update({ status: "blocked" }).eq("email", email)
  log("🔴", `Bloqueado: ${email}`)
}

// ── EMAIL DE BOAS-VINDAS ──────────────────────────────────────
async function sendWelcomeEmail(email: string, name: string, isUpsell: boolean) {
  try {
    log("📧", `Gerando magic link para: ${email}`)

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink", email,
      options: { redirectTo: `${SITE_URL}/metaxon_members.html` },
    })
    if (error) { log("🔥", `generateLink ERRO: ${error.message}`); return false }
    if (!data?.properties?.action_link) { log("🔥", "generateLink: action_link ausente"); return false }

    log("✅", `Magic link gerado: ${email}`)
    const magicLink = data.properties.action_link
    const firstName = (name || email).split(" ")[0]

    const upsellBlock = isUpsell
      ? `<tr><td style="padding:0 36px 20px"><div style="background:rgba(212,170,96,.08);border:1px solid rgba(212,170,96,.25);padding:16px 18px;border-radius:4px"><p style="margin:0 0 6px;color:#D4AA60;font-size:13px;font-weight:bold">🌙 Sleep Guide Unlocked</p><p style="margin:0;color:rgba(255,255,255,.65);font-size:13px;line-height:1.7">Your <strong style="color:#fff">Elite Sleep Guide</strong> is now available in your members area.</p></div></td></tr>` : ""

    const html = `<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0D1B2A;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1B2A;padding:40px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#122030;border-top:4px solid #B08A3A;max-width:560px;width:100%"><tr><td style="padding:32px 36px 24px;text-align:center;border-bottom:1px solid rgba(212,170,96,.15)"><div style="font-size:20px;font-weight:bold;color:#D4AA60;letter-spacing:.12em">METAXON™ PROTOCOL</div><div style="font-size:10px;color:rgba(255,255,255,.35);letter-spacing:.18em;text-transform:uppercase;margin-top:6px">Neurobiological Engineering · Systemic Performance</div></td></tr><tr><td style="padding:28px 36px 8px"><p style="margin:0 0 14px;color:rgba(255,255,255,.88);font-size:16px">Welcome, <strong style="color:#D4AA60">${firstName}</strong>! 🎉</p><p style="margin:0 0 14px;color:rgba(255,255,255,.7);font-size:14px;line-height:1.8">Your purchase is confirmed. Your <strong style="color:#fff">Metaxon™ Protocol</strong> members area is ready.</p><p style="margin:0;color:rgba(255,255,255,.7);font-size:14px;line-height:1.8">Click below — <strong style="color:#D4AA60">no password needed</strong>. Valid for <strong style="color:#fff">24 hours</strong>.</p></td></tr>${upsellBlock}<tr><td style="padding:28px 36px;text-align:center"><a href="${magicLink}" style="background:#1A4A7A;color:#fff;text-decoration:none;padding:18px 48px;font-size:15px;font-weight:bold;letter-spacing:.06em;display:inline-block">ACCESS MEMBERS AREA →</a></td></tr><tr><td style="padding:0 36px 28px"><div style="background:rgba(255,255,255,.04);border-left:3px solid rgba(212,170,96,.3);padding:14px 16px"><p style="margin:0 0 6px;color:rgba(255,255,255,.3);font-size:11px">If the button doesn't work, copy this link:</p><p style="margin:0;color:rgba(212,170,96,.55);font-size:10px;word-break:break-all">${magicLink}</p></div></td></tr><tr><td style="padding:18px 36px;border-top:1px solid rgba(255,255,255,.06);text-align:center"><p style="margin:0;color:rgba(255,255,255,.2);font-size:11px;line-height:1.8">Metaxon™ Protocol · Dr. Henrique Derossi<br>Sent to <strong>${email}</strong> after a confirmed purchase.</p></td></tr></table></td></tr></table></body></html>`

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Metaxon™ Protocol <noreply@nsupplement.com>", to: [email], subject: isUpsell ? "🌙 Sleep Guide Unlocked — Metaxon™ Protocol" : "✅ Access Confirmed — Metaxon™ Protocol", html }),
    })
    if (r.ok) { log("📧", `Email enviado: ${email}`); return true }
    const resendErr = await r.text()
    log("🔥", `Resend ERRO (${r.status}): ${resendErr}`); return false
  } catch (e) { log("⚠️", "sendWelcomeEmail:", e); return false }
}

// ── BUSCAR EMAIL DO CHARGE ────────────────────────────────────
async function getEmailFromCharge(chargeId: string): Promise<string | null> {
  try {
    const r = await fetch(`https://api.stripe.com/v1/charges/${chargeId}`, { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } })
    const c = await r.json()
    return c?.billing_details?.email ?? c?.receipt_email ?? null
  } catch { return null }
}

// ── MAIN ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  const rawBody   = await req.text()
  const sigHeader = req.headers.get("stripe-signature") ?? ""

  if (STRIPE_WEBHOOK_SECRET) {
    const valid = await verifyStripeSignature(rawBody, sigHeader, STRIPE_WEBHOOK_SECRET)
    if (!valid) { log("🔴", "Assinatura inválida"); return res({ error: "Invalid signature" }, 400) }
  }

  let email = ""; let sessionId = ""

  try {
    const event     = JSON.parse(rawBody) as Record<string, unknown>
    const eventType = String(event.type ?? "")
    const obj       = (event.data as Record<string, unknown>)?.object as Record<string, unknown>

    log("📩", `Evento: ${eventType}`)

    // ── REEMBOLSO ──────────────────────────────────────────────
    if (eventType === "charge.refunded") {
      const chargeId = String(obj?.id ?? "")
      email = String(obj?.billing_details?.email ?? obj?.receipt_email ?? "")
      if (!email) email = (await getEmailFromCharge(chargeId)) ?? ""
      if (!email) return res({ ok: false, reason: "email_not_found" })
      await blockMember(email)
      return res({ ok: true, action: "blocked", email })
    }

    // ── PAGAMENTO CONFIRMADO (checkout.session.completed OU payment_intent.succeeded) ──
    const isPaid = eventType === "checkout.session.completed" ||
                   eventType === "payment_intent.succeeded"

    if (!isPaid) {
      log("ℹ️", `Evento ignorado: ${eventType}`)
      return res({ ok: true, reason: "event_ignored" })
    }

    email     = extractEmail(obj)
    sessionId = String(obj?.id ?? "")
    const name     = extractName(obj)
    const isUpsell     = detectProductType(obj) === "upsell"
    const meta         = (obj?.metadata ?? {}) as Record<string, string>
    const hasOrderBump = meta?.order_bump === "true"

    log("📧", `${email} | session: ${sessionId} | upsell: ${isUpsell} | orderBump: ${hasOrderBump}`)

    if (!email) return res({ error: "email_not_found" }, 400)

    const { memberId, isNew } = await getOrCreateMember(email, name, sessionId)

    if (isUpsell) {
      await grantUpsellSono(memberId, sessionId)
    } else {
      await grantMainPermissions(memberId)
      if (hasOrderBump) {
        await grantUpsellSono(memberId, sessionId)
        log("✅", `Order bump Sleep Guide liberado junto: ${memberId}`)
      }
    }

    const hasSleep  = isUpsell || hasOrderBump
    const emailSent = await sendWelcomeEmail(email, name, hasSleep)
    const action    = isUpsell ? "upsell_sono" : hasOrderBump ? "main_with_bump" : (isNew ? "member_created" : "member_updated")

    log("🎉", `Concluído: ${email} | ${action} | email:${emailSent}`)
    return res({ ok: true, action, email, memberId, emailSent })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log("🔥", "ERRO:", msg)
    return res({ error: msg }, 500)
  }
})
