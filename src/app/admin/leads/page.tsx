"use client";

import React, { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Badge } from "@/components/ui/Badge";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  
  useEffect(() => {
    fetchLeads();
  }, []);
  
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
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
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-[#64748B] mt-2">Manage leads from chatbot/contact/handoff</p>
          </div>
          <div className="space-y-3">
            {leads.map(l => (
              <div key={l.id} className="bg-white border border-[#EADFCB] rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{l.name}</h3>
                    <p className="text-sm text-[#64748B]">{l.email} {l.phone && `• ${l.phone}`}</p>
                    <p className="text-sm mt-2">{l.requirement}</p>
                  </div>
                  <Badge>{l.status}</Badge>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="text-[#64748B]">No leads yet</p>}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
