'use client';

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/src/lib/context/UserContext";
import { db } from "@/app/src/lib/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

// Interface for type safety
interface AppointmentRecord {
    id: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    bodyTemperature?: string;
    onsetSymptoms?: string;
    painLocation?: string;
    painIntensity?: string;
    currentMedication?: string;
    medicationPrescribe?: string;
    patientFeels?: string;
    approved?: string | boolean;
    timestamp?: number;
    message?: string;
}

interface Patient {
    id: string; // clientId
    name: string;
    email: string;
    mobileNo?: string;
    approved: string | boolean; // 'true' for approved
    firstApprovedDate?: number;
    lastAppointmentDate?: number;
    appointments: AppointmentRecord[]; // All appointments from this patient
}

export default function PatientsPage() {
    const { accountData } = useUser();
    
    // --- STATES ---
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isEditing, setIsEditing] = useState(false); 
    const [editFormData, setEditFormData] = useState<Patient | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [doctorId, setDoctorId] = useState<string>("");

    // --- FETCH PATIENTS FROM FIREBASE DIRECTLY ---
    useEffect(() => {
        const getDoctorId = () => {
            if (accountData?.id) {
                return accountData.id;
            }
            return localStorage.getItem('doctorId') || "";
        };

        const fetchPatients = async () => {
            try {
                setLoading(true);
                const id = getDoctorId();
                setDoctorId(id);

                if (!id) {
                    console.error("Doctor ID not found");
                    setLoading(false);
                    return;
                }

                // Direct Firestore query - fetch all accounts and their notes (appointments)
                const accountsRef = collection(db, "accounts");
                const accountsSnapshot = await getDocs(accountsRef);

                const patientMap = new Map<string, Patient>();

                // Iterate through each account to get their notes
                for (const accountDoc of accountsSnapshot.docs) {
                    const notesRef = collection(accountDoc.ref, "notes");
                    const notesSnapshot = await getDocs(notesRef);

                    const accountNotes = notesSnapshot.docs
                        .map((doc) => {
                            const data = doc.data() as any;
                            const timestamp = data.timestamp?.toMillis?.() || data.timestamp || Date.now();
                            return { id: doc.id, ...data, timestamp };
                        })
                        .filter((note) => note.assignedTo === id); // Filter by assigned doctor

                    // Group by patient (clientId)
                    accountNotes.forEach((note) => {
                        const clientId = note.clientId;

                        if (!patientMap.has(clientId)) {
                            patientMap.set(clientId, {
                                id: clientId,
                                name: note.clientName,
                                email: note.clientEmail,
                                mobileNo: note.clientMobileNo || '',
                                approved: 'false', // Default to false, will be set if any note is approved
                                firstApprovedDate: undefined,
                                lastAppointmentDate: note.timestamp,
                                appointments: [],
                            });
                        }

                        const patient = patientMap.get(clientId)!;
                        patient.appointments.push({
                            id: note.id,
                            clientId: note.clientId,
                            clientName: note.clientName,
                            clientEmail: note.clientEmail,
                            bodyTemperature: note.bodyTemperature,
                            onsetSymptoms: note.onsetSymptoms,
                            painLocation: note.painLocation,
                            painIntensity: note.painIntensity,
                            currentMedication: note.currentMedication,
                            medicationPrescribe: note.medicationPrescribe,
                            patientFeels: note.patientFeels,
                            approved: note.approved,
                            timestamp: note.timestamp,
                            message: note.message,
                        });

                        // Update last appointment date
                        if (!patient.lastAppointmentDate || note.timestamp > patient.lastAppointmentDate) {
                            patient.lastAppointmentDate = note.timestamp;
                        }

                        // Check if this note is approved - if so, mark patient as approved
                        if (note.approved === 'true' && patient.approved !== 'true') {
                            patient.approved = 'true';
                            if (!patient.firstApprovedDate) {
                                patient.firstApprovedDate = note.timestamp;
                            }
                        }
                    });
                }

                // Convert to array and filter - only show approved patients
                const approvedPatients = Array.from(patientMap.values())
                    .filter(patient => patient.approved === 'true');

                setPatients(approvedPatients);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patients:", error);
                setLoading(false);
            }
        };

        fetchPatients();
    }, [accountData?.id]);

    // --- HANDLERS ---

    const handleViewClick = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsEditing(false); 
    };

    const closeModal = () => {
        setSelectedPatient(null);
        setIsEditing(false);
        setEditFormData(null);
    };

    const handleEditClick = () => {
        setEditFormData(selectedPatient); 
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData(null);
    };

    // [FIREBASE - BACKEND] UPDATE OPERATION (SAVE CHANGES)
    const handleSave = async () => {
        if (!editFormData) return;

        try {
            // Note: Patient data is auto-generated from appointments
            // Edit functionality could save doctor's notes about the patient
            
            // Optimistic UI Update
            setPatients(prev => prev.map(p => p.id === editFormData.id ? editFormData : p));
            setSelectedPatient(editFormData);
            
            // Exit edit mode
            setIsEditing(false);
            
            console.log("Saving patient data:", editFormData);
        } catch (error) {
            console.error("Error updating patient:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editFormData) return;
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    return (
        <div className="p-6 relative min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Patients</h1>
            
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-gray-500">Loading patients...</p>
                    </div>
                </div>
            ) : patients.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-gray-500 text-lg">No approved patients yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Approve appointment requests to see patients here.</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {patients.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-full mb-3 flex items-center justify-center text-2xl font-bold">
                                    {p.name.charAt(0)}
                                </div>

                                <p className="font-semibold text-lg text-gray-900">{p.name}</p>

                                <div className="mt-1 text-sm text-gray-600">
                                    <span className="font-medium">{p.appointments.length}</span> {p.appointments.length === 1 ? 'appointment' : 'appointments'}
                                </div>

                                <span className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    Approved
                                </span>

                                <button 
                                    onClick={() => handleViewClick(p)}
                                    className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* --- DETAILED PROFILE MODAL --- */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="bg-teal-600 p-6 text-white flex justify-between items-start shrink-0">
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                
                                {/* CONDITIONAL RENDERING: EDIT MODE VS VIEW MODE IN HEADER */}
                                {isEditing && editFormData ? (
                                    <div className="flex-1 mr-8">
                                        {/* Editing Name */}
                                        <input 
                                            name="name" 
                                            value={editFormData.name} 
                                            onChange={handleInputChange} 
                                            className="w-full text-2xl font-bold bg-white/20 border border-white/30 rounded px-2 py-1 mb-1 text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
                                            placeholder="Name"
                                        />
                                        <p className="text-sm opacity-90">{editFormData.email}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                                        <p className="opacity-90">{selectedPatient.email}</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={closeModal} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body Content (Scrollable) */}
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Info */}
                                <div>
                                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Contact Information</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">✉️</div>
                                            {selectedPatient.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">📞</div>
                                            {selectedPatient.mobileNo || 'Not provided'}
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Stats */}
                                <div>
                                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Appointment History</h3>
                                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                                        <p className="text-xs text-teal-600 font-bold mb-1">TOTAL APPOINTMENTS</p>
                                        <p className="text-lg font-semibold text-gray-800">{selectedPatient.appointments.length}</p>
                                    </div>
                                    {selectedPatient.lastAppointmentDate && (
                                        <div className="mt-4">
                                            <p className="text-xs text-gray-400 font-bold mb-1">LAST APPOINTMENT</p>
                                            <p className="text-gray-700 font-medium">
                                                {new Date(selectedPatient.lastAppointmentDate).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Appointments List */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Medical Records</h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                    {selectedPatient.appointments.length > 0 ? (
                                        selectedPatient.appointments
                                            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                                            .map((appt, idx) => (
                                                <div key={appt.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="font-semibold text-gray-800">Appointment #{selectedPatient.appointments.length - idx}</p>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(appt.timestamp || 0).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        {appt.onsetSymptoms && <p><span className="font-medium">Symptoms:</span> {appt.onsetSymptoms}</p>}
                                                        {appt.painLocation && <p><span className="font-medium">Pain Location:</span> {appt.painLocation}</p>}
                                                        {appt.painIntensity && <p><span className="font-medium">Pain Intensity:</span> {appt.painIntensity}</p>}
                                                        {appt.bodyTemperature && <p><span className="font-medium">Temperature:</span> {appt.bodyTemperature}</p>}
                                                        {appt.currentMedication && <p><span className="font-medium">Current Medication:</span> {appt.currentMedication}</p>}
                                                        {appt.patientFeels && <p><span className="font-medium">Patient Feels:</span> {appt.patientFeels}</p>}
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No appointment records available.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t shrink-0">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={handleCancelEdit} 
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSave} 
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                                        Close
                                    </button>
                                    <button 
                                        onClick={handleEditClick} 
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Edit Patient
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}