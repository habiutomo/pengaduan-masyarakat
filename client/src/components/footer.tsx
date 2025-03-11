import React from "react";
import { Link } from "wouter";
import { Logo } from "@/components/logo";
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary to-primary-dark text-white mt-12 shadow-lg">
      {/* Wave pattern at the top */}
      <div className="h-10 bg-white overflow-hidden">
        <svg 
          viewBox="0 0 500 150" 
          preserveAspectRatio="none" 
          className="h-full w-full"
        >
          <path 
            d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
            className="fill-primary"
          ></path>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <Logo size="small" showText={false} />
              <div className="ml-3">
                <h2 className="text-lg font-heading font-bold text-white">Portal Pengaduan</h2>
                <p className="text-sm text-white/80">Pemerintah Kabupaten Badung</p>
              </div>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Platform resmi untuk menyampaikan pengaduan, keluhan, dan aspirasi masyarakat kepada Pemerintah Kabupaten Badung.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-bold mb-4 border-b border-white/20 pb-2">Links Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Beranda
                </Link>
              </li>
              <li>
                <Link 
                  href="/buat-pengaduan" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Buat Pengaduan
                </Link>
              </li>
              <li>
                <Link 
                  href="/cek-pengaduan" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Cek Pengaduan
                </Link>
              </li>
              <li>
                <Link 
                  href="/bantuan" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Bantuan
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-bold mb-4 border-b border-white/20 pb-2">Informasi</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/cara-pengaduan" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Cara Pengaduan
                </Link>
              </li>
              <li>
                <Link 
                  href="/kebijakan-privasi" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link 
                  href="/syarat-ketentuan" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-white/80 hover:text-white flex items-center cursor-pointer"
                >
                  <span className="bg-white/10 h-1.5 w-1.5 rounded-full mr-2"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-bold mb-4 border-b border-white/20 pb-2">Kontak Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-white/70" />
                <span className="text-white/80">Jl. Raya Sempidi, Mengwi, Badung, Bali</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-white/70" />
                <span className="text-white/80">(0361) 123456</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-white/70" />
                <span className="text-white/80">pengaduan@badungkab.go.id</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-white/70" />
                <span className="text-white/80">Senin - Jumat (08.00 - 16.00 WITA)</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/70 mb-4 md:mb-0">
            © {new Date().getFullYear()} Pemerintah Kabupaten Badung. Hak Cipta Dilindungi.
          </p>
          <div className="flex space-x-4 text-sm text-white/70">
            <Link 
              href="/kebijakan-privasi" 
              className="hover:text-white cursor-pointer"
            >
              Kebijakan Privasi
            </Link>
            <span>|</span>
            <Link 
              href="/syarat-ketentuan" 
              className="hover:text-white cursor-pointer"
            >
              Syarat & Ketentuan
            </Link>
            <span>|</span>
            <Link 
              href="/peta-situs" 
              className="hover:text-white cursor-pointer"
            >
              Peta Situs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
