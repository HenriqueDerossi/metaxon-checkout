import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Find or create Stripe customer (links payment history to email)
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer = existingCustomers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({ email, name });
    }

    // Create Payment Intent for main product
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9700,               // $97.00 in cents
      currency: "usd",
      customer: customer.id,
      receipt_email: email,
      metadata: {
        product_type: "main",
        customer_email: email,
        customer_name: name,
      },
      description: "Metaxon™ Protocol — Full Access",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[create-payment-intent]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
