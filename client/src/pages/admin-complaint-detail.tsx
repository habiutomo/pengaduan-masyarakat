import React, { useContext, useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/contexts/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime, getStatusText } from "@/lib/utils";
import { verifyComplaintSchema } from "@shared/schema";
import { ArrowLeft, User } from "lucide-react";

export default function AdminComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const complaintId = parseInt(id);
  const { isAuthenticated } = useContext(AuthContext);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [response, setResponse] = useState("");
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch complaint details
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: [`/api/complaints/admin/${complaintId}`],
    queryFn: async () => {
      const response = await fetch(`/api/complaints/admin/${complaintId}`);
      if (!response.ok) throw new Error("Failed to fetch complaint");
      return response.json();
    },
    enabled: isAuthenticated && !!complaintId,
  });
  
  // Approve complaint
  const approveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: complaintId,
        approved: true,
        response: response || undefined,
      };
      
      const res = await fetch(`/api/complaints/${complaintId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to approve complaint");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pengaduan Disetujui",
        description: "Pengaduan telah berhasil disetujui",
      });
      
      // Reset form and refetch data
      setResponse("");
      queryClient.invalidateQueries({ queryKey: [`/api/complaints/admin/${complaintId}`] });
    },
    onError: (error) => {
      toast({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal menyetujui pengaduan",
        variant: "destructive",
      });
    },
  });
  
  // Reject complaint
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: complaintId,
        approved: false,
        rejectionReason,
      };
      
      const res = await fetch(`/api/complaints/${complaintId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to reject complaint");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pengaduan Ditolak",
        description: "Pengaduan telah ditolak",
      });
      
      // Reset form and refetch data
      setRejectionReason("");
      setShowRejectForm(false);
      queryClient.invalidateQueries({ queryKey: [`/api/complaints/admin/${complaintId}`] });
    },
    onError: (error) => {
      toast({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal menolak pengaduan",
        variant: "destructive",
      });
    },
  });
  
  // Add response
  const respondMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/complaints/${complaintId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          content: response,
          isFromAdmin: true,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add response");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tanggapan Terkirim",
        description: "Tanggapan Anda telah berhasil dikirim",
      });
      
      // Reset form and refetch data
      setResponse("");
      queryClient.invalidateQueries({ queryKey: [`/api/complaints/admin/${complaintId}`] });
    },
    onError: (error) => {
      toast({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal mengirim tanggapan",
        variant: "destructive",
      });
    },
  });
  
  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast({
        title: "Alasan Diperlukan",
        description: "Harap berikan alasan penolakan",
        variant: "destructive",
      });
      return;
    }
    
    rejectMutation.mutate();
  };
  
  const handleApprove = () => {
    approveMutation.mutate();
  };
  
  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) {
      toast({
        title: "Tanggapan Diperlukan",
        description: "Harap berikan tanggapan",
        variant: "destructive",
      });
      return;
    }
    
    respondMutation.mutate();
  };
  
  // Helper function to get status badge color
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning";
      case "verified":
      case "inprogress":
        return "bg-info";
      case "resolved":
        return "bg-success";
      case "rejected":
        return "bg-destructive";
      default:
        return "bg-neutral-500";
    }
  };
  
  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }
  
  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="mr-2 text-primary hover:text-primary-dark"
                onClick={() => navigate("/admin/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-heading font-bold text-primary">Detail Pengaduan</h2>
            </div>
            <p className="text-neutral-dark">Verifikasi dan tanggapi pengaduan masyarakat</p>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-6 rounded-lg">
              <p>Terjadi kesalahan: {error instanceof Error ? error.message : "Tidak dapat memuat detail pengaduan"}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/admin/dashboard")}
              >
                Kembali ke Dashboard
              </Button>
            </div>
          ) : complaint ? (
            <Card className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Status Bar */}
              <div className={`${getStatusBgColor(complaint.status)} p-4 text-white`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{getStatusText(complaint.status)}</span>
                  {complaint.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white text-destructive hover:bg-neutral-100"
                        onClick={() => setShowRejectForm(true)}
                      >
                        Tolak
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white text-success hover:bg-neutral-100"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending ? "Menyetujui..." : "Setujui"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Reject Form */}
              {showRejectForm && (
                <div className="p-4 bg-neutral-light border-b border-neutral-medium">
                  <form onSubmit={handleReject}>
                    <label htmlFor="alasan-penolakan" className="block text-sm font-medium text-neutral-dark mb-1">
                      Alasan Penolakan <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      id="alasan-penolakan"
                      rows={2}
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Berikan alasan penolakan..."
                      className="w-full px-3 py-2 border border-neutral-medium rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRejectForm(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        type="submit"
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? "Menolak..." : "Konfirmasi Penolakan"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Content */}
              <CardContent className="p-6">
                {/* Complaint Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-primary">{complaint.title}</h3>
                  <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-neutral-dark mt-1">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(complaint.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {complaint.categoryName || "Umum"}
                    </span>
                    {complaint.location && (
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {complaint.location}
                      </span>
                    )}
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      ID: {complaint.trackingId}
                    </span>
                  </div>
                </div>
                
                {/* Reporter Info */}
                <div className="mb-6">
                  <h4 className="font-medium text-primary mb-2">Informasi Pelapor</h4>
                  <div className="bg-neutral-light p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-dark">Nama:</p>
                        <p className="font-medium">{complaint.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-dark">NIK:</p>
                        <p className="font-medium">{complaint.nik}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-dark">Email:</p>
                        <p className="font-medium">{complaint.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-dark">Telepon:</p>
                        <p className="font-medium">{complaint.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-neutral-dark">Alamat:</p>
                        <p className="font-medium">{complaint.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Complaint Detail */}
                <div className="mb-6">
                  <h4 className="font-medium text-primary mb-2">Detail Pengaduan</h4>
                  <div className="bg-neutral-light p-4 rounded-lg">
                    <p className="text-neutral-dark mb-4">{complaint.description}</p>
                    
                    {/* Attachments */}
                    {complaint.attachments && complaint.attachments.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-neutral-dark mb-2">Lampiran:</p>
                        <div className="flex flex-wrap gap-2">
                          {complaint.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={`/api/attachments/${attachment.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {attachment.mimeType.includes('pdf') ? (
                                <div className="flex items-center p-2 bg-white border rounded">
                                  <svg className="h-8 w-8 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm text-neutral-600">{attachment.originalName}</span>
                                </div>
                              ) : (
                                <img
                                  src={`/api/attachments/${attachment.filename}`}
                                  alt={`Bukti ${attachment.id}`}
                                  className="h-24 w-auto rounded border border-neutral-medium"
                                />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Conversation Thread */}
                <div className="mb-6">
                  <h4 className="font-medium text-primary mb-2">Tanggapan</h4>
                  
                  {/* Admin Response Form */}
                  {complaint.status !== "pending" && complaint.status !== "rejected" && (
                    <form onSubmit={handleRespond} className="mb-4">
                      <Textarea
                        id="admin-tanggapan"
                        rows={3}
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Tulis tanggapan untuk pengaduan ini..."
                        className="w-full px-3 py-2 border border-neutral-medium rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          type="submit"
                          disabled={respondMutation.isPending || !response.trim()}
                        >
                          {respondMutation.isPending ? "Mengirim..." : "Kirim Tanggapan"}
                        </Button>
                      </div>
                    </form>
                  )}
                  
                  {/* Rejection Reason (if rejected) */}
                  {complaint.status === "rejected" && complaint.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-lg mb-3">
                      <div className="flex items-start">
                        <div className="bg-destructive text-white p-2 rounded-full mr-3">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-destructive">Alasan Penolakan</p>
                          <p className="text-neutral-dark">{complaint.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Conversation History */}
                  {complaint.responses && complaint.responses.length > 0 ? (
                    <div className="space-y-3">
                      {complaint.responses.map((response) => (
                        <div key={response.id} className="bg-neutral-light p-3 rounded-lg">
                          <div className="flex items-start">
                            <div className={`${response.isFromAdmin ? 'bg-secondary text-white' : 'bg-accent text-primary'} p-2 rounded-full mr-3`}>
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{response.isFromAdmin ? 'Admin' : 'Pelapor'}</p>
                              <p className="text-neutral-dark">{response.content}</p>
                              <p className="text-xs text-neutral-dark mt-1">{formatDateTime(response.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-neutral-dark italic">Belum ada tanggapan</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-neutral-dark">
              Pengaduan tidak ditemukan
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
