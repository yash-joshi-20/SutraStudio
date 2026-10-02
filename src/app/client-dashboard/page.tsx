"use client";

import React, { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface ClientSubmissionItem {
  id: string;
  version?: number | string;
  created_at?: string;
  status: string;
  changes_requested_message?: string;
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ClientSubmissionItem[]>([]);
  
  const fetchSubmissions = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/submissions?client_id=${user?.uid || 'client_001'}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'CHANGES_REQUESTED': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen bg-[#F8F5EF] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Client Dashboard</h1>
              <p className="text-[#64748B] mt-2">Manage your submissions and chatbot preview</p>
            </div>
            <Link href="/client-form">
              <Button variant="primary">New Submission</Button>
            </Link>
          </div>
          
          <div className="grid gap-4">
            {submissions.map(s => (
              <div key={s.id} className="bg-white rounded-lg border border-[#EADFCB] p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Submission {s.id}</h3>
                    <p className="text-sm text-[#64748B]">Version {s.version} • {s.created_at}</p>
                  </div>
                  <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                </div>
                {s.changes_requested_message && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800"><strong>Changes Requested:</strong> {s.changes_requested_message}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Link href="/client-form"><Button size="sm" variant="outline">Edit</Button></Link>
                  <Button size="sm" variant="outline">Chatbot Preview</Button>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="bg-white rounded-lg border border-[#EADFCB] p-12 text-center">
                <p className="text-[#64748B]">No submissions yet. Create your first one!</p>
                <Link href="/client-form" className="mt-4 inline-block">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
