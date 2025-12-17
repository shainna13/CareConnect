"use client";

import Link from "next/link";
import { useUser } from "../src/lib/context/UserContext";
import { useAppointments } from "../src/lib/hooks/useAppointments";
import { useState, useEffect } from "react";

// Interfaces
interface AppointmentData {
  id: string;
  clientName: string;
  doctorId: string;
  message?: string;
  approved?: string | boolean;
  status?: string;
  timestamp: number;
}

interface PendingRequest {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

export default function DashboardHome() {
  // [FIREBASE - BACKEND] USER CONTEXT
  const { accountData } = useUser();
  const { fetchAppointments } = useAppointments();

  // [FIREBASE - BACKEND] DASHBOARD STATISTICS
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [activePatients, setActivePatients] = useState<Set<string>>(new Set());

  // [FIREBASE - BACKEND] TODAY'S APPOINTMENTS
  const [todayAppointments, setTodayAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // [FIREBASE - BACKEND] PENDING REQUESTS
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  // Fetch appointments data directly from Firebase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get doctorId from accountData or localStorage
        const doctorId = accountData?.id || localStorage.getItem('doctorId') || "null";
        
        // Fetch all appointments for this doctor directly from Firebase
        const result = await fetchAppointments({ doctorId });
        
        if (result) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const appointments = result.map((appt: any) => {
            const appointmentData = appt.data;
            let timestamp = appointmentData.timestamp;
            if (timestamp && typeof timestamp === 'object' && 'toMillis' in timestamp) {
              timestamp = (timestamp as any).toMillis();
            } else if (!timestamp) {
              timestamp = Date.now();
            }
            
            return {
              id: appt.id,
              clientName: appointmentData.clientName,
              doctorId: appointmentData.doctorId,
              message: appointmentData.message,
              approved: appointmentData.approved,
              status: appointmentData.status,
              timestamp: timestamp,
              clientId: appointmentData.clientId,
            };
          });
          
          // Filter today's appointments
          const todayAppts = appointments.filter((appt: any) => {
            const apptDate = new Date(appt.timestamp);
            apptDate.setHours(0, 0, 0, 0);
            return apptDate.getTime() === today.getTime();
          }).sort((a: any, b: any) => a.timestamp - b.timestamp);
          
          // Filter pending requests
          const pending = appointments
            .filter((appt: any) => !appt.approved || appt.approved === 'false')
            .slice(0, 5)
            .map((appt: any) => ({
              id: appt.id,
              name: appt.clientName,
              message: "New appointment request",
              timestamp: formatTimeAgo(appt.timestamp),
            }));
          
          // Calculate unique patients
          const uniquePatients = new Set(appointments.map((appt: any) => appt.clientId));
          
          setTodayAppointments(todayAppts);
          setPendingRequests(pending);
          setTotalAppointments(appointments.length);
          setActivePatients(uniquePatients);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accountData?.id) {
      fetchDashboardData();
    }
  }, [accountData?.id, fetchAppointments]);

  // Helper function to format time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return "1w ago";
  };

  return (
    <div className="p-8 space-y-8 bg-[#CCE5E7] min-h-screen">
      
      {/* 1. Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center space-x-6">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
          {accountData?.photo ? (
            <img src={accountData.photo} alt="Profile" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-gray-400 text-sm">Photo</span>
          )}
        </div>
        <div>
            {/* [FIREBASE - BACKEND] Display User Name */}
            {/* Populated from accountData.name */}
          <h1 className="text-2xl font-bold !mb-0 text-[#006a71]">Dr. {accountData?.name || "User"}</h1>
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
            {totalAppointments} total
          </p>
        </div>

        {/* Active Patients Card */}
        <div className="bg-[#48A6A7] text-white rounded-2xl p-8 shadow-md flex flex-col justify-center h-40">
          <h2 className="text-xl font-medium">Active Patients</h2>
          <p className="mt-2 text-2xl font-normal">
            {activePatients.size} patients
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
                  <th className="pb-3 w-[30%] font-semibold">Approval</th>
                </tr>
              </thead>
              <tbody className="text-sm">
    {todayAppointments.map((appt) => (
      <tr key={appt.id} className="border-b border-gray-50 h-16 hover:bg-gray-50 transition-colors">
        <td className="pl-2 font-bold text-[#006a71]">{formatTime(appt.timestamp)}</td>
        <td className="font-semibold text-gray-800">{appt.clientName}</td>
        <td>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            appt.status === 'Rejected' 
              ? 'bg-red-100 text-red-600' 
              : appt.status === 'Confirmed' || appt.approved === 'true'
              ? 'bg-green-100 text-green-600'
              : 'bg-orange-100 text-orange-600'
          }`}>
            {appt.status === 'Rejected' ? 'Rejected' : appt.status === 'Confirmed' || appt.approved === 'true' ? 'Approved' : 'Pending'}
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