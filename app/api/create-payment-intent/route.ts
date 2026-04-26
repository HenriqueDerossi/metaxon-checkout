import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const MAIN_PRICE  = 9700;   // $97.00
const BUMP_PRICE  = 2700;   // $27.00

export async function POST(req: NextRequest) {
  try {
    const { name, email, orderBump } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const amount = orderBump ? MAIN_PRICE + BUMP_PRICE : MAIN_PRICE;

    // Find or create Stripe customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer = existingCustomers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({ email, name });
    }

    const description = orderBump
      ? "Metaxon™ Protocol + Deep Sleep Guide"
      : "Metaxon™ Protocol — Full Access";

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customer.id,
      receipt_email: email,
      metadata: {
        product_type:     "main",
        order_bump:       orderBump ? "true" : "false",
        customer_email:   email,
        customer_name:    name,
      },
      description,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId:   customer.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[create-payment-intent]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
