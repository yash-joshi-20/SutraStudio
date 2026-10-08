"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  PhoneCall,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Building2,
  Layers,
  DollarSign,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Clock,
  CheckCircle2,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Volume1,
  Languages,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { motion, AnimatePresence } from "framer-motion";
import { openRazorpayCheckout } from "@/lib/services/razorpayClient";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { useAuth } from "@/lib/auth/authContext";
import { usePathname, useRouter } from "next/navigation";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatAttachment {
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  time: string;
  attachments?: ChatAttachment[];
  sources?: Array<{ title: string; category: string }>;
  isLeadPrompt?: boolean;
  orderDraft?: {
    orderId: string;
    orderNumber: string;
    service: string;
    totalAmount: number;
    razorpayOrderId: string;
    keyId: string;
    paid?: boolean;
    paymentId?: string;
  };
}

const QUICK_ACTIONS = [
  { label: "Our Services", query: "What services do you offer and what are their features?" },
  { label: "Pricing & Plans", query: "What are your pricing plans and rates?" },
  { label: "About Studio", query: "Tell me about Sutra Studio background and expertise" },
  { label: "Office & Contact", query: "Where is your office located and how can I contact you?" },
];

/**
 * Parses inline markdown tokens: bold **text**, code `text`, and links [text](url)
 */
function parseInlineMarkdown(text: string): React.ReactNode {
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-[#171717]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-[#F4F1EA] border border-[#E5E1D8] text-[11px] font-mono text-[#5C3A1E]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#A98B57] underline hover:text-[#5C3A1E] font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

/**
 * Rich message formatter supporting bullets, numbered items, code, bolding, headings & separators
 */
function FormattedMessageContent({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-line leading-relaxed">{text}</span>;
  }

  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed text-xs text-[#171717]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed === "---" || trimmed === "***") {
          return <hr key={idx} className="border-[#E5E1D8] my-2" />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-serif font-bold text-xs text-[#171717] mt-2 mb-0.5">
              {parseInlineMarkdown(trimmed.replace(/^###\s*/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-serif font-bold text-sm text-[#171717] mt-2.5 mb-1">
              {parseInlineMarkdown(trimmed.replace(/^##\s*/, ""))}
            </h3>
          );
        }

        if (/^[•\-*+]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[•\-*+]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="text-[#A98B57] font-bold text-xs mt-0.5 select-none shrink-0">•</span>
              <span className="flex-1 leading-relaxed">{parseInlineMarkdown(content)}</span>
            </div>
          );
        }

        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 mt-1">
              <span className="font-bold text-[#5C3A1E] text-xs shrink-0 select-none">
                {numberMatch[1]}.
              </span>
              <span className="flex-1 leading-relaxed">{parseInlineMarkdown(numberMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export function openSutraChat() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-sutra-chat"));
  }
}

export function FloatingChatModal() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-sutra-chat", handleOpen);
    return () => window.removeEventListener("open-sutra-chat", handleOpen);
  }, []);

  const getGreetingData = () => {
    const hour = new Date().getHours();
    let greetingTime = "Good Morning";
    let gujaratiTime = "શુભ પ્રભાત";
    if (hour >= 12 && hour < 17) {
      greetingTime = "Good Afternoon";
      gujaratiTime = "શુભ બપોર";
    } else if (hour >= 17) {
      greetingTime = "Good Evening";
      gujaratiTime = "શુભ સંધ્યા";
    }

    const text = `${greetingTime} (${gujaratiTime})! 🙏 Welcome to **Sutra Studio**.\n\nI am your dedicated Studio Concierge. You can speak or type to inquire about our 12 creative capabilities, review pricing, share reference files, or commission direct orders. How may we assist your creative vision today?`;
    const spoken = `${greetingTime}! Welcome to Sutra Studio Atelier. How may I assist your creative vision today?`;
    return { text, spoken };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const greeting = getGreetingData();
    return [
      {
        id: "msg-welcome",
        sender: "bot",
        text: greeting.text,
        time: "Just now",
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Input (Speech Recognition) & Voice Output (Text-to-Speech)
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasSpokenGreetingRef = useRef(false);

  // Auto-speak female greeting when chat is first opened
  useEffect(() => {
    if (isOpen && !hasSpokenGreetingRef.current) {
      hasSpokenGreetingRef.current = true;
      const greeting = getGreetingData();
      const timer = setTimeout(() => {
        handleSpeakMessage("msg-welcome", greeting.spoken);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Clean raw markdown text for natural voice speech synthesis
  const cleanTextForSpeech = (raw: string): string => {
    return raw
      .replace(/https?:\/\/\S+/g, "") // remove URLs
      .replace(/(\*\*|\*|`|#{1,6}|\[|\]\(.*?\))/g, "") // remove markdown syntax
      .replace(/([_~`>#*+-])/g, " ") // remove symbols
      .replace(/\n+/g, " ") // replace line breaks with space
      .replace(/\s+/g, " ") // normalize spacing
      .trim();
  };

  // Preload speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const onVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoices);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
    }
  }, []);

  // Text-to-Speech handler (Gemini-style per message female voice synthesis)
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Auto detect language from content
    const isGujarati = /[\u0A80-\u0AFF]/.test(cleanText);
    const isHindi = /[\u0900-\u097F]/.test(cleanText);

    const voices = window.speechSynthesis.getVoices();

    const isFemaleName = (v: SpeechSynthesisVoice) => {
      const name = v.name.toLowerCase();
      return (
        name.includes("female") ||
        name.includes("woman") ||
        name.includes("neerja") ||
        name.includes("priya") ||
        name.includes("swara") ||
        name.includes("ananya") ||
        name.includes("heera") ||
        name.includes("kavya") ||
        name.includes("veena") ||
        name.includes("aditi") ||
        name.includes("kalpana") ||
        name.includes("disha") ||
        name.includes("radha") ||
        name.includes("zira") ||
        name.includes("aria") ||
        name.includes("jenny") ||
        name.includes("samantha") ||
        name.includes("victoria") ||
        name.includes("natural") ||
        name.includes("online")
      );
    };

    // Filter regional voices prioritizing female names
    const guVoices = voices.filter(
      (v) => v.lang.toLowerCase().startsWith("gu") || v.name.toLowerCase().includes("gujarati")
    );
    const guVoice = guVoices.find(isFemaleName) || guVoices[0];

    const hiVoices = voices.filter(
      (v) => v.lang.toLowerCase().startsWith("hi") || v.name.toLowerCase().includes("hindi")
    );
    const hiVoice = hiVoices.find(isFemaleName) || hiVoices[0];

    const inVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().includes("en-in") ||
        (v.lang.toLowerCase().startsWith("en") && v.name.toLowerCase().includes("india"))
    );
    const inFemaleVoice = inVoices.find(isFemaleName) || inVoices[0];

    const fallbackFemaleVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith("en") && isFemaleName(v)) ||
      voices.find(isFemaleName);

    if (isGujarati) {
      if (guVoice) utterance.voice = guVoice;
      utterance.lang = "gu-IN";
    } else if (isHindi) {
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = "hi-IN";
    } else {
      if (inFemaleVoice) {
        utterance.voice = inFemaleVoice;
      } else if (fallbackFemaleVoice) {
        utterance.voice = fallbackFemaleVoice;
      }
      utterance.lang = "en-IN";
    }

    // Warm, soothing natural female concierge pitch and pace
    utterance.rate = 0.94;
    utterance.pitch = 1.08;

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  };

  // Speech Recognition (Microphone) handler
  const baseInputRef = useRef("");
  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    try {
      baseInputRef.current = input;
      const recognition = new SpeechRecognition();
      // en-IN allows English, Hindi and Gujarati code-mixed speech recognition on modern browsers
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          if (baseInputRef.current) {
            setInput(`${baseInputRef.current} ${combined}`);
          } else {
            setInput(combined);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Human Handoff / Lead Capture Modal
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffForm, setHandoffForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: profile?.companyName || "",
    requirement: "",
    message: "",
  });
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [selectedChatOrder, setSelectedChatOrder] = useState<NonNullable<ChatMessage["orderDraft"]> | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  if (pathname === "/login" || pathname === "/admin/login" || pathname?.startsWith("/admin/login")) {
    return null;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: sizeStr,
            type: file.type,
            dataUrl: typeof reader.result === "string" ? reader.result : undefined,
          },
        ]);
      };
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: sizeStr,
            type: file.type,
          },
        ]);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePayChatOrder = async (msgId: string, draft: NonNullable<ChatMessage["orderDraft"]>) => {
    if (!isAuthenticated || !user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sutra_pending_chat_order", JSON.stringify(draft));
      }
      router.push(`/login?returnTo=${encodeURIComponent("/orders")}`);
      return;
    }

    setIsProcessingPayment(draft.orderId);
    try {
      await openRazorpayCheckout({
        key: draft.keyId,
        amountINR: draft.totalAmount,
        currency: "INR",
        name: "Sutra Studio",
        description: `${draft.service} Commission (#${draft.orderNumber})`,
        order_id: draft.razorpayOrderId,
        prefill: {
          name: user.displayName || "Studio Client",
          email: user.email || "client@sutrastudio.com",
          contact: user.phone || "+91 98765 43210",
        },
        onSuccess: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: draft.orderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(verifyData.error || "Payment signature verification failed");
            }

            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId
                  ? {
                      ...m,
                      orderDraft: {
                        ...m.orderDraft!,
                        paid: true,
                        paymentId: response.razorpay_payment_id,
                      },
                    }
                  : m
              )
            );

            const confirmationMsg: ChatMessage = {
              id: `bot_confirm_${Date.now()}`,
              sender: "bot",
              text: `✓ Payment verified! Razorpay Transaction ID: ${response.razorpay_payment_id}. Your order #${draft.orderNumber} is now officially paid and has moved to our active production pipeline. You can review all details in My Orders.`,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => [...prev, confirmationMsg]);
            window.dispatchEvent(new Event("sutra_orders_changed"));
          } catch (err: any) {
            alert(`Payment verification failed: ${err.message}`);
          }
        },
        onDismiss: () => {
          setIsProcessingPayment(null);
        },
        onError: (err: any) => {
          setIsProcessingPayment(null);
          alert(`Payment failed: ${err.description || err.message || "Unknown error"}`);
        },
      });
    } catch (err: any) {
      alert(`Could not launch Razorpay: ${err.message}`);
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if ((!text && attachments.length === 0) || isLoading) return;

    const currentAttachments = [...attachments];
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: text || "Uploaded reference files for review.",
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text || "Attached files for studio review",
          mode: "ai",
          clientId: user?.uid || "client_visitor",
          attachments: currentAttachments,
          conversationHistory: messages.slice(-5),
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: data.reply || data.answer || "I have received your inquiry.",
        orderDraft: data.orderDraft,
        sources: data.sources,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      try {
        const fallbackRes = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, client_id: user?.uid || "client_sutra" }),
        });
        const fallbackData = await fallbackRes.json();
        const fallbackMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: fallbackData.answer || "I don't have verified information about that yet. Please contact our team for assistance.",
          sources: fallbackData.sources,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } catch {
        const errMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: "bot",
          text: "I am currently unable to process your request. Please contact our art director or place your commission directly in My Orders.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "msg-welcome-new",
        sender: "bot",
        text: "Chat cleared. I am ready to answer any questions about our approved services, pricing, and studio capabilities in English or Gujarati.",
        time: "Just now",
      },
    ]);
  };

  const handleHandoffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: handoffForm.name,
          email: handoffForm.email,
          phone: handoffForm.phone,
          company: handoffForm.company,
          requirement: handoffForm.requirement || handoffForm.message,
          source: "human_handoff",
        }),
      });

      setHandoffSubmitted(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `handoff_${Date.now()}`,
          sender: "system",
          text: `Thank you, ${handoffForm.name}! Your inquiry has been routed to our Senior Producer. We will reach out to you at ${handoffForm.phone || handoffForm.email} shortly.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setTimeout(() => {
        setShowHandoffModal(false);
        setHandoffSubmitted(false);
        setHandoffForm({ name: "", email: "", phone: "", company: "", requirement: "", message: "" });
      }, 2000);
    } catch {
      alert("Failed to send request. Please try again.");
    }
  };

  return (
    <>
      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Sutra Studio Concierge"
          className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6 w-14 h-14 sm:w-auto sm:h-auto rounded-full flex items-center justify-center p-0 sm:px-4 sm:py-2.5 sm:gap-3 bg-[#171717]/95 backdrop-blur-md text-[#FAF9F5] border border-[#A98B57]/60 shadow-2xl hover:bg-[#262626] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <div className="relative w-full h-full sm:w-8 sm:h-8 flex items-center justify-center shrink-0 p-2 sm:p-0">
            <img
              src="/brand/sutra-symbol.png"
              alt="Sutra Studio"
              className="w-8 h-8 object-contain drop-shadow-sm group-hover:rotate-6 transition-transform duration-300"
            />
            <span className="absolute top-1.5 right-1.5 sm:-top-0.5 sm:-right-0.5 w-2.5 h-2.5 rounded-full bg-[#2E7D4F] border-2 border-[#171717] ring-1 ring-[#2E7D4F]/50 shadow-xs" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-serif font-bold text-[#FAF9F5] leading-tight">
              Sutra Concierge
            </div>
            <div className="text-[10px] text-[#D4A35A] font-sans tracking-wide">
              Studio Atelier • Online
            </div>
          </div>
        </button>
      )}

      {/* Main Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-[var(--z-modal)] w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-2rem)] bg-[#FAF9F5] border border-[#E5E1D8] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#171717]"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#171717] text-[#FAF9F5] flex items-center justify-between border-b border-[#A98B57]/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-[#A98B57]/60 flex items-center justify-center shrink-0 bg-[#262626] shadow-xs p-1.5">
                  <img
                    src="/brand/sutra-symbol.png"
                    alt="Sutra Studio"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-bold text-xs text-[#FAF9F5]">Sutra Studio</h3>
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-[#A98B57]/50 text-[#D4A35A] bg-[#262626]">
                      Concierge
                    </Badge>
                  </div>
                  <p className="text-[10px] text-[#94A3B8]">Creative Technology & Atelier Concierge</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear chat"
                  aria-label="Clear chat"
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#FAF9F5] hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#FAF9F5] hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="px-3 py-2 bg-white/80 border-b border-[#E5E1D8] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(action.query)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#E5E1D8] hover:border-[#A98B57] hover:bg-[#FAF9F5] text-[11px] text-[#5C3A1E] font-medium whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                const isSystem = msg.sender === "system";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#EBF3ED] text-[#2E7D4F] border border-[#2E7D4F]/20 text-[11px]">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"} gap-1`}
                  >
                    <div className={`flex items-start gap-2 ${isBot ? "" : "flex-row-reverse"}`}>
                      {isBot && (
                        <div className="w-6 h-6 rounded-full border border-[#A98B57]/50 shrink-0 bg-[#171717] mt-0.5 shadow-2xs flex items-center justify-center p-1">
                          <img
                            src="/brand/sutra-symbol.png"
                            alt="Sutra Studio"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs relative group ${
                          isBot
                            ? "bg-white border border-[#E5E1D8] text-[#171717] rounded-tl-xs"
                            : "bg-[#5C3A1E] text-white rounded-tr-xs"
                        }`}
                      >
                      {/* Attached images / files */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2 space-y-1.5">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-black/10 border border-white/10 text-[11px]">
                              {att.dataUrl ? (
                                <img src={att.dataUrl} alt={att.name} className="w-12 h-12 object-cover rounded-md" />
                              ) : (
                                <FileText className="w-4 h-4 text-[#D4A35A]" />
                              )}
                              <div className="truncate">
                                <p className="font-medium truncate">{att.name}</p>
                                <p className="text-[9px] opacity-75">{att.size}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <FormattedMessageContent text={msg.text} isUser={!isBot} />

                      {/* Order Draft Interactive Checkout Card */}
                      {msg.orderDraft && (
                        <div className="mt-3 p-3 rounded-xl bg-[#FAF9F5] border border-[#A98B57]/40 text-[#171717] space-y-2">
                          <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-1.5">
                            <span className="font-serif font-bold text-xs text-[#5C3A1E]">
                              Order #{msg.orderDraft.orderNumber}
                            </span>
                            <Badge variant="outline" className="text-[9px] bg-white border-[#A98B57]/50 text-[#A98B57]">
                              {msg.orderDraft.paid ? "Paid" : "Pending Payment"}
                            </Badge>
                          </div>
                          <div className="text-[11px] space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-[#64748B]">Service:</span>
                              <span className="font-medium">{msg.orderDraft.service}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#64748B]">Total Amount:</span>
                              <span className="font-bold text-[#5C3A1E]">
                                ₹{msg.orderDraft.totalAmount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          {!msg.orderDraft.paid ? (
                            <div className="space-y-1.5 pt-1">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedChatOrder(msg.orderDraft!);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="w-full text-xs justify-center gap-1.5 !bg-[#5C3A1E] hover:!bg-[#462B16] text-white shadow-xs"
                              >
                                <QrCode className="w-3.5 h-3.5 text-[#D4A35A]" />
                                <span>Zero-Fee UPI QR (₹{msg.orderDraft.totalAmount.toLocaleString("en-IN")})</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isProcessingPayment === msg.orderDraft.orderId}
                                onClick={() => handlePayChatOrder(msg.id, msg.orderDraft!)}
                                className="w-full text-xs justify-center gap-1.5 border-[#EADFCB] hover:bg-[#FAF9F5]"
                              >
                                {isProcessingPayment === msg.orderDraft.orderId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CreditCard className="w-3.5 h-3.5" />
                                )}
                                <span>Pay via Razorpay / Cards</span>
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center gap-1 text-[11px] text-[#2E7D4F] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Order Registered • In Studio Queue</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsOpen(false);
                                  router.push("/orders");
                                }}
                                className="w-full text-xs justify-center gap-1.5 border-[#5C3A1E]/30 text-[#5C3A1E] hover:bg-[#FAF9F5]"
                              >
                                View Order in Dashboard →
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Speaker & Copy Actions (Gemini-style inline action toolbar) */}
                      {isBot && (
                        <div className="mt-2.5 pt-1.5 border-t border-[#E5E1D8]/60 flex items-center gap-1.5 text-[11px] text-[#64748B]">
                          <button
                            type="button"
                            onClick={() => handleSpeakMessage(msg.id, msg.text)}
                            title={speakingMsgId === msg.id ? "Stop voice playback" : "Read aloud (Voice)"}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer select-none ${
                              speakingMsgId === msg.id
                                ? "bg-[#5C3A1E] text-[#FAF9F5] font-medium shadow-xs"
                                : "bg-[#FAF9F5] border border-[#E5E1D8] hover:bg-[#F4F1EA] hover:text-[#171717] text-[#5C3A1E]"
                            }`}
                          >
                            {speakingMsgId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-[#D4A35A] animate-pulse" />
                                <span className="text-[10px]">Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-[#A98B57]" />
                                <span className="text-[10px]">Read Aloud</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copy response"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E5E1D8] hover:bg-[#F4F1EA] hover:text-[#171717] text-[#5C3A1E] transition-all cursor-pointer select-none"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#2E7D4F]" />
                                <span className="text-[10px] text-[#2E7D4F] font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#A98B57]" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      </div>
                    </div>

                    <span className="text-[9px] text-[#94A3B8] px-1">{msg.time}</span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-[#E5E1D8] rounded-2xl rounded-tl-xs max-w-[80%] shadow-xs">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-[#A98B57]/50 shrink-0 bg-[#171717]">
                    <img
                      src="/brand/sutra-app-icon.png"
                      alt="Sutra Studio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A98B57] animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A98B57] animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A98B57] animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[11px] text-[#64748B] ml-1">
                    Studio Concierge composing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#E5E1D8] shrink-0">
              {/* Listening Active Banner */}
              {isListening && (
                <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#A98B57]/40 flex items-center justify-between text-xs text-[#5C3A1E] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
                    <span className="font-medium text-[11px] text-[#171717]">
                      Listening... Speak in ગુજરાતી, English or Hindi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={stopListening}
                    className="text-[10px] font-bold text-[#5C3A1E] hover:text-[#171717] px-2 py-0.5 rounded bg-white border border-[#E5E1D8] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Attachment preview pills */}
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {attachments.map((att, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] text-[10px] text-[#5C3A1E]"
                    >
                      <Paperclip className="w-3 h-3 text-[#A98B57]" />
                      <span className="max-w-[120px] truncate">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-1.5 w-full"
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,.pdf,.glb,.gltf,.blend,.zip"
                  className="hidden"
                />

                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach images or brief files"
                  aria-label="Attach file"
                  className="p-2 sm:p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F4F1EA] hover:border-[#A98B57] transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                >
                  <Paperclip className="w-4 h-4 text-[#A98B57]" />
                </button>

                {/* Microphone Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Stop voice listening" : "Voice Input (Microphone)"}
                  aria-label="Voice input"
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center ${
                    isListening
                      ? "bg-[#DC2626] border-[#DC2626] text-white animate-pulse ring-2 ring-[#DC2626]/40"
                      : "bg-[#FAF9F5] border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F4F1EA] hover:border-[#A98B57]"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-[#A98B57]" />
                  )}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask in English, ગુજરાતી or हिंदी..."
                  className="flex-1 min-w-0 min-h-[42px] bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl px-3 py-2 text-xs sm:text-xs text-[#171717] placeholder:text-[#94A3B8] placeholder:truncate focus:outline-none focus:bg-white focus:border-[#A98B57] focus:ring-1 focus:ring-[#A98B57] transition-all"
                />

                <button
                  type="submit"
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  aria-label="Send message"
                  className="p-2 sm:p-2.5 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#432A15] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4 text-[#D4A35A]" />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between text-[10px] text-[#94A3B8] px-1">
                <span>Sutra Studio Intelligence</span>
                <button
                  onClick={() => setShowHandoffModal(true)}
                  className="text-[#5C3A1E] font-semibold hover:underline cursor-pointer"
                >
                  Talk to Executive Team
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Talk to Human / Lead Modal */}
      <AnimatePresence>
        {showHandoffModal && (
          <div className="fixed inset-0 z-[var(--z-toast)] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFDF9] border border-[#E5E1D8] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#171717]"
            >
              <button
                onClick={() => setShowHandoffModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-[#64748B] hover:text-[#171717] hover:bg-[#F4F1EA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#5C3A1E] text-white flex items-center justify-center border border-[#A98B57]/40 shadow-xs">
                  <PhoneCall className="w-5 h-5 text-[#D4A35A]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#171717]">Talk to Studio Executive</h3>
                  <p className="text-xs text-[#64748B]">Direct escalation to Senior Creative Producer</p>
                </div>
              </div>

              {handoffSubmitted ? (
                <div className="p-6 text-center space-y-2">
                  <Check className="w-10 h-10 text-[#2E7D4F] mx-auto" />
                  <h4 className="font-serif font-bold text-base text-[#171717]">Request Dispatched!</h4>
                  <p className="text-xs text-[#64748B]">
                    Our Senior Producer will reach out to you immediately.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleHandoffSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">Your Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={handoffForm.name}
                      onChange={(e) => setHandoffForm({ ...handoffForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs text-[#171717] focus:outline-none focus:border-[#A98B57] focus:ring-1 focus:ring-[#A98B57]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold block mb-1 text-[#171717]">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="name@company.com"
                        value={handoffForm.email}
                        onChange={(e) => setHandoffForm({ ...handoffForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs text-[#171717] focus:outline-none focus:border-[#A98B57] focus:ring-1 focus:ring-[#A98B57]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-[#171717]">Phone / WhatsApp *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98000 00000"
                        value={handoffForm.phone}
                        onChange={(e) => setHandoffForm({ ...handoffForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs text-[#171717] focus:outline-none focus:border-[#A98B57] focus:ring-1 focus:ring-[#A98B57]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">Company / Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Luxury Residences"
                      value={handoffForm.company}
                      onChange={(e) => setHandoffForm({ ...handoffForm, company: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs text-[#171717] focus:outline-none focus:border-[#A98B57] focus:ring-1 focus:ring-[#A98B57]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">Project Requirement / Message</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what you'd like to build or discuss..."
                      value={handoffForm.message}
                      onChange={(e) => setHandoffForm({ ...handoffForm, message: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs text-[#171717] focus:outline-none focus:border-[#A98B57] focus:ring-1 focus:ring-[#A98B57] resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="md" className="w-full justify-center">
                      Submit & Connect with Team
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-Chat Zero-Fee UPI & GPay Payment Modal */}
      {isPaymentModalOpen && selectedChatOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderId={selectedChatOrder.orderId}
          orderCode={selectedChatOrder.orderNumber}
          clientName={user?.displayName || "Studio Client"}
          clientEmail={user?.email || "client@sutrastudio.com"}
          serviceTitle={selectedChatOrder.service}
          amount={selectedChatOrder.totalAmount}
          onPaymentSuccess={() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.orderDraft?.orderId === selectedChatOrder.orderId
                  ? { ...m, orderDraft: { ...m.orderDraft, paid: true } }
                  : m
              )
            );
          }}
        />
      )}
    </>
  );
}
