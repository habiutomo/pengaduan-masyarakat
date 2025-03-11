import React from "react";
import { Link } from "wouter";
import { LogoImg } from "./LogoImg";

type LogoProps = {
  size?: "small" | "medium" | "large";
  showText?: boolean;
};

export function Logo({ size = "medium", showText = true }: LogoProps) {
  let imgSize: string;
  let textSize: string;
  
  switch (size) {
    case "small":
      imgSize = "h-8";
      textSize = "text-base";
      break;
    case "large":
      imgSize = "h-14";
      textSize = "text-2xl";
      break;
    default:
      imgSize = "h-12";
      textSize = "text-xl";
  }

  return (
    <Link href="/" className="flex items-center cursor-pointer">
      <div className="bg-white p-1 rounded flex items-center justify-center">
        <div className={imgSize}>
          <LogoImg />
        </div>
      </div>
      {showText && (
        <div className="ml-3">
          <h1 className={`${textSize} font-heading font-bold text-primary`}>
            Portal Pengaduan Masyarakat
          </h1>
          <p className="text-sm text-neutral-dark">Pemerintah Kabupaten Badung</p>
        </div>
      )}
    </Link>
  );
}
