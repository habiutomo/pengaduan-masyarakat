import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertComplaintSchema } from "@shared/schema";
import { NIK_REGEX, PHONE_REGEX, apiRequest } from "@/lib/utils";

const formSchema = insertComplaintSchema.extend({
  files: z.array(z.instanceof(File)).min(1, "Bukti pendukung harus dilampirkan"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Anda harus menyetujui syarat dan ketentuan",
  }),
  nik: z.string().refine((val) => NIK_REGEX.test(val), {
    message: "NIK harus 16 digit angka",
  }),
  phone: z.string().refine((val) => PHONE_REGEX.test(val), {
    message: "Format nomor telepon tidak valid (contoh: 081234567890)",
  }),
  email: z.string().email("Format email tidak valid"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateComplaint() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      categoryId: undefined,
      name: "",
      nik: "",
      email: "",
      phone: "",
      address: "",
      files: [],
      terms: false,
    },
  });
  
  const createComplaintMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Create form data for file upload
      const formData = new FormData();
      
      // Add complaint data
      formData.append("data", JSON.stringify({
        title: values.title,
        description: values.description,
        location: values.location,
        categoryId: values.categoryId,
        name: values.name,
        nik: values.nik,
        email: values.email,
        phone: values.phone,
        address: values.address,
      }));
      
      // Add files
      values.files.forEach((file) => {
        formData.append("files", file);
      });
      
      const response = await fetch("/api/complaints", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengirim pengaduan");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pengaduan Berhasil Dikirim",
        description: `Token akses Anda: ${data.accessToken}. Simpan token ini untuk memeriksa status pengaduan Anda.`,
        variant: "default",
      });
      
      form.reset();
      navigate("/pengaduan-sukses?token=" + data.accessToken);
    },
    onError: (error) => {
      toast({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal mengirim pengaduan",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    createComplaintMutation.mutate(values);
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-primary">Buat Pengaduan Baru</h2>
            <p className="text-neutral-dark">Sampaikan pengaduan Anda dengan lengkap dan jelas</p>
          </div>
          
          <Card className="bg-white rounded-lg shadow-md">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="border-b border-neutral-medium pb-6">
                    <h3 className="text-lg font-medium text-primary mb-4">Data Diri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nik"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>NIK</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="16 digit NIK" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Contoh: 5171xxxxxxxxxx
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Nama Lengkap</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nama lengkap sesuai KTP" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="email@contoh.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Nomor Telepon</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="08xxxxxxxxxx" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required>Alamat</FormLabel>
                              <FormControl>
                                <Textarea 
                                  rows={2}
                                  placeholder="Alamat lengkap" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Complaint Information */}
                  <div>
                    <h3 className="text-lg font-medium text-primary mb-4">Detail Pengaduan</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Kategori</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Infrastruktur</SelectItem>
                                <SelectItem value="2">Lingkungan</SelectItem>
                                <SelectItem value="3">Pelayanan Publik</SelectItem>
                                <SelectItem value="4">Kesehatan</SelectItem>
                                <SelectItem value="5">Pendidikan</SelectItem>
                                <SelectItem value="6">Lainnya</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Judul Pengaduan</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Judul singkat dan jelas" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>Deskripsi Pengaduan</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={4}
                                placeholder="Jelaskan detail permasalahan yang Anda alami..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lokasi Kejadian</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Alamat/lokasi kejadian" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FileUpload
                        control={form.control}
                        name="files"
                        label="Bukti Pendukung (Foto/Dokumen)"
                        description="PNG, JPG, PDF hingga 10MB (max 5 file)"
                        maxFiles={5}
                        maxSize={10}
                        accept="image/*, application/pdf"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Terms and Privacy */}
                  <div className="border-t border-neutral-medium pt-4">
                    <FormField
                      control={form.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Saya menyetujui <a href="#" className="text-primary">Syarat dan Ketentuan</a> serta <a href="#" className="text-primary">Kebijakan Privasi</a>
                            </FormLabel>
                            <FormDescription>
                              Data pribadi Anda akan dirahasiakan dan hanya digunakan untuk keperluan penanganan pengaduan.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createComplaintMutation.isPending}
                    >
                      {createComplaintMutation.isPending ? "Mengirim..." : "Kirim Pengaduan"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
