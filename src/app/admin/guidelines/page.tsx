"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Megaphone,
  UserCheck,
  KeyRound,
} from "lucide-react";

type GuidelineTab = "client-setup" | "meta-ads";

export default function AdminGuidelinesPage() {
  const [activeTab, setActiveTab] = useState<GuidelineTab>("client-setup");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleDownloadSOP = () => {
    const content = `# SUTRA STUDIOS — AGENCY OPERATING GUIDELINES
Standard Operating Procedures for Client Account Setup & Meta Advertising Execution
(Strictly Confidential — Internal Studio Use Only)

================================================================================
PART 1: CLIENT SOCIAL & MESSAGING SETUP PLAYBOOK
================================================================================
RULE ZERO: NEVER ASK CLIENTS FOR PASSWORDS OR PERSONAL LOGIN CREDENTIALS.
All access must be granted via Meta Business Suite Partner Access and WhatsApp Business Manager.

STEP 1: Intake & Onboarding Checklist
Collect the following from the client:
1. Legal Entity / Business Name & Registered Address
2. Primary Point of Contact (Full Name, Official Email, Phone)
3. Website Domain / Active Landing Page URL
4. Business Registration Proof / GSTIN Certificate (for Meta Business Verification)
5. Brand Assets: High-resolution vector logo (.SVG / .PNG transparent), Brand Color Hex Codes, Typography guidelines
6. Official Business Phone Number (must be capable of receiving SMS/Call for WhatsApp OTP)

STEP 2: Meta Business Suite Partner Access
1. Request the client's Meta Business Portfolio ID (found under Business Settings > Business Info).
2. From Sutra Studios Business Manager, navigate to Users > Partners > Add Partner > Ask a partner to share their assets.
3. Request the following permissions:
   - Facebook Page: Create content, View Page performance, Manage ads.
   - Instagram Account: Content, Insights, Ads.
   - Meta Ad Account: Manage campaigns (or Admin if setting up payment instruments).
   - Meta Pixel / Dataset: View & Manage events.
4. Client Message Template:
   "Hi [Client Name], to seamlessly manage your campaigns without needing your private passwords, please approve our partner access request in your Meta Business Suite: Business Settings > Requests > Received. Thank you!"

STEP 3: Linking Accounts
1. Connect Instagram to Facebook Page: Page Settings > Linked Accounts > Instagram > Connect Account.
2. Connect WhatsApp Business: Page Settings > Linked Accounts > WhatsApp > Enter official business number > Enter 5-digit verification code.

STEP 4: Organic Warming & Foundation Before Paid Ads
1. Minimum 3 to 9 high-quality organic posts must be published on the Page and Instagram profile prior to launching any paid ads.
2. An unaged page running immediate aggressive ads triggers automated Meta policy flags and payment verification holds.

STEP 5: Pre-Flight Technical Verification
1. Verify Meta Pixel / Conversions API (CAPI) fires with the Meta Pixel Helper extension.
2. Verify domain verification under Brand Safety > Domains.

================================================================================
PART 2: META & INSTAGRAM ADVERTISING EXECUTION PLAYBOOK
================================================================================
STEP 1: Objective Selection
- Sales: For e-commerce checkout and lead purchase events.
- Leads: For consultation forms, instant lead forms, or WhatsApp conversations.
- Traffic: For sending qualified visitors to bespoke landing pages.
- Awareness / Reach: For brand launch announcements.

STEP 2: Special Ad Categories Check
Declare immediately if the ad relates to: Credit, Employment, Housing, or Social Issues/Politics.
Never attempt to bypass Special Ad Categories, as it leads to immediate ad rejection and account penalty.

STEP 3: Audience Demographics & Targeting
- Location: Pin-drop specific cities or 15km - 25km radius around affluent hubs. Exclude non-serviceable postal codes.
- Age: Align with disposable income brackets (e.g., 25 - 54 for luxury services).
- Gender: Select according to product affinity or target All.
- Detailed Interests: Combine 3-5 high-relevance interests. Avoid overly fragmented ad sets.

STEP 4: Placements
- Use Advantage+ Placements for initial delivery optimization.
- If manually testing, separate Feed (1:1, 4:5) and Reels/Stories (9:16).

STEP 5: Creative Dimensions & Safe Zones
- 1:1 Square (1080 x 1080 px): Feeds and desktop display.
- 4:5 Vertical (1080 x 1350 px): Optimal mobile feed real estate.
- 9:16 Full Screen (1080 x 1920 px): Instagram Reels and Stories. Keep top 250px and bottom 300px clear of copy.

STEP 6: Ad Copy Architecture
- Primary Text: Hook (first 125 chars visible before 'See more') + Core Value Proposition + Social Proof + Call to Action.
- Headline: High-impact benefit statement (under 40 characters).
- Description: Secondary reassurance (under 30 characters).

STEP 7: Destination & Tracking
- Attach standard UTM parameters: ?utm_source=meta&utm_medium=paid&utm_campaign=[CampaignName]
- For WhatsApp ads, configure click-to-chat with pre-filled greeting text.

STEP 8: Meta Policy Pre-Launch Checklist
- No personal attribute targeting ("Do you struggle with...").
- No unverifiable claims or exaggerated before/after photos.
- Visual text density below 20% of image area for optimal delivery.
- Landing page parity: Destination page must match the creative's offer and pricing.

STEP 9: Performance Reading & Diagnosis
- CTR (Link Click-Through Rate): Benchmark > 1.2% (Good: 1.5% - 2.5%).
- CPC (Cost Per Click): Monitor against industry baseline (₹8 - ₹25 for India).
- Frequency: If Frequency exceeds 3.5 on a cold audience, creative fatigue has set in — refresh visual creatives.
`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sutra-agency-onboarding-and-ads-guidelines.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E5E1D8] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-white border border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F3EFE6] transition-colors shadow-xs"
                title="Back to Admin Hub"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#171717] flex items-center justify-center text-[#EADFCB] shadow-sm">
                  <FileText className="w-5 h-5 text-[#A98B57]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#171717]">
                      Agency Operating Guidelines
                    </h1>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#EADFCB]/40 text-[#5C3A1E] rounded-md border border-[#D4C3A3]/50">
                      Standard Operating Procedures
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#78716C]">
                    Client account onboarding, Meta Business Suite partner access & Facebook/Instagram advertising execution
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/admin/ad-desk">
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold gap-1.5 bg-[#171717] text-white hover:bg-[#2A2A2A]"
                >
                  <Megaphone className="w-3.5 h-3.5 text-[#D4A35A]" />
                  <span>Open Ad Copy Desk</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSOP}
                className="text-xs font-semibold gap-1.5 border-[#E5E1D8] bg-white hover:bg-[#F3EFE6] text-[#171717]"
              >
                <Download className="w-3.5 h-3.5 text-[#A98B57]" />
                <span className="hidden sm:inline">Export SOP (.md)</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Security & Partner Access Directive Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#FEE2E2] text-[#991B1B] shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5 text-[#991B1B]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                  <span>Golden Security Directive: Never Ask for Passwords</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#FEF2F2] text-[#991B1B] rounded-full border border-[#FCA5A5]">
                    Strict Protocol
                  </span>
                </h4>
                <p className="text-xs text-[#78716C] mt-0.5 max-w-3xl leading-relaxed">
                  Agency staff must never request client Facebook, Instagram, or email passwords. All access must be provisioned securely through Meta Business Suite Partner Access using our agency Business Portfolio ID. This protects client account security, prevents IP lockouts, and keeps account ownership transparent.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <span className="text-xs font-semibold text-[#5C3A1E] px-3 py-1.5 rounded-xl bg-[#EADFCB]/30 border border-[#D4C3A3]/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D4F]" />
                <span>Meta Business Partner Standard</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E1D8] no-scrollbar">
            <button
              onClick={() => setActiveTab("client-setup")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === "client-setup"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#A98B57]" />
              <span>1. Client Social Setup & Partner Access</span>
            </button>

            <button
              onClick={() => setActiveTab("meta-ads")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === "meta-ads"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
              }`}
            >
              <Megaphone className="w-4 h-4 text-[#D4A35A]" />
              <span>2. Meta Ads Execution Playbook (Step-by-Step)</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* ========================================================================= */}
          {/* TAB 1: CLIENT SOCIAL & MESSAGING SETUP PLAYBOOK */}
          {/* ========================================================================= */}
          {activeTab === "client-setup" && (
            <div className="space-y-6 animate-fadeIn">
              {CLIENT_SETUP_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#E5E1D8] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#171717] text-[#FAF9F5] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#171717]">
                          {step.title}
                        </h3>
                        <p className="text-xs text-[#78716C]">{step.subtitle}</p>
                      </div>
                    </div>
                    {step.badge && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40 shrink-0">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#171717] space-y-3 leading-relaxed">
                    <p>{step.explanation}</p>

                    {step.checklist && (
                      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2">
                        <span className="font-semibold text-[#5C3A1E] block text-[11px] uppercase tracking-wider">
                          Required Deliverables / Checklist:
                        </span>
                        <ul className="space-y-1.5 text-xs text-[#171717] list-none">
                          {step.checklist.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.copyTemplate && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#5C3A1E] uppercase tracking-wider">
                            Ready-to-Send Template for Client:
                          </span>
                        </div>
                        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] flex items-start justify-between gap-4">
                          <p className="text-xs text-[#171717] whitespace-pre-line leading-relaxed font-sans">
                            {step.copyTemplate}
                          </p>
                          <CopyButton
                            text={step.copyTemplate}
                            id={`setup-template-${step.number}`}
                            copiedId={copiedId}
                            onCopy={copyToClipboard}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: META ADS EXECUTION PLAYBOOK */}
          {/* ========================================================================= */}
          {activeTab === "meta-ads" && (
            <div className="space-y-6 animate-fadeIn">
              {META_ADS_STEPS.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#E5E1D8] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#171717] text-[#FAF9F5] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#171717]">
                          {step.title}
                        </h3>
                        <p className="text-xs text-[#78716C]">{step.subtitle}</p>
                      </div>
                    </div>
                    {step.tag && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40 shrink-0">
                        {step.tag}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#171717] space-y-3 leading-relaxed">
                    <p>{step.instructions}</p>

                    {step.detailsGrid && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {step.detailsGrid.map((detail, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1"
                          >
                            <span className="font-bold text-[#5C3A1E] block text-[11px]">
                              {detail.label}
                            </span>
                            <p className="text-[11px] text-[#78716C] leading-relaxed">
                              {detail.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.templateSnippet && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#5C3A1E] uppercase tracking-wider">
                            Ready-to-Use Configuration Template:
                          </span>
                        </div>
                        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] flex items-start justify-between gap-4">
                          <pre className="text-xs text-[#171717] font-sans whitespace-pre-line leading-relaxed">
                            {step.templateSnippet}
                          </pre>
                          <CopyButton
                            text={step.templateSnippet}
                            id={`ad-template-${step.stepNumber}`}
                            copiedId={copiedId}
                            onCopy={copyToClipboard}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </RouteGuard>
  );
}

// -----------------------------------------------------------------------------
// HELPER COMPONENTS
// -----------------------------------------------------------------------------

function CopyButton({
  text,
  id,
  copiedId,
  onCopy,
}: {
  text: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const isCopied = copiedId === id;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onCopy(text, id)}
      className={`h-8 px-2.5 text-xs font-semibold gap-1.5 transition-all shadow-2xs shrink-0 ${
        isCopied
          ? "bg-[#2E7D4F] text-white border-[#2E7D4F]"
          : "bg-white text-[#171717] border-[#E5E1D8] hover:bg-[#F3EFE6]"
      }`}
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-[#A98B57]" />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}

// -----------------------------------------------------------------------------
// DATA: CLIENT SETUP STEPS
// -----------------------------------------------------------------------------

const CLIENT_SETUP_STEPS = [
  {
    number: 1,
    title: "Client Onboarding Intake Checklist",
    subtitle: "What to gather from the client before initiating digital setups",
    badge: "Intake Stage",
    explanation:
      "A structured onboarding intake prevents delays and eliminates credential sharing. Request verified business details upfront to streamline Meta verification and WhatsApp Business API activation.",
    checklist: [
      "Official Legal Business Entity Name and Registered Corporate Address",
      "Authorized Director / Business Owner Contact (Name, Email, Direct Phone)",
      "Live Official Website or Primary Landing Page Domain",
      "GSTIN Certificate or Certificate of Incorporation (Mandatory for Meta Business Verification)",
      "High-Resolution Brand Assets: Vector Logo (.SVG / transparent .PNG), Brand Color Hex Codes, Typography guidelines",
      "Dedicated Business Phone Number capable of receiving SMS/Voice OTP for WhatsApp Business",
      "Meta Business Portfolio ID (15 or 16-digit ID found in Meta Business Suite)",
    ],
    copyTemplate: `Subject: Sutra Studios — Onboarding Information Request for [Client Name]

Dear [Client Name],

Welcome to Sutra Studios. To configure your Meta advertising infrastructure, Instagram presence, and WhatsApp Business channels, please provide the following details:

1. Official Registered Business Name & Address:
2. Authorized Primary Contact (Name, Email, Mobile):
3. Website Domain / Landing Page URL:
4. GSTIN Certificate or Certificate of Incorporation (PDF):
5. Brand Assets (Vector Logo, Color Palette Hex Codes, Fonts):
6. Dedicated Business Mobile Number for WhatsApp Business:
7. Your Meta Business Portfolio ID (Instructions below):

*How to find your Meta Business Portfolio ID:*
Log into business.facebook.com > Select your Business Account > Click Settings (gear icon) > Go to 'Business Info'. Your Business Portfolio ID is displayed at the top.

We will send a formal Partner Access request directly to your Meta Business Suite. You will never need to share any personal passwords with our studio.

Best regards,
Sutra Studios Executive Team`,
  },
  {
    number: 2,
    title: "Requesting Access via Meta Business Suite Partner Access",
    subtitle: "Securing agency management permissions without credential sharing",
    badge: "Security Protocol",
    explanation:
      "Meta Business Suite allows agency partner asset sharing. The client retains full master ownership of their Facebook Page, Instagram account, and Ad Account, while granting Sutra Studios explicit partner delegate permissions.",
    checklist: [
      "Log into Sutra Studios Business Manager (business.facebook.com)",
      "Navigate to Business Settings > Users > Partners",
      "Click 'Add' > Select 'Ask a partner to share their assets'",
      "Enter the client's Business Portfolio ID and request necessary assets:",
      "• Facebook Page: Content Creation, Community Management, Insights, and Ads",
      "• Instagram Account: Content, Insights, and Ads",
      "• Meta Ad Account: Manage Campaigns (or Administrator if managing payment methods)",
      "• Meta Pixel / Datasets: View & Manage events",
    ],
    copyTemplate: `Hi [Client Name],

We have dispatched a formal Partner Asset Request to your Meta Business Suite from Sutra Studios.

To approve:
1. Log into https://business.facebook.com
2. Go to Business Settings (gear icon) > Requests
3. Under the 'Received' tab, look for 'Sutra Studios'
4. Click 'Approve' and select the Page, Instagram, and Ad Account you wish to assign.

This gives our studio production team secure access to build your campaigns without ever requesting your personal passwords. Let us know once approved!`,
  },
  {
    number: 3,
    title: "Account Linking & WhatsApp Business Channel Integration",
    subtitle: "Unifying Facebook Page, Instagram Professional, and WhatsApp Business",
    badge: "Integration",
    explanation:
      "Seamless advertising requires that the Facebook Page, Instagram Professional account, and WhatsApp Business number are interconnected within the same Business Portfolio.",
    checklist: [
      "Link Instagram: Open Page Settings > Linked Accounts > Instagram > Click 'Connect Account' > Complete client authentication",
      "Link WhatsApp Business: Open Page Settings > Linked Accounts > WhatsApp > Enter official business number > Enter 5-digit verification code sent via SMS",
      "Set CTA Button on Page: Configure the Facebook Page action button to 'Send WhatsApp Message' or 'Contact Us'",
      "Verify Instagram Account Type: Ensure the Instagram account is converted to 'Business' or 'Creator' (Personal accounts cannot run Meta Ads API campaigns)",
    ],
    copyTemplate: `SOP Checkpoint:
1. Meta Page Linked Accounts -> Instagram: Status Verified [Green]
2. Meta Page Linked Accounts -> WhatsApp: Status Verified [Green]
3. Instagram Account Type: Professional / Business Mode Active
4. Page Action Button: Configured to 'Send WhatsApp Message' pointing to client's verified WhatsApp`,
  },
  {
    number: 4,
    title: "Pre-Ad Organic Warming & Account Foundation",
    subtitle: "Publishing the first 3 to 9 posts before launching any paid traffic",
    badge: "Risk Mitigation",
    explanation:
      "A completely new or empty Facebook Page running immediate aggressive advertising will trigger automated Meta risk algorithms, leading to account restrictions, payment holds, or advertising bans. Establish organic credibility first.",
    checklist: [
      "Publish profile display picture (DP) and cover photo following Sutra Brand Guide specs",
      "Fill out 100% of the Page About section, operating hours, website URL, and verified contact email",
      "Publish minimum 3 to 9 high-quality organic posts (utilize the First 9 Posts Plan from Sutra Brand Guide)",
      "Invite team members or client contacts to like/follow the page to generate initial social proof (>10 likes)",
      "Wait 48 to 72 hours following page completion before submitting the first paid advertising campaign for review",
    ],
  },
  {
    number: 5,
    title: "Technical Tracking & Pixel Pre-flight Verification",
    subtitle: "Confirming Meta Pixel, Conversions API (CAPI), and domain status",
    badge: "Technical QA",
    explanation:
      "Before spending advertising budget, ensure tracking events are verified to prevent lost conversion attribution.",
    checklist: [
      "Install Meta Pixel / Conversions API script on the client website or landing page",
      "Verify tracking with 'Meta Pixel Helper' Chrome Extension (Ensure PageView, ViewContent, and Lead/Purchase fire)",
      "Verify Domain: Under Meta Business Settings > Brand Safety > Domains, verify the domain via DNS TXT record or HTML tag",
      "Configure Aggregated Event Measurement: Prioritize the top 8 standard conversion events in Events Manager",
    ],
  },
];

// -----------------------------------------------------------------------------
// DATA: META ADS STEPS
// -----------------------------------------------------------------------------

const META_ADS_STEPS = [
  {
    stepNumber: 1,
    title: "Campaign Objective Selection",
    subtitle: "Choosing the optimal Meta advertising objective for the business goal",
    tag: "Campaign Level",
    instructions:
      "Meta uses machine learning to deliver ads to people most likely to take the action defined by your campaign objective. Selecting the wrong objective results in wasted budget.",
    detailsGrid: [
      {
        label: "Leads (Recommended for High-Ticket / Services)",
        text: "Optimized for Instant Forms on Facebook/Instagram or direct click-to-WhatsApp chats. Best for consultations, bespoke design, and luxury retail.",
      },
      {
        label: "Sales / Conversions (For E-Commerce)",
        text: "Optimized for catalog purchases, Add to Cart, and Complete Checkout events on client website.",
      },
      {
        label: "Traffic (Link Clicks)",
        text: "Drives volume visits to portfolio, blog, or interactive experience. Lower intent than Leads, but useful for retargeting pool building.",
      },
      {
        label: "Engagement / Page Promotion",
        text: "Boosts post interactions, video views, and follower growth. Useful during the initial 7-day organic warming period.",
      },
    ],
    templateSnippet: `Campaign Name: [Client Code] - [Service/Product] - [Objective] - [Month Year]
Example: SUTRA - Maison Aura Perfume - Leads - Oct 2026
Objective: LEADS (Instant Form + WhatsApp Chat)
Buying Type: Auction
Budget Optimization: Advantage Campaign Budget (CBO) enabled for multi-ad-set testing`,
  },
  {
    stepNumber: 2,
    title: "Special Ad Categories Compliance Declaration",
    subtitle: "Strictly declaring regulated advertising categories to prevent bans",
    tag: "Compliance",
    instructions:
      "Meta strictly regulates ads related to Credit, Employment, Housing, or Social Issues/Elections. If an ad touches these verticals, you must declare it at the campaign level.",
    detailsGrid: [
      {
        label: "Housing (Real Estate / Interior Renders)",
        text: "If advertising property sales, apartments, or housing finance, you MUST select Housing. Age, gender, and postal-code targeting will be locked to prevent discrimination.",
      },
      {
        label: "Employment (Hiring / Recruitment)",
        text: "Job listings or recruitment services must select Employment. Demographic targeting restrictions apply.",
      },
      {
        label: "Commercial Services Exemption",
        text: "Standard marketing, commercial 3D modeling, web development, and consumer luxury goods do NOT require special categories.",
      },
    ],
  },
  {
    stepNumber: 3,
    title: "Audience Demographics & Geo-Radius Targeting",
    subtitle: "Defining location, age, gender, and regional exclusions",
    tag: "Ad Set Level",
    instructions:
      "Focus ad spend on realistic customer geographies. For local and premium services, radius targeting around affluent pin-codes yields superior return compared to generic nationwide delivery.",
    detailsGrid: [
      {
        label: "Location / Radius Targeting",
        text: "Select 'People living in this location'. Use City centers or 15km - 25km radius around premium urban pockets. Exclude non-serviceable states/districts.",
      },
      {
        label: "Age & Gender Alignment",
        text: "Match the purchasing power bracket (e.g. 24 - 55 for luxury interior design or enterprise software). Avoid targeting 18-20 for high-ticket services.",
      },
      {
        label: "Languages",
        text: "Set to English (All) or specific regional language if creative copy is vernacular.",
      },
    ],
    templateSnippet: `Audience Setup:
Location: Mumbai, Maharashtra (+25 km radius) OR Delhi NCR (+30 km radius)
Age: 25 - 54 years
Gender: All (or tailored by product affinity)
Languages: English (All)`,
  },
  {
    stepNumber: 4,
    title: "Detailed Interest & Behavioral Layering",
    subtitle: "Targeting high-affinity consumer interests and behavior profiles",
    tag: "Targeting",
    instructions:
      "Group related interests together. Combine 3 to 6 strong interests within an ad set. Never layer more than 2 'Narrow Audience' conditions or audience size becomes too small.",
    detailsGrid: [
      {
        label: "High-Ticket Creative / Luxury Intersts",
        text: "Architectural Digest, Elle Decor, Interior design, Luxury lifestyle, High-net-worth consumers, First-class travel.",
      },
      {
        label: "Software & Digital Services Interests",
        text: "Shopify, E-commerce, Digital marketing, Startup company, Small business owners, Software as a service.",
      },
      {
        label: "Advantage Detailed Targeting",
        text: "Enable 'Advantage detailed targeting' to allow Meta to dynamically expand reach when performance warrants.",
      },
    ],
  },
  {
    stepNumber: 5,
    title: "Placements Strategy & Aspect Ratio Matrix",
    subtitle: "Matching creative dimensions to Feeds, Stories, and Reels",
    tag: "Creative Matrix",
    instructions:
      "Use Advantage+ Placements to maximize efficiency, but provide tailored aspect ratio creatives for every placement bucket.",
    detailsGrid: [
      {
        label: "1:1 Square (1080 × 1080 px)",
        text: "Primary placement for Facebook Feeds, Instagram Feeds, Desktop Feeds, and Search results.",
      },
      {
        label: "4:5 Vertical (1080 × 1350 px)",
        text: "Optimal mobile feed placement. Takes up 20% more screen space than square feeds, maximizing tap engagement.",
      },
      {
        label: "9:16 Full Screen (1080 × 1920 px)",
        text: "Instagram Reels, Facebook Reels, and Stories. Keep top 250px and bottom 300px clear of copy to prevent UI overlay cutoffs.",
      },
    ],
  },
  {
    stepNumber: 6,
    title: "Ad Budget, Schedule & The 7-Day Learning Phase",
    subtitle: "Managing daily budgets and respecting Meta's 50-event optimization threshold",
    tag: "Budget & Pacing",
    instructions:
      "Meta requires roughly 50 optimization events per ad set per week to exit the learning phase. Setting budgets too low stalls delivery.",
    detailsGrid: [
      {
        label: "Daily Budget Minimums",
        text: "Minimum ₹500 - ₹1,000/day per ad set for lead generation in Tier 1 Indian cities. Lower budgets remain trapped in the learning phase.",
      },
      {
        label: "The Learning Phase Rule",
        text: "Do NOT edit ad copy, targeting, or budget within the first 72 hours of launch. Edits reset machine learning.",
      },
      {
        label: "Budget Scaling Rule",
        text: "Scale winning ad sets by no more than 20% every 48 hours to maintain stable cost per acquisition (CPA).",
      },
    ],
  },
  {
    stepNumber: 7,
    title: "Ad Copy Architecture & Fields",
    subtitle: "Crafting Primary Text, Headlines, Newsfeed Descriptions, and CTAs",
    tag: "Ad Copy Craft",
    instructions:
      "Meta ad copy must adhere to the 4-part conversion anatomy: The Hook, The Value Proposition, The Proof Point, and The Direct Call to Action.",
    detailsGrid: [
      {
        label: "Primary Text (Hook visible in first 125 chars)",
        text: "Hook the reader before the '...See more' fold. Highlight the transformation or unique studio deliverable.",
      },
      {
        label: "Headline (Under 40 chars)",
        text: "Bold benefit statement. Displays directly next to the Call to Action button.",
      },
      {
        label: "Description (Under 30 chars)",
        text: "Secondary reassurance (e.g., 'From ₹499 • 48h Turnaround' or 'Trusted by 100+ Brands').",
      },
      {
        label: "Call to Action (CTA Button)",
        text: "Choose 'Learn More' (lowest friction) or 'Contact Us' / 'Send WhatsApp Message'.",
      },
    ],
    templateSnippet: `Primary Text:
Transform your brand's digital presence with bespoke creative production. From cinematic 3D architectural renders to high-converting performance marketing, Sutra Studios delivers end-to-end atelier craft with transparent milestones.

Explore our 12 disciplines or start with our 30-Day Growth Plan.

Headline: Bespoke Creative & Digital Production
Description: Starting from ₹499 • Dedicated Queue
CTA Button: Learn More (or Send WhatsApp Message)`,
  },
  {
    stepNumber: 8,
    title: "Destination URL, UTM Parameters & WhatsApp Click Links",
    subtitle: "Ensuring clean analytics tracking and frictionless inquiry paths",
    tag: "Tracking & Links",
    instructions:
      "Every campaign link must carry descriptive UTM parameters so Google Analytics and studio dashboards attribute revenue accurately.",
    detailsGrid: [
      {
        label: "Standard Website UTM Parameter Structure",
        text: "?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}",
      },
      {
        label: "Direct WhatsApp Click-to-Chat Link",
        text: "https://wa.me/918200192781?text=Hello%20Sutra%20Studios%2C%20I%20saw%20your%20Meta%20Ad%20and%20would%20like%20to%20discuss%20a%20project.",
      },
    ],
    templateSnippet: `Destination URL Example:
https://sutrastudios.in/services?utm_source=meta&utm_medium=paid_ad&utm_campaign=oct26_leads&utm_term=3d_interior`,
  },
  {
    stepNumber: 9,
    title: "Meta Advertising Policy Review Checklist",
    subtitle: "Pre-submission compliance checks to prevent ad disapproval",
    tag: "Policy Shield",
    instructions:
      "Every ad is scanned by automated Meta policy bots. Review against these non-negotiable compliance rules before submitting.",
    checklist: [
      "NO Personal Attribute Claims: Never say 'Are you tired of your poor design?' or 'Struggling with low sales?'. Use neutral, benefit-focused phrasing.",
      "NO Unverifiable or Exaggerated Claims: Do not promise '10x guaranteed revenue in 7 days' or 'Instant millions'. Only claim true studio deliverables.",
      "NO Sensationalist Before/After Comparison Imagery.",
      "Text Density Check: Keep on-image text under 20% of image area to ensure maximum delivery speed and lowest CPM.",
      "Landing Page Functional & Consistent: Destination page must match the exact offer, branding, and pricing stated in the ad.",
      "Trademarks Protected: Never use Meta, Facebook, or Instagram logos without authorized brand asset usage guidelines.",
    ],
  },
  {
    stepNumber: 10,
    title: "Pre-Launch Verification Checklist",
    subtitle: "Final sanity check before clicking 'Publish' in Ads Manager",
    tag: "Final QA",
    instructions:
      "Run this 10-point inspection before submitting any campaign to live review.",
    checklist: [
      "1. Ad Account currency set to INR (₹) and billing card validated.",
      "2. Campaign objective matches business outcome (Leads / Sales / Traffic).",
      "3. Special Ad Category checked or verified not applicable.",
      "4. Daily budget verified (ensure you haven't typed an extra zero!).",
      "5. Geographical radius set to 'Living in this location'.",
      "6. Creative aspect ratios correctly uploaded (1:1 Feed, 4:5 Mobile, 9:16 Reels).",
      "7. No text clipped in Reels safe zone (top 250px and bottom 300px clear).",
      "8. Destination URL tested and UTM parameters firing.",
      "9. Lead form or WhatsApp number tested with a live message.",
      "10. Meta Ad Policy checklist passed 100%.",
    ],
  },
  {
    stepNumber: 11,
    title: "How to Read & Diagnose Campaign Results",
    subtitle: "Interpreting CPM, CTR, CPC, CPL, ROAS, and frequency metrics",
    tag: "Analytics & Scaling",
    instructions:
      "Review campaign telemetry 72 hours post-launch using these diagnostic industry benchmarks.",
    detailsGrid: [
      {
        label: "Link CTR (Click-Through Rate)",
        text: "Benchmark: > 1.2%. If CTR < 0.8%, your visual hook or first 125 characters of copy are not compelling. Test a new visual creative.",
      },
      {
        label: "CPM (Cost Per 1,000 Impressions)",
        text: "India Benchmark: ₹80 - ₹250. If CPM > ₹400, your audience targeting is too narrow or on-image text density is triggering penalties.",
      },
      {
        label: "CPC (Cost Per Link Click)",
        text: "India Benchmark: ₹8 - ₹25 for qualified traffic. High CPC indicates low CTR or high auction competition.",
      },
      {
        label: "Frequency Fatigue (> 3.5)",
        text: "If Frequency exceeds 3.5 in a cold prospecting campaign, users are seeing the ad too many times. Creative fatigue has set in — rotate fresh visuals.",
      },
    ],
  },
];
