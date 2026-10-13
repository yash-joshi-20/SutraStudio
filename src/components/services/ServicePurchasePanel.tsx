"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShieldCheck, Clock, ArrowUpRight } from "lucide-react";
import {
  computeItemTotal,
  formatCurrencyINR,
  type CanonicalServiceItem,
} from "@/config/services";
import { getPriceBadge, type ServiceCatalogOption } from "@/config/serviceGroups";

interface ServicePurchasePanelProps {
  item: CanonicalServiceItem;
  options: ServiceCatalogOption[];
  turnaround: string;
  revisionPolicy: string;
}

const MAX_QUANTITY = 50;

/**
 * Server-validated purchase panel for a single canonical service.
 * Every price shown here is resolved from `@/config/services` (the single
 * pricing source); nothing is hard-coded. The Order CTA carries the selected
 * SKU + quantity, and the API re-validates the price server-side on submit.
 */
export function ServicePurchasePanel({
  item,
  options,
  turnaround,
  revisionPolicy,
}: ServicePurchasePanelProps) {
  const hasOptions = options.length > 1;
  const [optionIndex, setOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedOption = hasOptions ? options[optionIndex] : undefined;
  const service = selectedOption ? selectedOption.item : item;

  const allowQuantity = !hasOptions && service.pricingType === "per_unit";
  const qty = allowQuantity ? Math.min(MAX_QUANTITY, Math.max(1, quantity)) : 1;
  const total = computeItemTotal(service, qty);
  const showTotal = hasOptions || qty > 1;

  const rawHref = service.ctaHref || `/orders?service=${service.slug}`;
  const orderHref =
    qty > 1
      ? `${rawHref}${rawHref.includes("?") ? "&" : "?"}qty=${qty}`
      : rawHref;

  return (
    <div className="rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] p-6 sm:p-7 shadow-warm-soft">
      {/* Verified price */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-[#F4EFE6] border border-[#EADFCB] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B5B3E]">
            {getPriceBadge(service)}
          </span>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#171717]">
            {service.isCustomQuote
              ? "Custom Quote"
              : formatCurrencyINR(service.numericPrice)}
          </p>
          <p className="mt-1 text-sm text-[#64748B]">{service.priceDisplay}</p>
        </div>
        <span className="rounded-md bg-[#5C3A1E]/10 px-2.5 py-1 text-[11px] font-medium text-[#5C3A1E]">
          Verified price
        </span>
      </div>

      {/* Quantity / pack options */}
      {hasOptions && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5B3E]">
            Choose quantity
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((option, index) => (
              <button
                key={option.item.id}
                type="button"
                onClick={() => setOptionIndex(index)}
                aria-pressed={index === optionIndex}
                className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                  index === optionIndex
                    ? "border-[#A98B57] bg-[#A98B57]/10 text-[#4A3B22]"
                    : "border-[#EADFCB] bg-white text-[#3F3F46] hover:border-[#D4A35A]"
                }`}
              >
                {option.label}
                <span className="ml-2 text-xs text-[#64748B]">
                  {option.item.isCustomQuote
                    ? "Custom"
                    : formatCurrencyINR(option.item.numericPrice)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {allowQuantity && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5B3E]">
            Quantity
          </p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-xl border border-[#EADFCB] bg-white p-1">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#4A3B22] hover:bg-[#F4EFE6] disabled:opacity-40"
              disabled={qty <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-9 text-center text-sm font-semibold text-[#171717]">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#4A3B22] hover:bg-[#F4EFE6] disabled:opacity-40"
              disabled={qty >= MAX_QUANTITY}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Live total before checkout */}
      <div className="mt-5 flex items-center justify-between border-t border-dashed border-[#EADFCB] pt-4">
        <span className="text-sm text-[#64748B]">
          {showTotal ? `Total (${qty} × ${service.name})` : "Total"}
        </span>
        <span className="text-lg font-semibold text-[#171717]">
          {service.isCustomQuote ? "Custom Quote" : formatCurrencyINR(total)}
        </span>
      </div>

      {/* Order CTA — price is re-validated server-side on submit */}
      <Link
        href={orderHref}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-3.5 text-sm font-semibold text-[#FAF9F5] transition-colors hover:bg-[#2C2C2C]"
      >
        {service.ctaText || "Order now"}
        <ArrowUpRight className="h-4 w-4" />
      </Link>

      <p className="mt-3 text-center text-xs text-[#8A8A8A]">
        Final price is validated on the server before payment. No hidden
        package tiers.
      </p>

      {/* Trust facts */}
      <ul className="mt-4 space-y-2 border-t border-[#EADFCB] pt-4 text-sm text-[#3F3F46]">
        <li className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#A98B57]" />
          <span>{turnaround}</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#A98B57]" />
          <span>{revisionPolicy}</span>
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#A98B57]" />
          <span>Secure UPI checkout · order stored in your account</span>
        </li>
      </ul>
    </div>
  );
}
