import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface FilterProps {
  onFilterChange: (filters: {
    category: string;
    status: string;
    search: string;
  }) => void;
  className?: string;
}

export function ComplaintFilter({ onFilterChange, className = "" }: FilterProps) {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilterChange({
      category: value,
      status,
      search,
    });
  };
  
  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({
      category,
      status: value,
      search,
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onFilterChange({
      category,
      status,
      search: e.target.value,
    });
  };

  return (
    <div className={`flex flex-wrap items-center justify-between p-3 bg-white rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center space-x-2 flex-wrap gap-y-2">
        <span className="text-sm text-neutral-dark">Filter:</span>
        
        <Select value={category} onValueChange={handleCategoryChange}>
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
        
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] border border-neutral-medium text-sm h-8">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="verified">Diverifikasi</SelectItem>
            <SelectItem value="inprogress">Dalam Proses</SelectItem>
            <SelectItem value="resolved">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-2 sm:mt-0">
        <div className="relative">
          <Search className="absolute left-3 top-2 h-4 w-4 text-neutral-dark" />
          <Input
            type="text"
            placeholder="Cari pengaduan..."
            className="pl-9 pr-4 py-1 w-full sm:w-auto border border-neutral-medium rounded h-8"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  );
}
