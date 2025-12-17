'use client';

import React, { useState, useMemo, useEffect } from "react";
import Calendar from "react-calendar";
import { useAppointments } from "@/app/src/lib/hooks/useAppointments";
import { useSchedules } from "@/app/src/lib/hooks/useSchedules";
import { useUser } from "@/app/src/lib/context/UserContext";
import { ConfirmationDialog } from "@/app/src/components/ConfirmationDialog";
import { db } from "@/app/src/lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- INTERFACES ---
interface TimeSlot {
    time: string;
    status: 'available' | 'pending' | 'confirmed';
}

// Schedule TimeSlot - used for available hours management
interface ScheduleSlot {
    time: string;
    status: 'available' | 'booked';
}

// [FIREBASE - BACKEND] DATA MODEL
// Ensure the "appointments" collection documents match this structure.
// Note: 'dateKey' is used for querying (e.g., where("dateKey", "==", selectedDate)).
interface Appointment {
    id: string; // Firestore Document ID
    clientName: string;
    doctorId: string;
    clientId: string;
    clientEmail: string;
    dateKey?: string; // The date string (e.g., "Sat Dec 20 2025")
    time?: string;    // "08:30 AM"
    approved?: string | boolean; // 'true', 'false', or boolean
    status?: string; // 'Confirmed', 'Rejected', or 'Pending'
    message?: string; 
    timestamp?: number; 
    bodyTemperature?: string;
    onsetSymptoms?: string;
    painLocation?: string;
    painIntensity?: string;
    currentMedication?: string;
    medicationPrescribe?: string;
    patientFeels?: string;
}

// --- HELPER ---
const getDateKey = (date: Date) => date.toDateString();

// Helper to compare dates by year/month/day
const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

// --- FORMAT TIMESTAMP ---
const formatTimeAgo = (timestamp: number): string => {
    if (!timestamp) return "";
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return "1w ago";
};

export default function AppointmentsPage() {
    const { fetchAppointments, respondToAppointment, loading, error: apiError, subscribeToAppointments } = useAppointments();
    const { saveScheduleForDate, fetchScheduleForDate, bookTimeSlot, applyScheduleToMultipleDates } = useSchedules();
    const { accountData } = useUser(); // Get doctorId from UserContext
    const [date, setDate] = useState<Date>(new Date());
    const [doctorId, setDoctorId] = useState<string>("");
    
    // --- MASTER STATE ---
    // Fetch from Firebase Firestore using the API
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    // --- DERIVED STATES ---
    const pendingRequests = useMemo(() => {
        return appointments.filter(appt => !appt.approved || appt.approved === 'false');
    }, [appointments]);

    const currentDayAppointments = useMemo(() => {
        const filtered = appointments.filter(appt => {
            // Show appointment if booked date matches (for approved appointments)
            if (appt.dateKey && appt.approved === 'true') {
                if (appt.dateKey === getDateKey(date)) {
                    return true;
                }
            }
            
            // Show appointment if submission date matches (for all appointments)
            if (appt.timestamp) {
                const appointmentDate = new Date(appt.timestamp);
                if (isSameDay(appointmentDate, date)) {
                    return true;
                }
            }
            
            return false;
        });
        return filtered;
    }, [appointments, date]);

    // --- SET DOCTOR ID FROM USERCONTEXT OR LOCALSTORAGE ---
    useEffect(() => {
        if (accountData?.id) {
            // If UserContext has the ID, use it
            setDoctorId(accountData.id);
        } else {
            // Fallback to localStorage
            const storedDoctorId = localStorage.getItem('doctorId')||"no doctor assigned";
            setDoctorId(storedDoctorId);
        }
    }, [accountData?.id]); // Re-run when accountData changes

    // --- LOAD APPOINTMENTS ON MOUNT WITH REAL-TIME LISTENER ---
    useEffect(() => {
        if (!doctorId) {
            setLoadingAppointments(false);
            return;
        }
        
        setLoadingAppointments(true);

        // Subscribe to real-time appointment updates
        const unsubscribe = subscribeToAppointments(
            { doctorId },
            (result) => {
                // Transform the results
                const transformedAppointments = result.map((appt) => {
                  const appointmentData = appt.data;
                  // Handle both Firestore Timestamp and number
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
                    clientId: appointmentData.clientId,
                    clientEmail: appointmentData.clientEmail,
                    dateKey: appointmentData.dateKey || appointmentData.selectedDateKey || getDateKey(new Date(timestamp)),
                    time: appointmentData.time || appointmentData.selectedTimeSlot,
                    approved: appointmentData.approved,
                    status: appointmentData.status,
                    message: appointmentData.message,
                    timestamp: timestamp,
                    bodyTemperature: appointmentData.bodyTemperature,
                    onsetSymptoms: appointmentData.onsetSymptoms,
                    painLocation: appointmentData.painLocation,
                    painIntensity: appointmentData.painIntensity,
                    currentMedication: appointmentData.currentMedication,
                    medicationPrescribe: appointmentData.medicationPrescribe,
                    patientFeels: appointmentData.patientFeels,
                  };
                });
                
                setAppointments(transformedAppointments);
                setLoadingAppointments(false);
            },
            (error) => {
                console.error('Error subscribing to appointments:', error);
                setLoadingAppointments(false);
            }
        );

        // Cleanup subscription on unmount or when doctorId changes
        return () => unsubscribe();
    }, [doctorId, subscribeToAppointments]);


    // --- SCHEDULE STATES ---
    // [FIREBASE - BACKEND] READ OPERATION (AVAILABILITY)
    // Fetch schedules from Firestore collection: schedules/{doctorId}_{dateKey}
    // Structure: Document stores dateKey and slots array with status (available/booked)
    const [allSchedules, setAllSchedules] = useState<Record<string, ScheduleSlot[]>>({});
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    // Load schedules when doctor ID or date changes
    // Auto-refreshes every 30 seconds for real-time updates
    useEffect(() => {
        const loadSchedules = async () => {
            if (!doctorId) return;
            
            try {
                setLoadingSchedule(true);
                const dateKey = getDateKey(date);
                const slots = await fetchScheduleForDate(doctorId, dateKey);
                
                setAllSchedules(prev => ({
                    ...prev,
                    [dateKey]: slots as ScheduleSlot[]
                }));
            } catch (err) {
                console.error('Error loading schedule:', err);
            } finally {
                setLoadingSchedule(false);
            }
        };

        // Load immediately
        loadSchedules();
        
        // Auto-refresh every 30 seconds for real-time updates
        const refreshInterval = setInterval(loadSchedules, 30000);
        
        // Cleanup interval on unmount or when dependencies change
        return () => clearInterval(refreshInterval);
    }, [doctorId, date, fetchScheduleForDate]);

    // [FIREBASE - BACKEND] DEFAULT SETTINGS
    // Fetch user preferences for default daily slots (if 'Apply every day' logic is stored on server).
    const [defaultSchedule, setDefaultSchedule] = useState<ScheduleSlot[]>([]);

    // --- UI STATES ---
    const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
    const [isMainModalOpen, setIsMainModalOpen] = useState(false);
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [newTimeInput, setNewTimeInput] = useState("");
    const [selectedSlotData, setSelectedSlotData] = useState<{ slot: ScheduleSlot, index: number } | null>(null);
    const [tempSlots, setTempSlots] = useState<ScheduleSlot[]>([]);
    const [isApplyAllActive, setIsApplyAllActive] = useState(false);
    const [scheduleApplyType, setScheduleApplyType] = useState<'single' | 'week' | 'month' | 'everyday'>('single');
    const [rejectingItem, setRejectingItem] = useState<{ id: string, clientName: string } | null>(null);
    
    // --- SELECTED SCHEDULE SLOT FOR APPOINTMENT ---
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    
    // --- CONFIRMATION DIALOG STATES ---
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'accept' | 'reject' | null;
        appointmentId: string | null;
        clientName: string | null;
        clientId: string | null;
        appointmentTime?: string;
        appointmentDate?: string;
    }>({
        isOpen: false,
        type: null,
        appointmentId: null,
        clientName: null,
        clientId: null,
    });

    // --- CALENDAR HOVER TOOLTIP ---
    const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null);
    const [hoveredDateSchedule, setHoveredDateSchedule] = useState<ScheduleSlot[] | null>(null);

    // --- FORMATTERS ---
    const formattedDateHeader = date.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    const normalizeTime = (t: string) => {
        if (t.length === 7) return `0${t}`;
        return t;
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        const [hourStr, minStr] = timeStr.split(":");
        let hour = parseInt(hourStr);
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        hour = hour ? hour : 12; 
        let hString = hour.toString();
        if (hour < 10) hString = `0${hour}`;
        return `${hString}:${minStr} ${ampm}`;
    };

    // --- CALENDAR HOVER HANDLERS ---
    const handleDateHover = async (hoverDate: Date) => {
        if (!doctorId) return;
        
        const dateKey = getDateKey(hoverDate);
        setHoveredDateKey(dateKey);
        
        try {
            const schedule = await fetchScheduleForDate(doctorId, dateKey);
            setHoveredDateSchedule(schedule);
        } catch (err) {
            console.error('Error fetching schedule for hover:', err);
            setHoveredDateSchedule(null);
        }
    };

    const handleDateLeaveHover = () => {
        setHoveredDateKey(null);
        setHoveredDateSchedule(null);
    };

    // --- HANDLERS ---
    
    // [FIREBASE - BACKEND] UPDATE OPERATION (ACCEPT)
    // Show confirmation dialog before accepting
    const handleAcceptClick = (appointmentId: string, clientName: string, clientId: string, appointmentTime?: string, appointmentDate?: string) => {
        setConfirmDialog({
            isOpen: true,
            type: 'accept',
            appointmentId,
            clientName,
            clientId,
            appointmentTime,
            appointmentDate,
        });
    };

    const handleAcceptConfirm = async () => {
        if (!confirmDialog.appointmentId || !confirmDialog.clientId) return;
        
        const success = await respondToAppointment(
            confirmDialog.appointmentId,
            'accept',
            confirmDialog.clientId,
            undefined,
            selectedDateKey || undefined,
            selectedTimeSlot || undefined
        );
        
        if (success) {
            // Book the time slot using the doctor's selected date and time from the schedule modal
            if (selectedDateKey && selectedTimeSlot && doctorId) {
                try {
                    await bookTimeSlot(doctorId, selectedDateKey, selectedTimeSlot);
                    // Clear the selected slot after booking
                    setSelectedDateKey(null);
                    setSelectedTimeSlot(null);
                } catch (err) {
                    console.error('Error booking time slot:', err);
                }
            }

            // Create notification for patient
            try {
                const patientNotifRef = collection(db, 'accounts', confirmDialog.clientId, 'notifications');
                await addDoc(patientNotifRef, {
                    type: 'consultation_accepted',
                    appointmentId: confirmDialog.appointmentId,
                    message: `Doctor ${accountData?.name || 'accepted'} accepted your consultation request`,
                    details: `Scheduled for ${selectedDateKey || confirmDialog.appointmentDate || 'your selected date'} at ${selectedTimeSlot || confirmDialog.appointmentTime || 'your selected time'}`,
                    sender: doctorId,
                    doctorId: doctorId,
                    timestamp: serverTimestamp(),
                    isNew: true,
                });
            } catch (notifError) {
                console.warn('Could not create notification for patient, but appointment was accepted', notifError);
            }
            
            // Update local state optimistically with the doctor's selected date and time
            setAppointments(prev => prev.map(appt => {
                if (appt.id === confirmDialog.appointmentId) {
                    return {
                        ...appt,
                        approved: 'true',
                        status: 'Confirmed',
                        dateKey: selectedDateKey || appt.dateKey,
                        time: selectedTimeSlot || appt.time
                    };
                }
                return appt;
            }));
            if(expandedRequestId === confirmDialog.appointmentId) setExpandedRequestId(null);
        }
        
        setConfirmDialog({ isOpen: false, type: null, appointmentId: null, clientName: null, clientId: null });
    };

    const handleRejectClick = (appointmentId: string, clientName: string, clientId: string) => {
        setConfirmDialog({
            isOpen: true,
            type: 'reject',
            appointmentId,
            clientName,
            clientId,
        });
    };

    // [FIREBASE - BACKEND] UPDATE OPERATION (REJECT)
    // Call API to reject appointment in Firestore
    const handleRejectConfirm = async () => {
        if (!confirmDialog.appointmentId || !confirmDialog.clientId) return;
        
        const success = await respondToAppointment(
            confirmDialog.appointmentId,
            'reject',
            confirmDialog.clientId,
            'Doctor declined the consultation request'
        );
        
        if (success) {
            // Create notification for patient
            try {
                const patientNotifRef = collection(db, 'accounts', confirmDialog.clientId, 'notifications');
                await addDoc(patientNotifRef, {
                    type: 'consultation_rejected',
                    appointmentId: confirmDialog.appointmentId,
                    message: `Doctor ${accountData?.name || 'declined'} declined your consultation request`,
                    details: 'Please try scheduling with another doctor or a different time.',
                    sender: doctorId,
                    doctorId: doctorId,
                    timestamp: serverTimestamp(),
                    isNew: true,
                });
            } catch (notifError) {
                console.warn('Could not create notification for patient, but appointment was rejected', notifError);
            }

            // Update local state optimistically
            setAppointments(prev => prev.map(appt => 
                appt.id === confirmDialog.appointmentId ? { ...appt, approved: 'false', status: 'Rejected' } : appt
            ));
            
            // Clear expanded request if it's the one being rejected
            if(expandedRequestId === confirmDialog.appointmentId) setExpandedRequestId(null);
        }
        
        setConfirmDialog({ isOpen: false, type: null, appointmentId: null, clientName: null, clientId: null });
    };

    const handleOpenMainModal = () => {
        const key = getDateKey(date);
        // Only show schedules that were explicitly set for this date
        // Don't fall back to defaultSchedule - user must set it explicitly for each date/period
        const availableSlots = allSchedules[key] || [];
        
        // For schedule management, we only show schedule slots (not appointments)
        // Appointments are managed separately in the appointments page
        setTempSlots(availableSlots);
        setScheduleApplyType('single');
        setIsMainModalOpen(true);
    };

    // [FIREBASE - BACKEND] WRITE OPERATION (SAVE SCHEDULE)
    // This saves the "Available" slots for a specific day or multiple days.
    // Supports: Today, Week (7 days), Month (30 days), or Everyday (30 days)
    const handleSave = async () => {
        if (!doctorId) {
            console.error('Doctor ID not found');
            return;
        }

        if (tempSlots.length === 0) {
            console.error('No time slots to save');
            return;
        }

        try {
            let dateKeys: string[] = [];
            
            if (scheduleApplyType === 'everyday') {
                // Apply to next 30 days (daily)
                for (let i = 0; i < 30; i++) {
                    const futureDate = new Date(date);
                    futureDate.setDate(futureDate.getDate() + i);
                    dateKeys.push(getDateKey(futureDate));
                }
            } else if (scheduleApplyType === 'week') {
                // Apply to next 7 days (weekly)
                for (let i = 0; i < 7; i++) {
                    const futureDate = new Date(date);
                    futureDate.setDate(futureDate.getDate() + i);
                    dateKeys.push(getDateKey(futureDate));
                }
            } else if (scheduleApplyType === 'month') {
                // Apply to next 30 days (monthly)
                for (let i = 0; i < 30; i++) {
                    const futureDate = new Date(date);
                    futureDate.setDate(futureDate.getDate() + i);
                    dateKeys.push(getDateKey(futureDate));
                }
            } else {
                // Apply to single date only (today)
                dateKeys = [getDateKey(date)];
            }
            
            const doctorName = accountData?.name || 'Doctor';
            const doctorSpecialty = accountData?.specialty || '';
            
            if (dateKeys.length > 1) {
                // Save to multiple dates with doctor info and specialty
                const success = await applyScheduleToMultipleDates(doctorId, dateKeys, tempSlots, doctorName, doctorSpecialty);
                if (success) {
                    setDefaultSchedule(tempSlots);
                    // Update all schedules in state
                    const newSchedules: Record<string, ScheduleSlot[]> = {};
                    dateKeys.forEach(key => {
                        newSchedules[key] = tempSlots;
                    });
                    setAllSchedules(newSchedules);
                }
            } else {
                // Save for specific date only with doctor info and specialty
                const key = dateKeys[0];
                const success = await saveScheduleForDate(doctorId, key, tempSlots, doctorName, doctorSpecialty);
                if (success) {
                    setAllSchedules(prev => ({ ...prev, [key]: tempSlots }));
                }
            }
            setIsMainModalOpen(false);
            setTempSlots([]);
            setScheduleApplyType('single');
        } catch (err) {
            console.error('Error saving schedule:', err);
        }
    };

    const handleAddTime = () => {
        if (!newTimeInput) return;
        const formatted = formatTime(newTimeInput);
        setTempSlots(prev => [...prev, { time: formatted, status: 'available' }]);
        setNewTimeInput("");
        setIsAddPopupOpen(false);
    };

    const handleSlotClick = (slot: ScheduleSlot, index: number) => {
        setSelectedSlotData({ slot, index });
        // Also track the selected date and time for appointment booking
        setSelectedDateKey(getDateKey(date));
        setSelectedTimeSlot(slot.time);
    };

    const handleDeleteSlotConfirm = () => {
        if (!selectedSlotData) return;
        const newList = tempSlots.filter((_, i) => i !== selectedSlotData.index);
        setTempSlots(newList);
        setSelectedSlotData(null);
    };

    const toggleRequest = (id: string) => {
        setExpandedRequestId(expandedRequestId === id ? null : id);
    };


    return (
        <div className="p-6 relative">
             <style jsx global>{`
                /* 1. RESET */
                .react-calendar { width: 100% !important; background: white; border: none; font-family: inherit; height: 100%; display: flex; flex-direction: column; }
                .react-calendar__viewContainer { flex: 1; }
                .react-calendar__navigation { display: flex; height: 50px; margin-bottom: 0px; align-items: center; }
                .react-calendar__navigation button { min-width: 44px; background: none; font-size: 1.25rem; color: #006a71; font-weight: 700; }
                .react-calendar__navigation button:disabled { background-color: transparent; }
                .react-calendar__month-view__weekdays { text-align: center; font-weight: 600; font-size: 0.75rem; color: #1f2937; text-transform: uppercase; padding: 10px 0; }
                .react-calendar__month-view__weekdays__weekday { padding: 0.5rem; }
                .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; cursor: default; }
                .react-calendar__month-view__days { border-top: 1px solid #e5e7eb; flex: 1; }
                .react-calendar__tile { border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; background: white; min-height: 100px; height: auto; flex: 1; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; padding: 8px !important; font-size: 0.95rem; font-weight: 500; color: #374151; position: relative; }
                .react-calendar__tile abbr { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; margin-bottom: 5px; }
                .react-calendar__tile--now abbr { background-color: #E0F2F1; color: #006a71; }
                .react-calendar__tile--now { background: white; }
                .react-calendar__tile--active { background: #E0F2F1 !important; }
                .react-calendar__tile--active abbr { background-color: #006a71 !important; color: white !important; }
                .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #f9fafb; }
                .react-calendar__tile--active:enabled:hover { background-color: #d1eeee !important; }
                .react-calendar__month-view__days__day--neighboringMonth { color: #d1d5db; }
                
                .react-calendar__month-view__days { display: grid !important; grid-template-columns: repeat(7, 1fr) !important; border-top: 1px solid #e5e7eb; }
                .react-calendar__tile { border-right: 1px solid #e5e7eb !important; border-bottom: 1px solid #e5e7eb !important; min-height: 100px; }
                .react-calendar__month-view__days > .react-calendar__tile:nth-child(7n) { border-right: none !important; }
                .react-calendar__month-view__days > .react-calendar__tile:nth-last-child(-n + 7) { border-bottom: none !important; }
            `}</style>

            <h1 className="text-2xl text-[#006a71] font-semibold mb-6">Appointments</h1>

            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 items-stretch">
                
                {/* Calendar Section */}
                <div 
                    className="flex-1 bg-white rounded-xl p-6 shadow-sm flex flex-col relative"
                    onMouseLeave={handleDateLeaveHover}
                >
                    <Calendar
                        onChange={(value) => {
                            if (value instanceof Date) {
                                setDate(value);
                            }
                        }}
                        value={date}
                        locale="en-US"
                        className="flex-1"
                        prevLabel={<span className="text-2xl text-[#006a71] font-bold">‹</span>}
                        nextLabel={<span className="text-2xl text-[#006a71] font-bold">›</span>}
                        prev2Label={null} next2Label={null}
                        formatShortWeekday={(locale, date) => ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]}
                        tileContent={({ date, view }) => {
                            if (view !== 'month') return null;
                            
                            const hasAppointments = appointments.some(app => {
                                if (!app.timestamp) return false;
                                const appDate = new Date(app.timestamp);
                                return isSameDay(appDate, date);
                            });

                            return (
                                <div 
                                    className="mt-auto w-full flex justify-start pl-1"
                                    onMouseEnter={() => handleDateHover(date)}
                                >
                                    {hasAppointments && (
                                        <span className="block w-3 h-3 bg-orange-400 rounded-full"></span>
                                    )}
                                </div>
                            );
                        }}
                    />
                    
                    {/* Hover Tooltip - Show Booked Times */}
                    {hoveredDateSchedule && hoveredDateSchedule.length > 0 && (
                        <div className="absolute top-2 right-2 bg-white border border-[#006a71] rounded-lg shadow-lg p-3 z-50 w-48">
                            <p className="text-xs font-semibold text-[#006a71] mb-2">{hoveredDateKey}</p>
                            <div className="text-xs text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                                {hoveredDateSchedule.map((slot, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span>{slot.time}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                            slot.status === 'booked' 
                                                ? 'bg-red-100 text-red-700' 
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {slot.status === 'booked' ? 'Booked' : 'Available'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Right Side Column (Sidebar) */}
                <div className="w-full lg:w-96 flex flex-col">
                    <div className="bg-white rounded-xl p-6 shadow-sm mb-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Pending Requests</h2>
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">{pendingRequests.length} New</span>
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto flex-1">
                            {loadingAppointments ? (
                                <p className="text-sm text-gray-400 text-center py-4">Loading appointments...</p>
                            ) : apiError ? (
                                <p className="text-sm text-red-500 text-center py-4">Error: {apiError}</p>
                            ) : pendingRequests.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
                            ) : (
                                pendingRequests.map((req) => {
                                    const isExpanded = expandedRequestId === req.id;

                                    const reqTimestamp = req.timestamp || 1;
                                    const reqDateObj = new Date(reqTimestamp);
                                const reqDateStr = reqDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                const timeAgo = formatTimeAgo(reqTimestamp);

                                    return (
                                        <div key={req.id} className={`rounded-lg transition-all duration-200 border ${isExpanded ? 'bg-gray-50 border-gray-100' : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-sm'}`}>
                                        <div onClick={() => toggleRequest(req.id)} className="p-4 cursor-pointer flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="font-bold text-gray-900 text-[15px]">{req.clientName}</p>
                                                    {timeAgo && <span className="text-xs text-gray-400 font-normal">{timeAgo}</span>}
                                                </div>
                                                <p className="text-sm text-gray-500">{req.message || "Requesting appointment"}</p>
                                            </div>
                                            <button className="text-teal-700 mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                                <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
                                                    <p className="text-gray-500 text-sm mb-2">Patient Info</p>
                                                    <p className="text-gray-900 font-medium text-sm">Email: {req.clientEmail || 'N/A'}</p>
                                                    {req.bodyTemperature && <p className="text-gray-900 font-medium text-sm mt-1">Temperature: {req.bodyTemperature}°C</p>}
                                                    {req.onsetSymptoms && <p className="text-gray-900 font-medium text-sm mt-1">Symptoms: {req.onsetSymptoms}</p>}
                                                    {req.painLocation && <p className="text-gray-900 font-medium text-sm mt-1">Pain Location: {req.painLocation}</p>}
                                                    {req.currentMedication && <p className="text-gray-900 font-medium text-sm mt-1">Current Medication: {req.currentMedication}</p>}
                                                    <hr className="my-3" />
                                                    <p className="text-gray-500 text-sm">Date: <span className="text-gray-900 font-medium">{reqDateStr}</span></p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => handleAcceptClick(req.id, req.clientName, req.clientId, req.time, req.dateKey)}
                                                        disabled={loading}
                                                        className="flex-1 bg-[#48A6A7] text-white py-2 rounded-md text-sm font-medium hover:bg-[#3F9192] disabled:bg-gray-300 transition-colors"
                                                    >
                                                        {loading ? 'Processing...' : 'Accept'}
                                                    </button>

                                                    <button onClick={() => handleRejectClick(req.id, req.clientName, req.clientId)} disabled={loading} className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-md text-sm font-medium hover:bg-gray-300 disabled:bg-gray-200 transition-colors">Reject</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <button onClick={handleOpenMainModal} className="w-full bg-[#48A6A7] hover:bg-[#3F9192] text-white text-center py-4 rounded-xl font-semibold transition-colors shadow-sm text-lg">
                        Set Available Hour
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm min-h-[200px] flex flex-col">
               {currentDayAppointments && currentDayAppointments.length > 0 ? (
                   <>
                   <table className="w-full text-left table-fixed">
                       <thead>

                           <tr className="text-gray-500 text-sm border-b border-gray-300">
                               <th className="pb-2 pl-2 w-[15%]">Time</th>
                               <th className="pb-2 w-[25%]">Patient</th>
                               <th className="pb-2 w-[15%]">Status</th>
                               <th className="pb-2 w-[20%]">Booked Date & Time</th>
                               <th className="pb-2 w-[25%]">Action</th>
                           </tr>
                       </thead>
                       <tbody className="text-sm">
                           {currentDayAppointments && currentDayAppointments.length > 0 ? currentDayAppointments.map((appt) => {
                               const appTime = appt.timestamp ? new Date(appt.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                               const bookedDateStr = appt.dateKey || 'Not specified';
                               const bookedTimeStr = appt.time || 'Not specified';
                               return (
                               <tr key={appt.id} className="border-b border-gray-200 h-16 hover:bg-gray-50 transition-colors">
                                   <td className="pl-2 font-medium text-gray-700">{appTime}</td>
                                   <td className="flex items-center space-x-3 h-16"><div className="flex flex-col"><span className="font-medium text-gray-900">{appt.clientName || 'Unknown'}</span></div></td>
                                   <td><span className={`px-3 py-1 rounded-full text-xs font-medium ${appt.status === 'Rejected' ? "bg-red-100 text-red-600" : appt.status === 'Confirmed' || appt.approved === 'true' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>{appt.status === 'Rejected' ? 'Rejected' : appt.status === 'Confirmed' || appt.approved === 'true' ? 'Approved' : 'Pending'}</span></td>
                                   <td className="text-sm text-gray-700">
                                     {appt.approved === 'true' ? (
                                        <div className="flex flex-col">
                                            <span className="font-medium">{bookedDateStr}</span>
                                            <span className="text-xs text-gray-500">{bookedTimeStr}</span>
                                        </div>
                                    ) : appt.status === 'Rejected' ? (
                                        <span className="text-red-500 font-medium">Rejected</span>
                                    ) : (
                                        <span className="text-gray-400">Pending approval</span>
                                    )}
                                   </td>
                                   <td className="space-x-2">
                                       {appt.status !== 'Rejected' && appt.status !== 'Confirmed' && (!appt.approved || appt.approved === 'false') ? (
                                        <>
                                            <button 
                                                onClick={() => handleAcceptClick(appt.id, appt.clientName, appt.clientId, appt.time, appt.dateKey)}
                                                disabled={loading}
                                                className="px-4 py-1.5 bg-[#48A6A7] text-white rounded-lg text-xs hover:bg-[#3F9192] disabled:bg-gray-300 transition-colors"
                                            >
                                                {loading ? 'Processing...' : 'Accept'}
                                            </button>
                                            <button onClick={() => handleRejectClick(appt.id, appt.clientName, appt.clientId)} disabled={loading} className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 disabled:bg-gray-100 transition-colors">Reject</button>
                                        </>
                                    ) : (
                                        <div className="h-8"></div> 
                                    )}
                                   </td>
                               </tr>
                               );
                           }) : null}
                       </tbody>
                   </table>
                   </>
               ) : (
                   <div className="flex-1 flex items-center justify-center flex-col text-gray-400 py-10">
                       <span className="text-4xl mb-3 opacity-50">📆</span>
                       <p className="text-lg font-medium">There are no appointments on this day</p>
                   </div>
               )}
            </div>

            {/* MODAL 1: SET AVAILABLE HOUR */}
            {isMainModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-full p-8 relative min-h-[500px] flex flex-col">
                        <button onClick={() => setIsMainModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-light">✕</button>
                        <h2 className="text-3xl font-bold text-center text-[#006a71] mb-10">{formattedDateHeader}</h2>
                        <div className="flex-1 w-full flex flex-col">
                            <div className="flex-1 flex flex-wrap content-start gap-2 overflow-y-auto mb-6 border border-gray-200 rounded-xl p-2">
                                {tempSlots.map((slot, i) => {
                                    let slotClass = "w-32 py-3 rounded flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ";
                                    if (slot.status === 'booked') {
                                        slotClass += "bg-[#FE9056] text-white border border-orange-400";
                                    } else {
                                        slotClass += "bg-[#E2F0F1] text-gray-700 border border-[#CCCCCC]";
                                    }
                                    return (
                                        <div key={i} onClick={() => handleSlotClick(slot, i)} className={slotClass}>
                                            {slot.time}
                                        </div>
                                    );
                                })}
                                <button onClick={() => setIsAddPopupOpen(true)} className="w-32 py-3 rounded border-2 border-dashed border-[#006a71] text-[#006a71] font-bold text-xl hover:bg-teal-50 transition-colors flex items-center justify-center">+</button>
                            </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                            <div className="flex gap-3 flex-wrap">
                                <div className={`flex items-center space-x-2 cursor-pointer select-none px-3 py-2 rounded-lg transition-colors ${
                                    scheduleApplyType === 'single' ? 'bg-[#E0F2F1] text-[#006a71]' : 'text-gray-500 hover:bg-gray-100'
                                }`} onClick={() => setScheduleApplyType('single')}>
                                    <div className={`relative w-5 h-5 rounded border-2 transition-colors ${
                                        scheduleApplyType === 'single' ? 'border-[#006a71] bg-[#006a71]' : 'border-gray-300'
                                    }`}>
                                        {scheduleApplyType === 'single' && <span className="absolute inset-1 text-white flex items-center justify-center text-xs font-bold">✓</span>}
                                    </div>
                                    <span className="font-medium text-sm">Today</span>
                                </div>
                                
                                <div className={`flex items-center space-x-2 cursor-pointer select-none px-3 py-2 rounded-lg transition-colors ${
                                    scheduleApplyType === 'week' ? 'bg-[#E0F2F1] text-[#006a71]' : 'text-gray-500 hover:bg-gray-100'
                                }`} onClick={() => setScheduleApplyType('week')}>
                                    <div className={`relative w-5 h-5 rounded border-2 transition-colors ${
                                        scheduleApplyType === 'week' ? 'border-[#006a71] bg-[#006a71]' : 'border-gray-300'
                                    }`}>
                                        {scheduleApplyType === 'week' && <span className="absolute inset-1 text-white flex items-center justify-center text-xs font-bold">✓</span>}
                                    </div>
                                    <span className="font-medium text-sm">Week</span>
                                </div>
                                
                                <div className={`flex items-center space-x-2 cursor-pointer select-none px-3 py-2 rounded-lg transition-colors ${
                                    scheduleApplyType === 'month' ? 'bg-[#E0F2F1] text-[#006a71]' : 'text-gray-500 hover:bg-gray-100'
                                }`} onClick={() => setScheduleApplyType('month')}>
                                    <div className={`relative w-5 h-5 rounded border-2 transition-colors ${
                                        scheduleApplyType === 'month' ? 'border-[#006a71] bg-[#006a71]' : 'border-gray-300'
                                    }`}>
                                        {scheduleApplyType === 'month' && <span className="absolute inset-1 text-white flex items-center justify-center text-xs font-bold">✓</span>}
                                    </div>
                                    <span className="font-medium text-sm">Month</span>
                                </div>
                                
                                <div className={`flex items-center space-x-2 cursor-pointer select-none px-3 py-2 rounded-lg transition-colors ${
                                    scheduleApplyType === 'everyday' ? 'bg-[#E0F2F1] text-[#006a71]' : 'text-gray-500 hover:bg-gray-100'
                                }`} onClick={() => setScheduleApplyType('everyday')}>
                                    <div className={`relative w-5 h-5 rounded border-2 transition-colors ${
                                        scheduleApplyType === 'everyday' ? 'border-[#006a71] bg-[#006a71]' : 'border-gray-300'
                                    }`}>
                                        {scheduleApplyType === 'everyday' && <span className="absolute inset-1 text-white flex items-center justify-center text-xs font-bold">✓</span>}
                                    </div>
                                    <span className="font-medium text-sm">Everyday</span>
                                </div>
                            </div>
                            <button onClick={handleSave} className="px-10 py-3 bg-[#48A6A7] hover:bg-[#3F9192] text-white rounded-lg font-semibold shadow-sm transition-colors">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD TIME POPUP */}
            {isAddPopupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#48A6A7] px-6 py-4 flex justify-between items-center"><h3 className="text-white text-lg font-medium">Add Time</h3><button onClick={() => setIsAddPopupOpen(false)} className="text-white border border-white w-6 h-6 flex items-center justify-center rounded text-sm hover:bg-white hover:text-[#48A6A7]">✕</button></div>
                        <div className="p-6">
                            <h4 className="text-[#006a71] font-bold text-2xl mb-6">{formattedDateHeader}</h4>
                            <div className="relative mb-8"><input type="time" value={newTimeInput} onChange={(e) => setNewTimeInput(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-3 text-gray-700 text-lg focus:outline-none focus:border-[#48A6A7]" style={{ colorScheme: 'light' }} /></div>
                            <div className="flex justify-end"><button onClick={handleAddTime} className="px-8 py-2 bg-[#48A6A7] hover:bg-[#3e8e8f] text-white rounded-lg font-medium transition-colors text-lg">Add</button></div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: DELETE SLOT OVERLAY */}
            {selectedSlotData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-[2px]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="bg-white rounded-xl shadow-2xl w-[380px] overflow-hidden p-6 animate-in fade-in zoom-in duration-200 relative">
                        <button onClick={() => setSelectedSlotData(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                        <div className="text-center mb-6 mt-2"><h3 className="text-xl font-bold text-gray-800">Manage Time Slot</h3><p className="text-2xl font-bold text-[#006a71] mt-2">{selectedSlotData.slot.time}</p></div>
                        {selectedSlotData.slot.status !== 'available' ? (
                            <div className="flex flex-col items-center">
                                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded w-full mb-6 flex items-start">
                                    <div className="flex-shrink-0"><svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></div>
                                    <div className="ml-3"><p className="text-sm text-orange-700 font-medium">This slot is booked by a patient.</p></div>
                                </div>
                                <button onClick={() => setSelectedSlotData(null)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors">Go Back</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></div>
                                <p className="text-gray-600 text-center mb-6 leading-relaxed">Are you sure you want to remove this available time slot?</p>
                                <div className="flex space-x-3 w-full">
                                    <button onClick={() => setSelectedSlotData(null)} className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors">Cancel</button>
                                    <button onClick={handleDeleteSlotConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-sm transition-colors">Confirm Delete</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL 4: REJECT REQUEST WARNING */}
            {rejectingItem && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-[2px]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="bg-white rounded-xl shadow-2xl w-[550px] overflow-hidden p-6 animate-in fade-in zoom-in duration-200 relative">
                        <button onClick={() => { setRejectingItem(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Reject Request</h3>
                            <p className="text-gray-600 text-center mb-6 leading-relaxed text-[15px]">This will notify <span className="font-bold text-gray-900">{rejectingItem.clientName}</span> that their appointment cannot be confirmed and advise them to reschedule. <br/><br/>Confirm rejection?</p>
                            <div className="flex space-x-3 w-full">
                                <button onClick={() => { setRejectingItem(null); }} className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors">Cancel</button>
                                <button onClick={() => handleRejectConfirm()} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-semibold shadow-sm transition-colors" disabled={loading}>
                            {loading ? 'Processing...' : 'Yes, Reject'}
                        </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.type === 'accept' ? 'Confirm Accept' : 'Confirm Decline'}
                message={
                    confirmDialog.type === 'accept'
                        ? `Are you sure you want to accept ${confirmDialog.clientName}'s consultation request?`
                        : `Are you sure you want to decline ${confirmDialog.clientName}'s consultation request?`
                }
                confirmText={confirmDialog.type === 'accept' ? 'Accept' : 'Decline'}
                onConfirm={confirmDialog.type === 'accept' ? handleAcceptConfirm : handleRejectConfirm}
                onCancel={() => setConfirmDialog({ isOpen: false, type: null, appointmentId: null, clientName: null, clientId: null })}
                isLoading={loading}
            />
        </div>
    );
}