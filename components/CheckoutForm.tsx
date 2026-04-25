"use client";

import { useState } from "react";
import {
  useStripe, useElements, PaymentElement
} from "@stripe/react-stripe-js";
import type { StripeError, StripePaymentElementOptions } from "@stripe/stripe-js";

interface Props {
  name: string;
  email: string;
  customerId: string;
}

function getFriendlyError(err: StripeError): { message: string; hint: string } {
  const code = (err as any).decline_code || err.code || "";

  const map: Record<string, { message: string; hint: string }> = {
    insufficient_funds: {
      message: "Your card has insufficient funds.",
      hint: "Please try a different card or contact your bank.",
    },
    card_declined: {
      message: "Your card was declined.",
      hint: "Please try a different card or contact your bank to authorize international purchases.",
    },
    do_not_honor: {
      message: "Your bank declined this transaction.",
      hint: "Contact your bank to authorize international online purchases, then try again.",
    },
    transaction_not_allowed: {
      message: "Your card doesn't allow this type of transaction.",
      hint: "Contact your bank to enable online international purchases.",
    },
    incorrect_number: {
      message: "The card number is incorrect.",
      hint: "Please double-check your card number and try again.",
    },
    invalid_number: {
      message: "The card number is not valid.",
      hint: "Please check your card number and try again.",
    },
    incorrect_cvc: {
      message: "The security code (CVC) is incorrect.",
      hint: "Please check the 3-digit code on the back of your card.",
    },
    invalid_cvc: {
      message: "The security code (CVC) is not valid.",
      hint: "Please check the 3-digit code on the back of your card.",
    },
    expired_card: {
      message: "Your card has expired.",
      hint: "Please use a different card.",
    },
    invalid_expiry_month: {
      message: "The expiration month is invalid.",
      hint: "Please check the expiration date on your card.",
    },
    invalid_expiry_year: {
      message: "The expiration year is invalid.",
      hint: "Please check the expiration date on your card.",
    },
    incorrect_zip: {
      message: "The billing ZIP code doesn't match.",
      hint: "Please check your billing ZIP code and try again.",
    },
    lost_card: {
      message: "This card has been reported lost.",
      hint: "Please use a different card.",
    },
    stolen_card: {
      message: "This card has been reported stolen.",
      hint: "Please use a different card.",
    },
    fraudulent: {
      message: "This transaction was flagged for security reasons.",
      hint: "Please use a different card or contact our support.",
    },
    card_velocity_exceeded: {
      message: "Too many attempts with this card.",
      hint: "Please wait a few minutes, then try again or use a different card.",
    },
    processing_error: {
      message: "A temporary error occurred while processing your card.",
      hint: "Please try again in a moment.",
    },
  };

  if (map[code]) return map[code];

  return {
    message: err.message || "Payment failed.",
    hint: "Please try a different card or contact your bank.",
  };
}

const paymentElementOptions: StripePaymentElementOptions = {
  layout: "tabs",
  fields: { billingDetails: { name: "never", email: "never" } },
};

export default function CheckoutForm({ name, email, customerId }: Props) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading,   setLoading]   = useState(false);
  const [ready,     setReady]     = useState(false);
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [attempts,  setAttempts]  = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);
    setErrorHint(null);

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
      const { message, hint } = getFriendlyError(stripeError);
      setErrorMsg(message);
      setErrorHint(hint);
      setAttempts(prev => prev + 1);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs uppercase tracking-widest text-gold mb-2 font-body font-500">
          Payment Details
        </label>
        <PaymentElement
          onReady={() => setReady(true)}
          options={paymentElementOptions}
        />
      </div>

      {errorMsg && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3 space-y-1">
          <p className="text-red-300 text-sm font-medium flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="7" stroke="#f87171" strokeWidth="1.2"/>
              <path d="M7.5 4.5v3.5" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="7.5" cy="10.5" r=".8" fill="#f87171"/>
            </svg>
            {errorMsg}
