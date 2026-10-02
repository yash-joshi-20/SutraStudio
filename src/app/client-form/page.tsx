"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Building2,
  Layers,
  ShoppingBag,
  DollarSign,
  HelpCircle,
  Phone,
  FileCheck,
  FileUp,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  Info,
} from "lucide-react";
import {
  ClientSubmission,
  CompanyInfo,
  ServiceItem,
  ProductItem,
  PricingPlanItem,
  FAQItem,
  ContactInfo,
  PoliciesInfo,
  DocumentItem,
  SubmissionStatus,
} from "@/lib/types/knowledge";

const STEPS = [
  { id: 1, label: "Company Info", icon: Building2 },
  { id: 2, label: "Services", icon: Layers },
  { id: 3, label: "Products", icon: ShoppingBag },
  { id: 4, label: "Pricing / Plans", icon: DollarSign },
  { id: 5, label: "FAQs", icon: HelpCircle },
  { id: 6, label: "Contact Info", icon: Phone },
  { id: 7, label: "Policies", icon: FileCheck },
  { id: 8, label: "Documents", icon: FileUp },
];

export default function ClientFormPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const [submissionId, setSubmissionId] = useState<string>("");
  const [status, setStatus] = useState<SubmissionStatus>("DRAFT");
  const [changesMessage, setChangesMessage] = useState<string>("");

  // Step 1: Company
  const [company, setCompany] = useState<CompanyInfo>({
    name: "Shri Ram Tech",
    tagline: "Pioneering AI & Cloud Transformation Solutions",
    description: "Shri Ram Tech delivers enterprise-grade AI chatbots, computational intelligence, and high-performance full-stack web platforms for high-growth businesses.",
    about: "Founded with a vision of ethical and high-impact technology, Shri Ram Tech helps global enterprises modernize workflows, integrate intelligent knowledge bases, and scale digital operations.",
    industry: "Information Technology & Artificial Intelligence",
    foundedYear: "2022",
    companySize: "50-100 Employees",
    websiteUrl: "https://shriramtech.com",
    logoUrl: "/brand/LOGO/LOGO-1.png",
  });

  // Step 2: Services
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "srv-1",
      name: "Enterprise AI Chatbots & RAG",
      shortDescription: "Secure, verified multi-tenant knowledge retrieval assistants.",
      detailedDescription: "Custom-trained AI agents grounded exclusively in approved company documentation with strict multi-tenant access control and zero hallucination safeguards.",
      features: ["Knowledge Base Vector Search", "Admin Review & Approval Gate", "Lead Capture Integration", "24/7 Multi-Channel Deployment"],
      startingPrice: "₹14,999",
      ctaText: "Deploy AI Chatbot",
    },
  ]);

  // Step 3: Products
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "prd-1",
      name: "RamBot Enterprise Hub",
      description: "Autonomous customer inquiry and lead routing engine with instant human handoff.",
      features: ["Real-Time RAG Retrieval", "Instant Human Handoff", "Admin Knowledge Sync"],
      price: "₹12,499 / mo",
      productUrl: "https://shriramtech.com/products/rambot",
    },
  ]);

  // Step 4: Pricing Plans
  const [pricingPlans, setPricingPlans] = useState<PricingPlanItem[]>([
    {
      id: "plan-1",
      name: "Startup Tier",
      category: "Cloud Assistant",
      price: "₹5,999",
      billingPeriod: "monthly",
      description: "Essential AI assistant grounded in single-tenant verified knowledge base.",
      features: ["Up to 5,000 inquiries/mo", "50 Approved Knowledge Chunks", "Email Lead Alerts", "Standard Support"],
      ctaText: "Choose Startup",
      isPopular: false,
    },
    {
      id: "plan-2",
      name: "Growth Enterprise",
      category: "Full Atelier Suite",
      price: "₹12,999",
      billingPeriod: "monthly",
      description: "Unlimited knowledge vectorization with custom human-handoff pipelines.",
      features: ["Unlimited Inquiries", "Instant Live Human Takeover", "Document Vector Processing", "Dedicated Account Lead"],
      ctaText: "Select Growth",
      isPopular: true,
    },
  ]);

  // Step 5: FAQs
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: "faq-1",
      question: "How does the Shri Ram Tech AI Chatbot ensure data accuracy?",
      answer: "Our chatbot is strictly grounded in an Admin-Approved Knowledge Base. It only retrieves and presents information that has been reviewed, approved, and published by authorized administrators, completely eliminating hallucinations.",
      category: "AI & Security",
    },
  ]);

  // Step 6: Contact
  const [contact, setContact] = useState<ContactInfo>({
    email: "contact@shriramtech.com",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    address: "Tech Heritage Park, Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    country: "India",
    businessHours: "Monday - Saturday: 9:00 AM - 7:00 PM IST",
    googleMapsUrl: "https://maps.google.com",
    contactPageUrl: "https://shriramtech.com/contact",
    socialMedia: {
      linkedin: "https://linkedin.com/company/shriramtech",
      twitter: "https://twitter.com/shriramtech",
    },
  });

  // Step 7: Policies
  const [policies, setPolicies] = useState<PoliciesInfo>({
    termsAndConditions: "Services are provisioned under verified enterprise SLAs with guaranteed response times.",
    privacyPolicy: "Shri Ram Tech respects client confidentiality. All submitted business data is encrypted at rest and in transit.",
    refundPolicy: "Full refund within 14 days of project commencement if initial milestones are unmet.",
    shippingPolicy: "Digital deliverables are synchronized immediately to the client vault.",
    cancellationPolicy: "Subscriptions may be canceled with 30 days written notice.",
    customInformation: "Custom enterprise integrations available upon request.",
  });

  // Step 8: Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "doc-1",
      name: "Shri_Ram_Tech_Capabilities_Deck_2026.pdf",
      type: "pdf",
      size: "2.4 MB",
      url: "/documents/shri_ram_tech_deck.pdf",
      uploadedAt: "2026-10-01",
      extractedText: "Shri Ram Tech provides enterprise-grade AI chatbots, RAG vector retrieval, and digital platform development.",
      chunksCount: 12,
      status: "approved",
    },
  ]);

  // Check if form is locked (PENDING_REVIEW or APPROVED/PUBLISHED)
  const isLocked = status === "PENDING_REVIEW" || status === "APPROVED" || status === "PUBLISHED";

  // Load existing submission
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await fetch(`/api/submissions?client_id=${user?.uid || "client_shriram"}`);
        if (res.ok) {
          const data = await res.json();
          if (data.submissions && data.submissions.length > 0) {
            const sub: ClientSubmission = data.submissions[0];
            setSubmissionId(sub.id);
            setStatus(sub.status);
            if (sub.changes_requested_message) {
              setChangesMessage(sub.changes_requested_message);
            }
            if (sub.company) setCompany(sub.company);
            if (sub.services?.length) setServices(sub.services);
            if (sub.products?.length) setProducts(sub.products);
            if (sub.pricing_plans?.length) setPricingPlans(sub.pricing_plans);
            if (sub.faqs?.length) setFaqs(sub.faqs);
            if (sub.contact) setContact(sub.contact);
            if (sub.policies) setPolicies(sub.policies);
            if (sub.documents?.length) setDocuments(sub.documents);
          }
        }
      } catch (err) {
        console.error("Failed to load submission:", err);
      }
    };
    fetchSub();
  }, [user?.uid]);

  const saveSubmission = async (newStatus?: SubmissionStatus) => {
    setLoading(true);
    const targetStatus = newStatus || (status === "CHANGES_REQUESTED" ? "CLIENT_UPDATED" : status);

    const payload: Partial<ClientSubmission> = {
      id: submissionId || `sub_${Date.now()}`,
      client_id: user?.uid || "client_shriram",
      client_name: company.name || "Client Enterprise",
      status: targetStatus,
      company,
      services,
      products,
      pricing_plans: pricingPlans,
      faqs,
      contact,
      policies,
      documents,
    };

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissionId(data.submission.id);
        setStatus(data.submission.status);
        setSaveSuccess(
          targetStatus === "PENDING_REVIEW" || targetStatus === "CLIENT_UPDATED"
            ? "Submission sent to Admin for review! Changes will be live once approved."
            : "Draft saved successfully."
        );
        setTimeout(() => setSaveSuccess(""), 5000);
      }
    } catch {
      alert("Failed to save submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for Dynamic Service Builder
  const addService = () => {
    setServices([
      ...services,
      {
        id: `srv-${Date.now()}`,
        name: "New Service",
        shortDescription: "Short summary for cards and search",
        detailedDescription: "Full service scope and deliverable description",
        features: ["Feature 1", "Feature 2"],
        startingPrice: "₹9,999",
        ctaText: "Get Started",
      },
    ]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Helper functions for Dynamic Product Builder
  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: `prd-${Date.now()}`,
        name: "New Product",
        description: "Product summary and specifications",
        features: ["Feature A", "Feature B"],
        price: "₹4,999",
      },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Helper functions for Pricing Plans Builder
  const addPricingPlan = () => {
    setPricingPlans([
      ...pricingPlans,
      {
        id: `plan-${Date.now()}`,
        name: "Custom Tier",
        category: "Subscription",
        price: "₹7,999",
        billingPeriod: "monthly",
        description: "Plan description and target audience",
        features: ["Item 1", "Item 2"],
        ctaText: "Select Plan",
      },
    ]);
  };

  const removePricingPlan = (index: number) => {
    setPricingPlans(pricingPlans.filter((_, i) => i !== index));
  };

  // Helper functions for FAQs Builder
  const addFaq = () => {
    setFaqs([
      ...faqs,
      {
        id: `faq-${Date.now()}`,
        question: "New Frequently Asked Question?",
        answer: "Detailed, verified answer to assist website visitors and the AI assistant.",
        category: "General",
      },
    ]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Document mock upload
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments([
        ...documents,
        {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: "pdf",
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString().split("T")[0],
          extractedText: `Uploaded document content for ${file.name}. Pending Admin approval to be indexed into RAG Knowledge Base.`,
          chunksCount: 6,
          status: "uploaded",
        },
      ]);
    }
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <Navbar />

        <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold uppercase tracking-wider text-[#5C3A1E]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>KNOWLEDGE BASE SUBMISSION SUITE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                Client Information Management
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Submit your official company details, services, pricing, and documents. All entries undergo Administrative Review before being published to the RAG AI Chatbot.
              </p>
            </div>

            {/* Status Pill & Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB]">
                <span className="text-xs text-[#64748B] font-medium">Status:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    status === "APPROVED" || status === "PUBLISHED"
                      ? "bg-[#EDF7F0] text-[#2E7D4F]"
                      : status === "PENDING_REVIEW" || status === "CLIENT_UPDATED"
                      ? "bg-[#FEF6EE] text-[#C2761A]"
                      : status === "CHANGES_REQUESTED"
                      ? "bg-[#FEF3F2] text-[#B42318]"
                      : "bg-[#F1F5F9] text-[#475569]"
                  }`}
                >
                  {status.replace("_", " ")}
                </span>
              </div>

              <Link href="/client-dashboard">
                <Button variant="secondary" size="sm">
                  Client Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Feedback Banner (If Changes Requested) */}
          {status === "CHANGES_REQUESTED" && changesMessage && (
            <div className="p-5 rounded-2xl bg-[#FEF3F2] border border-[#FDA29B] flex items-start gap-3.5 text-[#B42318]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Admin Requested Changes</h4>
                <p className="text-xs leading-relaxed">{changesMessage}</p>
                <p className="text-[11px] text-[#B42318]/80 pt-1">
                  Please update the requested fields and click <strong>&quot;Submit Updated Information&quot;</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Strict Security & Approval Rule Banner */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/50 flex items-start gap-3 text-xs text-[#5C3A1E] shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-[#D4A35A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Strict Knowledge Gate:</span>
              <span>
                Client-submitted information <strong>never directly enters the live AI chatbot</strong>. Only information reviewed, verified, and approved by our Administrative Team will become active RAG knowledge.
              </span>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-[#EDF7F0] border border-[#75E0A7] text-[#2E7D4F] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Step Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(s.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[70px] ${
                    isActive
                      ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-xs"
                      : "bg-[#FFFDF9] border-[#EADFCB] text-[#64748B] hover:border-[#D4A35A]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${isActive ? "text-[#D4A35A]" : "text-[#94A3B8]"}`}>
                      0{s.id}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#D4A35A]" : "text-[#5C3A1E]"}`} />
                  </div>
                  <span className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-[#0F172A]"}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form Container */}
          <div className="bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
            {/* STEP 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 1: Company Profile</h3>
                  <p className="text-xs text-[#64748B] mt-1">Foundational brand facts for verified company intelligence.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">Company Name *</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={company.name}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      placeholder="e.g. Shri Ram Tech"
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">Company Tagline</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={company.tagline}
                      onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                      placeholder="e.g. Pioneering AI & Cloud Solutions"
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">Company Description</label>
                    <textarea
                      disabled={isLocked}
                      rows={2}
                      value={company.description}
                      onChange={(e) => setCompany({ ...company, description: e.target.value })}
                      placeholder="Concise overview of what your company offers..."
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">About Company</label>
                    <textarea
                      disabled={isLocked}
                      rows={3}
                      value={company.about}
                      onChange={(e) => setCompany({ ...company, about: e.target.value })}
                      placeholder="Detailed company history, vision, and mission..."
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">Industry</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={company.industry}
                      onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                      placeholder="e.g. Information Technology"
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">Founded Year</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={company.foundedYear}
                      onChange={(e) => setCompany({ ...company, foundedYear: e.target.value })}
                      placeholder="e.g. 2022"
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">Company Size</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={company.companySize}
                      onChange={(e) => setCompany({ ...company, companySize: e.target.value })}
                      placeholder="e.g. 50-100 Employees"
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-[#0F172A]">Official Website URL</label>
                    <input
                      disabled={isLocked}
                      type="url"
                      value={company.websiteUrl}
                      onChange={(e) => setCompany({ ...company, websiteUrl: e.target.value })}
                      placeholder="https://shriramtech.com"
                      className="w-full p-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Services */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 2: Dynamic Services</h3>
                    <p className="text-xs text-[#64748B] mt-1">Add, edit, delete, or reorder client services.</p>
                  </div>
                  {!isLocked && (
                    <Button onClick={addService} variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Add Service
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {services.map((srv, idx) => (
                    <div key={srv.id} className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#EADFCB]/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E]">
                          Service #{idx + 1}
                        </span>
                        {!isLocked && (
                          <button
                            onClick={() => removeService(idx)}
                            className="text-[#B42318] hover:bg-[#FEF3F2] p-1.5 rounded-lg text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Service Name *</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={srv.name}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].name = e.target.value;
                              setServices(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Starting Price</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={srv.startingPrice}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].startingPrice = e.target.value;
                              setServices(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-semibold block mb-1">Short Description</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={srv.shortDescription}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].shortDescription = e.target.value;
                              setServices(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-semibold block mb-1">Detailed Description</label>
                          <textarea
                            disabled={isLocked}
                            rows={2}
                            value={srv.detailedDescription}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].detailedDescription = e.target.value;
                              setServices(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Call-to-Action (CTA)</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={srv.ctaText}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].ctaText = e.target.value;
                              setServices(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Products */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 3: Dynamic Products</h3>
                    <p className="text-xs text-[#64748B] mt-1">Specify software packages, hardware, or tangible products.</p>
                  </div>
                  {!isLocked && (
                    <Button onClick={addProduct} variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Add Product
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {products.map((prd, idx) => (
                    <div key={prd.id} className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#EADFCB]/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E]">
                          Product #{idx + 1}
                        </span>
                        {!isLocked && (
                          <button
                            onClick={() => removeProduct(idx)}
                            className="text-[#B42318] hover:bg-[#FEF3F2] p-1.5 rounded-lg text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Product Name *</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={prd.name}
                            onChange={(e) => {
                              const updated = [...products];
                              updated[idx].name = e.target.value;
                              setProducts(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Price</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={prd.price}
                            onChange={(e) => {
                              const updated = [...products];
                              updated[idx].price = e.target.value;
                              setProducts(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-semibold block mb-1">Description</label>
                          <textarea
                            disabled={isLocked}
                            rows={2}
                            value={prd.description}
                            onChange={(e) => {
                              const updated = [...products];
                              updated[idx].description = e.target.value;
                              setProducts(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-semibold block mb-1">Product URL</label>
                          <input
                            disabled={isLocked}
                            type="url"
                            value={prd.productUrl || ""}
                            onChange={(e) => {
                              const updated = [...products];
                              updated[idx].productUrl = e.target.value;
                              setProducts(updated);
                            }}
                            placeholder="https://example.com/product"
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Pricing / Plans */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 4: Dynamic Pricing & Plans</h3>
                    <p className="text-xs text-[#64748B] mt-1">Create unlimited custom pricing tiers, user limits, and features.</p>
                  </div>
                  {!isLocked && (
                    <Button onClick={addPricingPlan} variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Add Plan
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pricingPlans.map((plan, idx) => (
                    <div key={plan.id} className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#EADFCB]/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E]">
                          Tier #{idx + 1}
                        </span>
                        {!isLocked && (
                          <button
                            onClick={() => removePricingPlan(idx)}
                            className="text-[#B42318] hover:bg-[#FEF3F2] p-1.5 rounded-lg text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Plan Name *</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={plan.name}
                            onChange={(e) => {
                              const updated = [...pricingPlans];
                              updated[idx].name = e.target.value;
                              setPricingPlans(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Price (e.g. ₹5,999)</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={plan.price}
                            onChange={(e) => {
                              const updated = [...pricingPlans];
                              updated[idx].price = e.target.value;
                              setPricingPlans(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Billing Period</label>
                          <select
                            disabled={isLocked}
                            value={plan.billingPeriod}
                            onChange={(e) => {
                              const updated = [...pricingPlans];
                              updated[idx].billingPeriod = e.target.value as any;
                              setPricingPlans(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="one-time">One-Time Commission</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Popular Badge</label>
                          <label className="flex items-center gap-2 mt-2">
                            <input
                              disabled={isLocked}
                              type="checkbox"
                              checked={plan.isPopular || false}
                              onChange={(e) => {
                                const updated = [...pricingPlans];
                                updated[idx].isPopular = e.target.checked;
                                setPricingPlans(updated);
                              }}
                              className="rounded text-[#5C3A1E]"
                            />
                            <span className="text-xs">Mark as Most Popular</span>
                          </label>
                        </div>

                        <div className="col-span-2">
                          <label className="font-semibold block mb-1">Description</label>
                          <textarea
                            disabled={isLocked}
                            rows={2}
                            value={plan.description}
                            onChange={(e) => {
                              const updated = [...pricingPlans];
                              updated[idx].description = e.target.value;
                              setPricingPlans(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: FAQs */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 5: Dynamic FAQs</h3>
                    <p className="text-xs text-[#64748B] mt-1">Supply direct Q&A for high-precision RAG chatbot responses.</p>
                  </div>
                  {!isLocked && (
                    <Button onClick={addFaq} variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Add FAQ
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={faq.id} className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#EADFCB]/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E]">
                          FAQ #{idx + 1}
                        </span>
                        {!isLocked && (
                          <button
                            onClick={() => removeFaq(idx)}
                            className="text-[#B42318] hover:bg-[#FEF3F2] p-1.5 rounded-lg text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Question *</label>
                          <input
                            disabled={isLocked}
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[idx].question = e.target.value;
                              setFaqs(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Answer *</label>
                          <textarea
                            disabled={isLocked}
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[idx].answer = e.target.value;
                              setFaqs(updated);
                            }}
                            className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Contact Information */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 6: Contact & Business Channels</h3>
                  <p className="text-xs text-[#64748B] mt-1">Official communication endpoints used by the AI assistant.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Email Address *</label>
                    <input
                      disabled={isLocked}
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Phone Number *</label>
                    <input
                      disabled={isLocked}
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">WhatsApp Business</label>
                    <input
                      disabled={isLocked}
                      type="tel"
                      value={contact.whatsapp || ""}
                      onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Business Operating Hours</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={contact.businessHours}
                      onChange={(e) => setContact({ ...contact, businessHours: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">Office Street Address</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={contact.address}
                      onChange={(e) => setContact({ ...contact, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">City</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={contact.city}
                      onChange={(e) => setContact({ ...contact, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">State & Country</label>
                    <input
                      disabled={isLocked}
                      type="text"
                      value={`${contact.state}, ${contact.country}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(",");
                        setContact({
                          ...contact,
                          state: parts[0]?.trim() || "",
                          country: parts[1]?.trim() || "India",
                        });
                      }}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Policies */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 7: Policies & Terms</h3>
                  <p className="text-xs text-[#64748B] mt-1">Official terms, refund, and privacy safeguards.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Privacy Policy</label>
                    <textarea
                      disabled={isLocked}
                      rows={2}
                      value={policies.privacyPolicy || ""}
                      onChange={(e) => setPolicies({ ...policies, privacyPolicy: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Terms & Conditions</label>
                    <textarea
                      disabled={isLocked}
                      rows={2}
                      value={policies.termsAndConditions || ""}
                      onChange={(e) => setPolicies({ ...policies, termsAndConditions: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Refund & Cancellation Policy</label>
                    <textarea
                      disabled={isLocked}
                      rows={2}
                      value={policies.refundPolicy || ""}
                      onChange={(e) => setPolicies({ ...policies, refundPolicy: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: Documents */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Step 8: Document Knowledge Ingestion</h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Upload PDF, DOCX, or TXT decks. Once approved by Admin, documents are chunked and embedded into RAG.
                  </p>
                </div>

                {!isLocked && (
                  <div className="border-2 border-dashed border-[#EADFCB] hover:border-[#D4A35A] rounded-2xl p-8 text-center bg-[#FAF9F5] transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleDocUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileUp className="w-10 h-10 text-[#5C3A1E] mx-auto mb-2" />
                    <h4 className="font-semibold text-sm">Upload Capability Deck or Whitepaper</h4>
                    <p className="text-xs text-[#64748B] mt-1">Supports PDF, DOCX, TXT up to 25 MB</p>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A98B57] block">
                    Uploaded Documents:
                  </span>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#EADFCB] flex items-center justify-center font-bold text-[10px] text-[#5C3A1E]">
                          {doc.type.toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-semibold">{doc.name}</h5>
                          <span className="text-[10px] text-[#64748B]">
                            {doc.size} • {doc.chunksCount || 0} vectorized chunks
                          </span>
                        </div>
                      </div>
                      <Badge variant={doc.status === "approved" ? "completed" : "neutral"}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step Navigation Actions */}
            <div className="pt-6 border-t border-[#EADFCB] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  variant="secondary"
                  size="sm"
                  disabled={currentStep === 1}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Previous Step
                </Button>
                {currentStep < 8 && (
                  <Button
                    onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
                    variant="secondary"
                    size="sm"
                    withArrow
                  >
                    Next Step
                  </Button>
                )}
              </div>

              {/* Submission Triggers */}
              <div className="flex items-center gap-2">
                {!isLocked ? (
                  <>
                    <Button
                      onClick={() => saveSubmission("DRAFT")}
                      variant="secondary"
                      size="sm"
                      disabled={loading}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                    >
                      Save Draft
                    </Button>
                    <Button
                      onClick={() =>
                        saveSubmission(status === "CHANGES_REQUESTED" ? "CLIENT_UPDATED" : "PENDING_REVIEW")
                      }
                      variant="primary"
                      size="sm"
                      disabled={loading}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      {status === "CHANGES_REQUESTED" ? "Submit Updated Information" : "Submit for Admin Review"}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <Clock className="w-4 h-4 text-[#C2761A]" />
                    <span>Submission is locked under Administrative Review.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
