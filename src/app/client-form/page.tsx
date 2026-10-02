"use client";

import React, { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/authContext";

export default function ClientFormPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company: {},
    services: [],
    products: [],
    pricing_plans: [],
    faqs: [],
    contact: {},
    policies: {},
    documents: [],
  });
  const [submissionStatus, setSubmissionStatus] = useState<string>("DRAFT");
  
  const steps = [
    "Company Information",
    "Services",
    "Products",
    "Pricing/Plans",
    "FAQs",
    "Contact",
    "Policies",
    "Documents",
  ];
  
  const submitForReview = async () => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: user?.uid || 'client_001',
          status: 'PENDING_REVIEW',
          ...formData,
        }),
      });
      if (res.ok) {
        setSubmissionStatus('PENDING_REVIEW');
        alert('Submitted for review!');
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen bg-[#F8F5EF] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A]">Client Information Form</h1>
            <p className="text-[#64748B] mt-2">Multi-step form - all data requires admin approval</p>
            <Badge className="mt-3">{submissionStatus}</Badge>
          </div>
          
          <div className="bg-white rounded-lg border border-[#EADFCB] p-6 mb-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {steps.map((s, i) => (
                <Badge key={i}>
                  Step {i+1}: {s}
                </Badge>
              ))}
            </div>
            
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Company Name" className="border p-2 rounded" />
                  <input placeholder="Company Tagline" className="border p-2 rounded" />
                  <textarea placeholder="Company Description" className="border p-2 rounded col-span-2" />
                  <textarea placeholder="About Company" className="border p-2 rounded col-span-2" />
                  <input placeholder="Industry" className="border p-2 rounded" />
                  <input placeholder="Founded Year" type="number" className="border p-2 rounded" />
                  <input placeholder="Company Size" className="border p-2 rounded" />
                  <input placeholder="Website URL" className="border p-2 rounded" />
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <Button onClick={() => setCurrentStep(Math.max(1, currentStep-1))} variant="outline">Previous</Button>
              {currentStep < steps.length ? (
                <Button onClick={() => setCurrentStep(currentStep+1)}>Next</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setSubmissionStatus('DRAFT')}>Save Draft</Button>
                  <Button onClick={submitForReview}>Submit for Review</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
