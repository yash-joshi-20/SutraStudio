"use client";

import React, { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Badge } from "@/components/ui/Badge";

export default function KnowledgeBaseAdminPage() {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  
  useEffect(() => {
    fetchKB();
  }, []);
  
  const fetchKB = async () => {
    try {
      const res = await fetch('/api/knowledge-base');
      if (res.ok) {
        const data = await res.json();
        setKnowledge(data.knowledge);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A]">Knowledge Base</h1>
            <p className="text-[#64748B] mt-2">Approved & Published knowledge used by AI Chatbot (RAG)</p>
          </div>
          
          <div className="space-y-3">
            {knowledge.map(k => (
              <div key={k.id} className="bg-white rounded-lg border border-[#EADFCB] p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{k.title}</h3>
                    <p className="text-sm text-[#64748B]">{k.category} • Client: {k.client_id} • v{k.version}</p>
                  </div>
                  <div className="flex gap-2">
                    {k.approved && <Badge className="bg-green-100 text-green-800">Approved</Badge>}
                    {k.published && <Badge className="bg-blue-100 text-blue-800">Published</Badge>}
                  </div>
                </div>
                <p className="text-sm mt-3 line-clamp-3 text-[#0F172A]">{k.content}</p>
              </div>
            ))}
            {knowledge.length === 0 && <p className="text-[#64748B]">No knowledge records yet</p>}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
