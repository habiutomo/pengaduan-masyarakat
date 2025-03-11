import React, { useContext, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Pagination } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusText, formatDate } from "@/lib/utils";
import { 
  Inbox, 
  Clock, 
  MessageSquare, 
  CheckCircle,
  Search,
  LogOut
} from "lucide-react";

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Get status filter based on active tab
  const getStatusFilter = () => {
    switch (activeTab) {
      case "pending":
        return "pending";
      case "inprogress":
        return "inprogress";
      case "resolved":
        return "resolved";
      default:
        return "all";
    }
  };
  
  // Fetch complaints with filters
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "/api/complaints/admin", 
      { 
        status: getStatusFilter(),
        category: categoryFilter,
        search: searchQuery,
        page: currentPage,
        limit: 10
      }
    ],
    queryFn: async ({ queryKey }) => {
      const [_, filters] = queryKey;
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: "10",
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });
      
      const response = await fetch(`/api/complaints/admin?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch complaints");
      return response.json();
    },
    enabled: isAuthenticated,
  });
  
  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/complaints/stats"],
    queryFn: async () => {
      const response = await fetch("/api/complaints/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: isAuthenticated,
  });
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleViewComplaint = (id: number) => {
    navigate(`/admin/complaints/${id}`);
  };
  
  // Status badge variant
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
  
  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }
  
  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex flex-wrap justify-between items-center">
            <div>
              <h2 className="text-2xl font-heading font-bold text-primary">Dashboard Admin</h2>
              <p className="text-neutral-dark">Kelola dan verifikasi pengaduan masyarakat</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary bg-opacity-10 text-primary mr-4">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-dark">Total Pengaduan</p>
                  <p className="text-2xl font-bold text-primary">
                    {statsData?.total || <Skeleton className="h-8 w-16" />}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-warning bg-opacity-10 text-warning mr-4">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-dark">Menunggu Verifikasi</p>
                  <p className="text-2xl font-bold text-warning">
                    {statsData?.pending || <Skeleton className="h-8 w-16" />}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-info bg-opacity-10 text-info mr-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-dark">Dalam Proses</p>
                  <p className="text-2xl font-bold text-info">
                    {statsData?.inprogress || <Skeleton className="h-8 w-16" />}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-success bg-opacity-10 text-success mr-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-dark">Selesai</p>
                  <p className="text-2xl font-bold text-success">
                    {statsData?.resolved || <Skeleton className="h-8 w-16" />}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b border-neutral-medium">
            <div className="flex flex-wrap -mb-px">
              <button 
                onClick={() => handleTabChange("all")} 
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-dark hover:text-primary hover:border-primary-light"
                }`}
              >
                Semua
              </button>
              <button 
                onClick={() => handleTabChange("pending")}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === "pending"
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-dark hover:text-primary hover:border-primary-light"
                }`}
              >
                Menunggu Verifikasi
              </button>
              <button 
                onClick={() => handleTabChange("inprogress")}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === "inprogress"
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-dark hover:text-primary hover:border-primary-light"
                }`}
              >
                Diproses
              </button>
              <button 
                onClick={() => handleTabChange("resolved")}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === "resolved"
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-dark hover:text-primary hover:border-primary-light"
                }`}
              >
                Selesai
              </button>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between mb-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-dark">Filter:</span>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px] border border-neutral-medium text-sm h-8">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="infrastruktur">Infrastruktur</SelectItem>
                  <SelectItem value="lingkungan">Lingkungan</SelectItem>
                  <SelectItem value="pelayanan">Pelayanan Publik</SelectItem>
                  <SelectItem value="kesehatan">Kesehatan</SelectItem>
                  <SelectItem value="pendidikan">Pendidikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-2 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-2 h-4 w-4 text-neutral-dark" />
                <Input
                  type="text"
                  placeholder="Cari pengaduan..."
                  className="pl-9 pr-4 py-1 w-full sm:w-64 border border-neutral-medium rounded h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Complaints Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-medium">
              <thead className="bg-neutral-light">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Pengadu</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Judul</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Kategori</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-medium">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-16" /></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-red-500">
                      Terjadi kesalahan: {error instanceof Error ? error.message : "Gagal memuat data"}
                    </td>
                  </tr>
                ) : data?.complaints?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-dark">
                      Tidak ada pengaduan yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  data?.complaints?.map((complaint: any) => (
                    <tr key={complaint.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                        {complaint.trackingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                        {formatDate(complaint.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                        {complaint.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                        {complaint.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="info" className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                          {complaint.categoryName || "Umum"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={getStatusVariant(complaint.status)}
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        >
                          {getStatusText(complaint.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="link" 
                          className="text-primary hover:text-primary-dark"
                          onClick={() => handleViewComplaint(complaint.id)}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {data?.pagination && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-neutral-dark">
                Menampilkan <span className="font-medium">{data.pagination.from}-{data.pagination.to}</span> dari <span className="font-medium">{data.pagination.total}</span> pengaduan
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
