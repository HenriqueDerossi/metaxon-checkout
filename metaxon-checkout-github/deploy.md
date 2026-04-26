# Metaxon™ Checkout — Deploy Guide

## 1. Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- [Vercel CLI](https://vercel.com/docs/cli) instalado: `npm i -g vercel`

### Passos

```bash
# 1. Entre na pasta do projeto
cd metaxon-checkout

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas chaves reais

# 4. Teste localmente
npm run dev
# Acesse: http://localhost:3000/checkout

# 5. Deploy para produção
vercel --prod
```

### Variáveis de ambiente no Vercel

No painel do Vercel → seu projeto → Settings → Environment Variables, adicione:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_51...` |
| `STRIPE_SECRET_KEY` | `sk_live_51...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (do webhook do Vercel — veja abaixo) |
| `NEXT_PUBLIC_SITE_URL` | `https://seu-dominio.vercel.app` |
| `STRIPE_PRICE_MAIN` | `price_1TOnWeL7Daivbu5xUyVkuC3x` |
| `STRIPE_PRICE_UPSELL` | `price_1TOndIL7Daivbu5x29BEMrgW` |

---

## 2. Atualizar o Stripe Webhook no Supabase

O arquivo `stripe-webhook-supabase.ts` foi atualizado para lidar com
`payment_intent.succeeded` além de `checkout.session.completed`.

### Passos:
1. Supabase → Edge Functions → `stripe-webhook` → Code
2. Apague o código atual e cole o conteúdo de `stripe-webhook-supabase.ts`
3. Clique em **Deploy**

### Adicionar evento no Stripe:
Stripe → Developers → Webhooks → **Metaxon Stripe Webhook** → Editar
→ Adicionar evento: `payment_intent.succeeded`

---

## 3. Domínio customizado (opcional)

Para usar `checkout.nsupplement.com`:
1. Vercel → seu projeto → Settings → Domains
2. Adicione `checkout.nsupplement.com`
3. No seu DNS (Cloudflare/Namecheap), adicione um CNAME:
   - Name: `checkout`
   - Value: `cname.vercel-dns.com`

---

## 4. Fluxo completo

```
nsupplement.com → botão "Get Instant Access"
     ↓
checkout.nsupplement.com/checkout
  → Usuário preenche nome + email
  → Stripe PaymentElement ($97)
  → Pagamento confirmado
     ↓
/upsell?email=...&name=...
  → Oferta do Sleep Guide ($47)
  → Aceita → novo pagamento → /thank-you?upsell=1
  → Recusa → /thank-you
     ↓
Supabase webhook (payment_intent.succeeded)
  → Cria membro no banco
  → Libera permissões
  → Envia magic link via Resend
```

---

## 5. Teste

Use os cartões de teste do Stripe:
- Sucesso: `4242 4242 4242 4242`
- Recusado: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`
