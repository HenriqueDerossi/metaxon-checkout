"use client";

import { useState, useEffect } from "react";
import {
  useStripe, useElements, PaymentElement
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

interface Props {
  name: string;
  email: string;
  customerId: string;
}

export default function CheckoutForm({ name, email, customerId }: Props) {
  const stripe    = useStripe();
  const elements  = useElements();
  const router    = useRouter();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [ready,   setReady]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/upsell?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&cid=${encodeURIComponent(customerId)}`,
        receipt_email: email,
        payment_method_data: {
          billing_details: { name, email },
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stripe PaymentElement */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-gold mb-2 font-body font-500">
          Payment Details
        </label>
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: "tabs",
            fields: { billingDetails: { name: "never", email: "never" } },
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* CTA Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || !ready || loading}
        className="btn-cta mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Processing...
          </span>
        ) : (
          "Get Instant Access — $97"
        )}
      </button>

      {/* Micro-trust copy */}
      <p className="text-center text-xs text-muted leading-relaxed">
        🔒 256-bit SSL Encryption &nbsp;·&nbsp; Powered by Stripe &nbsp;·&nbsp; Instant delivery
      </p>

      {/* Card logos */}
      <div className="flex items-center justify-center gap-3 pt-1">
        {["VISA", "MC", "AMEX", "DISC"].map((c) => (
          <span key={c} className="text-[10px] font-bold tracking-wider border border-white/10 rounded px-2 py-1 text-muted">
            {c}
          </span>
        ))}
      </div>
    </form>
  );
}
