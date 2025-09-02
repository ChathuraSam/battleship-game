"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
}

export const Button = ({ children, className = "", appName }: ButtonProps) => {
  const defaultClasses =
    "appearance-none rounded-full h-12 px-5 border border-gray-200 dark:border-gray-800 transition-all cursor-pointer flex items-center justify-center text-base font-medium bg-transparent min-w-[180px] hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <button
      className={`${defaultClasses} ${className}`}
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};
