import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getStatusText, formatDate, formatDateTime } from "@/lib/utils";
import { User } from "lucide-react";

interface SuccessProps {
  token: string;
  email?: string;
}

export default function ComplaintSuccess() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  
  // Get email from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);
  
  // Fetch complaint details
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: [`/api/complaints/detail/${token}`],
    queryFn: async () => {
      const response = await fetch(`/api/complaints/detail/${token}${email ? `?email=${email}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch complaint");
      return response.json();
    },
    enabled: !!token,
  });
  
  // Handle input change for email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  // Check complaint details
  const handleCheckDetails = () => {
    if (!email) {
      toast({
        title: "Email Diperlukan",
        description: "Silakan masukkan email Anda untuk melihat detail pengaduan",
        variant: "destructive",
      });
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: [`/api/complaints/detail/${token}`] });
  };
  
  // Helper function to get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "verified":
      case "inprogress":
        return "info";
      case "resolved":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };
  
  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-primary">
              Detail Pengaduan
            </h2>
            <p className="text-neutral-dark">
              Informasi pengaduan dengan token: <span className="font-medium">{token}</span>
            </p>
          </div>
          
          {!complaint && !isLoading && (
            <Card className="bg-white rounded-lg shadow-md max-w-md mx-auto">
              <CardContent className="p-6">
                <p className="text-sm text-neutral-dark mb-4">
                  Untuk melihat detail pengaduan, silakan masukkan email yang terdaftar pada pengaduan ini:
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-neutral-medium rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Email yang terdaftar"
                    />
                  </div>
                  <Button
                    onClick={handleCheckDetails}
                    className="w-full"
                  >
                    Lihat Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
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
                onClick={() => navigate("/")}
              >
                Kembali ke Beranda
              </Button>
            </div>
          ) : complaint ? (
            <Card className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="bg-primary text-white p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{complaint.title}</h3>
                  <Badge 
                    variant={getStatusVariant(complaint.status)}
                    className="px-2 py-1 rounded-md text-sm font-medium"
                  >
                    {getStatusText(complaint.status)}
                  </Badge>
                </div>
                <div className="text-sm mt-1">
                  <span>ID: {complaint.trackingId}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(complaint.createdAt)}</span>
                </div>
              </div>
              
              {/* Content */}
              <CardContent className="p-4">
                {/* Complaint Details */}
                <div className="mb-4">
                  <h4 className="font-medium text-primary mb-2">Detail Pengaduan</h4>
                  <div className="bg-neutral-light p-3 rounded">
                    <p className="text-neutral-dark">{complaint.description}</p>
                    
                    {/* Attachments */}
                    {complaint.attachments && complaint.attachments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-neutral-dark mb-1">Lampiran:</p>
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
                                  alt="Bukti"
                                  className="h-16 w-auto rounded border"
                                />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status Information */}
                {complaint.status === "rejected" && complaint.rejectionReason && (
                  <div className="mb-4 bg-red-50 p-3 rounded border border-red-100">
                    <h4 className="font-medium text-destructive mb-1">Pengaduan Ditolak</h4>
                    <p className="text-neutral-dark">Alasan: {complaint.rejectionReason}</p>
                  </div>
                )}
                
                {/* Responses */}
                <div className="border-t border-neutral-medium pt-4">
                  <h4 className="font-medium text-primary mb-2">Tanggapan</h4>
                  
                  {complaint.responses && complaint.responses.length > 0 ? (
                    <div className="space-y-3">
                      {complaint.responses.map((response) => (
                        <div key={response.id} className="bg-neutral-light p-3 rounded-lg">
                          <div className="flex items-start">
                            <div className={`${response.isFromAdmin ? 'bg-secondary text-white' : 'bg-accent text-primary'} p-2 rounded-full mr-3`}>
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{response.isFromAdmin ? 'Admin' : 'Anda'}</p>
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
                
                {/* Call to action */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Kembali ke Beranda
                  </Button>
                  <Button
                    onClick={() => navigate("/cek-pengaduan")}
                  >
                    Cek Status & Tanggapi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
