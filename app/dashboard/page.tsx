"use client";

import Link from "next/link";
import { useUser } from "../src/lib/context/UserContext";
import { useState } from "react";

// Interfaces
interface Appointment {
  id: number;
  time: string;
  name: string;
  status: 'Pending' | 'Confirmed';
}

interface PendingRequest {
  id: number;
  name: string;
  message: string;
  timestamp: string;
}

export default function DashboardHome() {
  // [FIREBASE - BACKEND] USER CONTEXT
  // Ensure 'accountData' pulls from the "users" collection in Firestore based on the authenticated UID.
  // We need 'accountData.name' and 'accountData.isProfileComplete' (boolean) for the UI below.
  const { accountData } = useUser();

  // [FIREBASE - BACKEND] DASHBOARD STATISTICS
  // 1. Fetch the total count of documents in the "patients" collection.
  // 2. Fetch the total count of documents in the "appointments" collection (filter: where date is in current month).
  // Current logic uses array.length; replace this with the actual count from Firestore.
  const allPatients: any[] = []; 
  const allAppointments: any[] = []; 

  // [FIREBASE - BACKEND] TODAY'S APPOINTMENTS
  // Query the "appointments" collection.
  // Filter: where 'date' == TODAY (e.g., ISO string or Timestamp).
  // Order: ascending by 'time'.
  // This state should be populated by a useEffect or real-time snapshot.
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]); 
  
  // [FIREBASE - BACKEND] PENDING REQUESTS
  // Query the "appointments" collection (or a separate "requests" collection).
  // Filter: where 'status' == 'pending' (or 'request').
  // Limit: 3-5 items for this preview card.
  // Note: The data below is currently HARDCODED. Replace with data fetched from Firestore.
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([
    { id: 1, name: "John Cruz", message: "New appointment", timestamp: "2 mins ago" },
    { id: 2, name: "Paul Tomas", message: "New appointment", timestamp: "3 hrs ago" },
    { id: 3, name: "Amy Dela", message: "Wants to reschedule", timestamp: "Yesterday" },
  ]);

  return (
    <div className="p-8 space-y-8 bg-[#CCE5E7] min-h-screen">
      
      {/* 1. Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center space-x-6">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div>
            {/* [FIREBASE - BACKEND] Display User Name */}
            {/* Populated from accountData.name */}
          <h1 className="text-2xl font-bold !mb-0 text-[#006a71]">Dr. {accountData?.name || "User"}</h1>
          <p className="text-orange-500 text-sm mb-3 font-medium">
            Your profile is incomplete. Complete it now to appear in patient search.
          </p>
          <Link href="/dashboard/profile" className="inline-block bg-[#006a71] hover:bg-[#005a61] text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors">
            Set Profile
          </Link>
        </div>
      </div>

      {/* 2. Stats Grid (Green Containers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Total Appointments Card */}
        <div className="bg-[#48A6A7] text-white rounded-2xl p-8 shadow-md flex flex-col justify-center h-40">
          <h2 className="text-xl font-medium">Total Appointments</h2>
          <p className="mt-2 text-2xl font-normal">
            {/* [FIREBASE - BACKEND] Display Monthly Count */}
            {allAppointments.length} this month
          </p>
        </div>

        {/* Active Patients Card */}
        <div className="bg-[#48A6A7] text-white rounded-2xl p-8 shadow-md flex flex-col justify-center h-40">
          <h2 className="text-xl font-medium">Active Patients</h2>
          <p className="mt-2 text-2xl font-normal">
            {/* [FIREBASE - BACKEND] Display Total Patient Count */}
            {allPatients.length} patients
          </p>
        </div>

      </div>

      {/* 3. Today's Appointments (Title INSIDE) */}
      <section className="bg-white rounded-2xl p-6 shadow-sm min-h-[200px] flex flex-col border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-[#006a71]">Today’s Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm font-semibold text-[#006a71] hover:underline">View All</Link>
        </div>

        {/* [FIREBASE - BACKEND] Render Today's List */}
        {/* Maps through 'todayAppointments' state fetched above */}
        {todayAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-gray-100">
                  <th className="pb-3 pl-2 w-[20%] font-semibold">Time</th>
                  <th className="pb-3 w-[50%] font-semibold">Patient</th>
                  <th className="pb-3 w-[30%] font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {todayAppointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-gray-50 h-16 hover:bg-gray-50 transition-colors">
                    <td className="pl-2 font-bold text-[#006a71]">{appt.time}</td>
                    <td className="font-semibold text-gray-800">{appt.name}</td>
                    <td>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-6">
            <span className="text-4xl mb-3 opacity-50">📆</span>
            <p className="text-base font-medium">There's no appointment yet for today.</p>
          </div>
        )}
      </section>

      {/* 4. Pending Requests (Title INSIDE) */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#006a71]">Pending Requests</h2>
            {pendingRequests.length > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                    {/* [FIREBASE - BACKEND] Display Pending Count */}
                    {pendingRequests.length} New
                </span>
            )}
        </div>

        {/* [FIREBASE - BACKEND] Render Pending List */}
        {/* Maps through 'pendingRequests' state fetched above */}
        {pendingRequests.length > 0 ? (
            <div className="space-y-4">
            {pendingRequests.map((req, i) => (
                <div key={i} className="bg-[#F8FAFC] border border-gray-100 p-4 rounded-xl flex justify-between items-center transition-all hover:bg-white hover:shadow-md cursor-default">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-800">{req.name}</p>
                            <span className="text-xs text-gray-400 font-medium">• {req.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600">{req.message}</p>
                    </div>
                    <Link href="/dashboard/appointments" className="text-[#006a71] font-bold text-sm hover:underline">
                        View
                    </Link>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-gray-500 text-sm">No pending requests.</p>
        )}
      </section>

    </div>
  );
}