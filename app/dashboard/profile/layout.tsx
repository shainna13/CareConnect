import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Profile | Care Connect",
    description: "Manage your doctor profile, update personal info, and set availability.",
  };
  
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
    {children}
    </div>
  );
}
