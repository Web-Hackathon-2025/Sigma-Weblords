"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  variant?: "default" | "white";
}

export function Logo({ size = "md", showText = true, className = "", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const kSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {/* Stylish K Logo */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Gradient background with rounded corners */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl shadow-lg transform rotate-3 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md flex items-center justify-center">
          {/* Stylish K letter with custom styling */}
          <span 
            className={`${kSizeClasses[size]} font-black text-white drop-shadow-md`}
            style={{ 
              fontFamily: "'Poppins', 'Inter', sans-serif",
              letterSpacing: "-0.05em",
              textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
            }}
          >
            K
          </span>
          {/* Small accent dot */}
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/80 rounded-full" />
        </div>
      </div>
      
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold ${variant === "white" ? "text-white" : "text-gray-900 dark:text-white"}`}>
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Kari
          </span>
          <span className={variant === "white" ? "text-white" : "text-gray-900 dark:text-white"}>
            gar
          </span>
        </span>
      )}
    </Link>
  );
}

// Icon-only version for smaller spaces
export function LogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const kSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl shadow-lg transform rotate-3 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md flex items-center justify-center">
        <span 
          className={`${kSizeClasses[size]} font-black text-white drop-shadow-md`}
          style={{ 
            fontFamily: "'Poppins', 'Inter', sans-serif",
            letterSpacing: "-0.05em",
            textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
          }}
        >
          K
        </span>
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/80 rounded-full" />
      </div>
    </div>
  );
}

export default Logo;
