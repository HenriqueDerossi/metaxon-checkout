import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, name, customerId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Create Payment Intent for Sleep Guide upsell
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4700,               // $47.00 in cents
      currency: "usd",
      customer: customerId || undefined,
      receipt_email: email,
      metadata: {
        product_type: "upsell",
        customer_email: email,
        customer_name: name || "",
      },
      description: "Metaxon™ — Elite Sleep Guide",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[create-upsell-intent]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
