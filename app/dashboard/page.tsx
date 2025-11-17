"use client";

import Link from "next/link";
import { useUser } from "../src/lib/context/UserContext";

export default function DashboardHome() {
  const { currentUser, loading, accountData } = useUser();

    return (
      <div className="p-6">
         {/* Profile Card */}
         <div className="bg-white rounded-xl p-6 shadow-sm flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
  
            <div>
              <h1 className="text-2xl font-semibold">Dr. {accountData?.name}</h1>
              <p className="text-orange-500 text-sm mt-1">
                Your profile is incomplete. Complete it now to appear in patient search.
              </p>
  
              <Link href="/dashboard/profile" className="mt-3 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm">
                Set Profile
              </Link>
            </div>
          </div>
  
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-teal-600 text-white rounded-xl p-5">
              <h2 className="text-lg font-semibold">Total Appointments</h2>
              <p className="mt-2 text-sm">0 this week</p>
            </div>
  
            <div className="bg-teal-600 text-white rounded-xl p-5">
              <h2 className="text-lg font-semibold">Active Patients</h2>
              <p className="mt-2 text-sm">0 patients</p>
            </div>
          </div>
  
          {/* Today's Appointments */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Today’s Appointments</h2>
            <p className="text-gray-500 mt-2">Don't have appointment yet for today.</p>
          </section>
  
          {/* Notifications (Inline for now) */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-gray-500 mt-2">Don't have appointment yet.</p>
          </section>
      </div>
    );
  }