"use client";

import React, { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reviewMsg, setReviewMsg] = useState("");
  
  useEffect(() => {
    fetchSubmissions();
  }, []);
  
  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const review = async (submissionId: string, action: string) => {
    try {
      const res = await fetch('/api/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          action,
          message: reviewMsg,
          admin_id: 'admin_001',
        }),
      });
      if (res.ok) {
        setReviewMsg("");
        fetchSubmissions();
        alert(`${action} successful`);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'CHANGES_REQUESTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A]">Information Submissions</h1>
            <p className="text-[#64748B] mt-2">Review, approve, request changes, publish to Knowledge Base</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Submissions</h2>
              <div className="space-y-3">
                {submissions.map(s => (
                  <div key={s.id} 
                       className={`bg-white rounded-lg border p-4 cursor-pointer ${selected?.id === s.id ? 'border-[#D4A35A]' : 'border-[#EADFCB]'}`}
                       onClick={() => setSelected(s)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{s.id}</h3>
                        <p className="text-sm text-[#64748B]">Client: {s.client_id} • v{s.version}</p>
                      </div>
                      <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && <p className="text-[#64748B]">No submissions</p>}
              </div>
            </div>
            
            <div>
              {selected && (
                <div className="bg-white rounded-lg border border-[#EADFCB] p-6 sticky top-6">
                  <h2 className="text-lg font-semibold mb-4">Review: {selected.id}</h2>
                  <Badge className={getStatusColor(selected.status)}>{selected.status}</Badge>
                  
                  {selected.changes_requested_message && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">{selected.changes_requested_message}</p>
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-2">
                    <textarea
                      placeholder="Admin message (for request changes)"
                      value={reviewMsg}
                      onChange={(e) => setReviewMsg(e.target.value)}
                      className="w-full border border-[#EADFCB] rounded p-2 text-sm"
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => review(selected.id, 'approve')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => review(selected.id, 'request_changes')}>Request Changes</Button>
                      <Button size="sm" variant="outline" onClick={() => review(selected.id, 'reject')}>Reject</Button>
                      <Button size="sm" variant="primary" onClick={() => review(selected.id, 'publish')}>Approve & Publish</Button>
                      <Button size="sm" variant="outline" onClick={() => review(selected.id, 'unpublish')}>Unpublish</Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-xs space-y-2 max-h-96 overflow-y-auto">
                    {selected.company && <pre>{JSON.stringify(selected.company, null, 2)}</pre>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
