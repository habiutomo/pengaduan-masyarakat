import React, { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AuthContext } from "@/contexts/auth-context";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Logo />
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/"
                  className={`${isActive("/") ? "text-primary-dark font-semibold" : "text-primary"} font-medium hover:text-primary-dark cursor-pointer`}
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link 
                  href="/buat-pengaduan"
                  className={`${isActive("/buat-pengaduan") ? "text-primary-dark font-semibold" : "text-primary"} font-medium hover:text-primary-dark cursor-pointer`}
                >
                  Buat Pengaduan
                </Link>
              </li>
              <li>
                <Link 
                  href="/cek-pengaduan"
                  className={`${isActive("/cek-pengaduan") ? "text-primary-dark font-semibold" : "text-primary"} font-medium hover:text-primary-dark cursor-pointer`}
                >
                  Cek Pengaduan
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                onClick={logout}
                className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white"
              >
                Keluar
              </Button>
            ) : (
              <Link 
                href="/admin/login" 
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition cursor-pointer"
              >
                Masuk Admin
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden text-primary p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/") ? "bg-primary text-white" : "text-primary hover:bg-primary hover:text-white"} cursor-pointer`}
              onClick={closeMenu}
            >
              Beranda
            </Link>
            <Link 
              href="/buat-pengaduan" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/buat-pengaduan") ? "bg-primary text-white" : "text-primary hover:bg-primary hover:text-white"} cursor-pointer`}
              onClick={closeMenu}
            >
              Buat Pengaduan
            </Link>
            <Link 
              href="/cek-pengaduan" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/cek-pengaduan") ? "bg-primary text-white" : "text-primary hover:bg-primary hover:text-white"} cursor-pointer`}
              onClick={closeMenu}
            >
              Cek Pengaduan
            </Link>
            {isAuthenticated ? (
              <button
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary hover:text-white"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Keluar
              </button>
            ) : (
              <Link 
                href="/admin/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary hover:text-white cursor-pointer"
                onClick={closeMenu}
              >
                Masuk Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
