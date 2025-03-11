import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ComplaintCard } from "@/components/complaint-card";
import { ComplaintFilter } from "@/components/complaint-filter";
import { Pagination } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch complaints with filters and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/complaints/public", filters, currentPage],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });
      
      const response = await fetch(`/api/complaints/public?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch complaints");
      return response.json();
    },
  });
  
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Welcome Banner */}
          <section className="mb-10 bg-gradient-to-br from-primary to-secondary rounded-lg text-white p-8 shadow-xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white"></div>
              <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-white"></div>
            </div>
            
            <div className="md:flex items-center justify-between relative z-10">
              <div className="md:w-2/3">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3 text-white">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-accent">Selamat Datang</span> di Portal Pengaduan Masyarakat
                </h2>
                <p className="mb-6 text-lg opacity-90">Sampaikan keluhan dan pengaduan Anda terkait layanan publik untuk Kabupaten Badung yang lebih baik.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="/buat-pengaduan" className="inline-block px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-accent hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Buat Pengaduan
                    </span>
                  </a>
                  <a href="/cek-pengaduan" className="inline-block px-6 py-3 bg-transparent text-white border-2 border-white font-medium rounded-md hover:bg-white hover:text-primary transition-all transform hover:-translate-y-1 hover:shadow-lg">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      Cek Status
                    </span>
                  </a>
                </div>
              </div>
              <div className="md:w-1/3 mt-8 md:mt-0 text-center">
                <div className="bg-white/20 p-5 rounded-full inline-block backdrop-blur-sm shadow-lg">
                  <svg 
                    className="h-32 w-32 md:h-40 md:w-40 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3V21M12 3L7 8M12 3L17 8M5 12H19M5 12C3.89543 12 3 11.1046 3 10V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V10C21 11.1046 20.1046 12 19 12M5 12C3.89543 12 3 12.8954 3 14V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V14C21 12.8954 20.1046 12 19 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>
          
          {/* Complaints Timeline */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-primary">Pengaduan Terbaru</h2>
              <p className="text-neutral-dark">Pengaduan masyarakat yang telah diverifikasi oleh admin</p>
            </div>
            
            {/* Filters */}
            <ComplaintFilter 
              onFilterChange={handleFilterChange} 
              className="mb-4"
            />
            
            {/* Complaints List */}
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden p-4">
                  <Skeleton className="h-7 w-3/4 mb-2" />
                  <div className="flex gap-2 mb-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-20 w-full mb-3" />
                </div>
              ))
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded-md">
                Terjadi kesalahan: {error instanceof Error ? error.message : "Tidak dapat memuat pengaduan"}
              </div>
            ) : data?.complaints?.length === 0 ? (
              <div className="bg-neutral-50 p-6 text-center rounded-lg">
                <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-neutral-900">Tidak ada pengaduan</h3>
                <p className="mt-1 text-neutral-500">Belum ada pengaduan yang diverifikasi.</p>
              </div>
            ) : (
              data?.complaints?.map((complaint: any) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  category={complaint.category || "Umum"}
                />
              ))
            )}
            
            {/* Pagination */}
            {data?.pagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
                className="mt-6"
              />
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
