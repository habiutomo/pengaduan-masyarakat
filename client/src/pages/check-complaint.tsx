import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime, getStatusText } from "@/lib/utils";
import { checkComplaintSchema, complaintResponseSchema } from "@shared/schema";

type CheckFormValues = z.infer<typeof checkComplaintSchema>;
const responseSchema = z.object({ content: z.string() });
type ResponseFormValues = z.infer<typeof responseSchema>;

export default function CheckComplaint() {
  const { toast } = useToast();
  const [complaintData, setComplaintData] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Form for checking complaint status
  const checkForm = useForm<CheckFormValues>({
    resolver: zodResolver(checkComplaintSchema),
    defaultValues: {
      email: "",
      token: "",
    },
  });
  
  // Form for submitting a response
  const responseForm = useForm<ResponseFormValues>({
    resolver: zodResolver(z.object({ 
      content: z.string().min(5, "Tanggapan terlalu pendek").max(1000, "Tanggapan terlalu panjang") 
    })),
    defaultValues: {
      content: "",
    },
  });
  
  // Query to check complaint status
  const checkMutation = useMutation({
    mutationFn: async (data: CheckFormValues) => {
      const response = await fetch("/api/complaints/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Pengaduan tidak ditemukan");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setComplaintData(data);
      setShowDetail(true);
      
      // Prefetch attachments if available
      if (data.attachments && data.attachments.length) {
        data.attachments.forEach((attachment: any) => {
          const img = new Image();
          img.src = `/api/attachments/${attachment.filename}`;
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Pengaduan tidak ditemukan",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to add a response to the complaint
  const responseMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await fetch(`/api/complaints/${complaintData.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: complaintData.id,
          content: data.content,
          isFromAdmin: false,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengirim tanggapan");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tanggapan Terkirim",
        description: "Tanggapan Anda telah berhasil dikirim",
      });
      
      responseForm.reset();
      
      // Refetch complaint data to get updated responses
      refreshComplaint();
    },
    onError: (error) => {
      toast({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal mengirim tanggapan",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to close a complaint
  const closeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/complaints/${complaintData.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: checkForm.getValues("email"),
          token: checkForm.getValues("token"),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menutup pengaduan");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pengaduan Ditutup",
        description: "Pengaduan Anda telah berhasil ditutup",
      });
      
      // Refetch complaint data to get updated status
      refreshComplaint();
    },
    onError: (error) => {
      toast({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal menutup pengaduan",
        variant: "destructive",
      });
    },
  });
  
  const onCheckSubmit = (values: CheckFormValues) => {
    checkMutation.mutate(values);
  };
  
  const onResponseSubmit = (values: ResponseFormValues) => {
    responseMutation.mutate(values);
  };
  
  const handleCloseComplaint = () => {
    if (confirm("Apakah Anda yakin ingin menutup pengaduan ini?")) {
      closeMutation.mutate();
    }
  };
  
  const refreshComplaint = () => {
    checkMutation.mutate(checkForm.getValues());
  };
  
  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-primary">Cek Status Pengaduan</h2>
            <p className="text-neutral-dark">Masukkan kredensial untuk mengakses pengaduan Anda</p>
          </div>
          
          {/* Login Form */}
          {!showDetail && (
            <Card className="bg-white rounded-lg shadow-md max-w-md mx-auto">
              <CardContent className="p-6">
                <Form {...checkForm}>
                  <form onSubmit={checkForm.handleSubmit(onCheckSubmit)} className="space-y-4">
                    <FormField
                      control={checkForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email yang terdaftar"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={checkForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Token</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Token pengaduan"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Token dikirimkan ke email Anda saat pengaduan dibuat
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={checkMutation.isPending}
                      >
                        {checkMutation.isPending ? "Memeriksa..." : "Cek Pengaduan"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Complaint Detail */}
          {showDetail && complaintData && (
            <div className="mt-8">
              <Card className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-primary text-white p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{complaintData.title}</h3>
                    <Badge 
                      variant={complaintData.status === "resolved" ? "success" : "warning"}
                      className="px-2 py-1 rounded-md text-sm font-medium"
                    >
                      {getStatusText(complaintData.status)}
                    </Badge>
                  </div>
                  <div className="text-sm mt-1">
                    <span>ID: {complaintData.trackingId}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(complaintData.createdAt)}</span>
                  </div>
                </div>
                
                {/* Content */}
                <CardContent className="p-4">
                  {/* Complaint Details */}
                  <div className="mb-4">
                    <h4 className="font-medium text-primary mb-2">Detail Pengaduan</h4>
                    <div className="bg-neutral-light p-3 rounded">
                      <p className="text-neutral-dark">{complaintData.description}</p>
                      
                      {/* Attachments */}
                      {complaintData.attachments && complaintData.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-neutral-dark mb-1">Lampiran:</p>
                          <div className="flex flex-wrap gap-2">
                            {complaintData.attachments.map((attachment: any) => (
                              <a 
                                key={attachment.id}
                                href={`/api/attachments/${attachment.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-primary text-sm"
                              >
                                {attachment.mimeType.includes('pdf') ? (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    {attachment.originalName}
                                  </>
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
                  
                  {/* Conversation Thread */}
                  <div className="border-t border-neutral-medium pt-4">
                    <h4 className="font-medium text-primary mb-2">Tanggapan</h4>
                    
                    {complaintData.responses && complaintData.responses.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {complaintData.responses.map((response: any) => (
                          <div key={response.id} className="bg-neutral-light p-3 rounded-lg">
                            <div className="flex items-start">
                              <div className={`${response.isFromAdmin ? 'bg-secondary text-white' : 'bg-accent text-primary'} p-2 rounded-full mr-3`}>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
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
                      <div className="text-neutral-dark mb-4 italic">Belum ada tanggapan</div>
                    )}
                    
                    {/* Reply Form */}
                    {complaintData.status !== "resolved" && (
                      <div className="mt-4">
                        <Form {...responseForm}>
                          <form onSubmit={responseForm.handleSubmit(onResponseSubmit)}>
                            <FormField
                              control={responseForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tambahkan Tanggapan</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={3}
                                      placeholder="Tulis tanggapan Anda..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-between mt-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseComplaint}
                                className="border-green-500 text-green-500 hover:bg-green-50"
                                disabled={closeMutation.isPending}
                              >
                                {closeMutation.isPending ? "Menutup..." : "Tutup Pengaduan"}
                              </Button>
                              <Button
                                type="submit"
                                disabled={responseMutation.isPending}
                              >
                                {responseMutation.isPending ? "Mengirim..." : "Kirim Tanggapan"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDetail(false)}
                >
                  Kembali ke Form
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
