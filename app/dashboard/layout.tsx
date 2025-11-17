"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/dashboard/components/Sidebar";
import { useUser } from "../src/lib/context/UserContext";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, loading } = useUser();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/"); // redirect if no user
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="ml-56 flex-1 h-screen overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
