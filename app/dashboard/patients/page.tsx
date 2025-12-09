'use client';

import React, { useState } from "react";

// 1. Define an Interface for type safety
// [FIREBASE - BACKEND] DATA MODEL
// Ensure the Firestore "patients" collection documents match this structure.
interface Patient {
    id: number; // or string if using Firestore auto-generated IDs
    name: string;
    age: number;
    gender: "Male" | "Female";
    condition: string;
    img: string | null; // [FIREBASE - BACKEND] This should be a Firebase Storage Download URL
    phone: string;
    email: string;
    address: string;
    lastVisit: string; // Store as Timestamp in DB, convert to string for frontend
    notes: string;
}

export default function PatientsPage() {
    // --- STATES ---
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isEditing, setIsEditing] = useState(false); 
    const [editFormData, setEditFormData] = useState<Patient | null>(null); 

    // [FIREBASE - BACKEND] READ OPERATION (FETCH PATIENTS)
    // 1. Replace this mock array with a `useEffect` that fetches the "patients" collection.
    // 2. Map the Firestore snapshot to this `patients` state.
    const [patients, setPatients] = useState<Patient[]>([
        {
            id: 1,
            name: "John Cruz",
            age: 34,
            gender: "Male",
            condition: "Atopic dermatitis",
            img: "/john.png", //Replace this with the profile image set by the patient.
            phone: "+1 (555) 123-4567",
            email: "john.cruz@example.com",
            address: "123 Maple Ave, Springfield",
            lastVisit: "Oct 24, 2025",
            notes: "Patient reports flare-ups during colder weather. Prescribed topical corticosteroids.",
        },
        {
            id: 2,
            name: "Maria Lopez",
            age: 28,
            gender: "Female",
            condition: "Acne vulgaris",
            img: null, //Replace this with the profile image set by the patient.
            phone: "+1 (555) 987-6543",
            email: "m.lopez@example.com",
            address: "45 Sunset Blvd, Miami",
            lastVisit: "Nov 02, 2025",
            notes: "Undergoing salicylic acid treatment. Shows 20% improvement.",
        },
        {
            id: 3,
            name: "Ana Reyes",
            age: 23,
            gender: "Female",
            condition: "Rosacea",
            img: null, //Replace this with the profile image set by the patient.
            phone: "+1 (555) 444-3333",
            email: "ana.r@example.com",
            address: "88 Highland Dr, Seattle",
            lastVisit: "Dec 10, 2025",
            notes: "Triggers include spicy food and stress. Recommended lifestyle changes.",
        },
        {
            id: 4,
            name: "Paul Tomas",
            age: 23,
            gender: "Male",
            condition: "Skin Allergy",
            img: null, //Replace this with the profile image set by the patient.
            phone: "+1 (555) 222-1111",
            email: "paul.t@example.com",
            address: "12 Ocean View, San Diego",
            lastVisit: "Dec 15, 2025",
            notes: "Allergic reaction to new laundry detergent. Prescribed antihistamines.",
        },
        {
            id: 5,
            name: "Carl Ramos",
            age: 46,
            gender: "Male",
            condition: "Hives",
            img: null, //Replace this with the profile image set by the patient.
            phone: "+1 (555) 666-7777",
            email: "carl.ramos@example.com",
            address: "555 Pine St, Austin",
            lastVisit: "Nov 20, 2025",
            notes: "Chronic hives lasting > 6 weeks. Ordered blood panel.",
        },
    ]);

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
            // [TODO] 1. Create a reference to the specific document: doc(db, "patients", editFormData.id)
            // [TODO] 2. Perform: await updateDoc(docRef, editFormData);
            
            // 3. Optimistic UI Update (Update local state immediately)
            setPatients(prev => prev.map(p => p.id === editFormData.id ? editFormData : p));
            setSelectedPatient(editFormData);
            
            // 4. Exit edit mode
            setIsEditing(false);
            
            console.log("Saving to Firebase:", editFormData); // Debug log
        } catch (error) {
            console.error("Error updating document:", error);
            // Handle error (e.g., show toast notification)
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
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {patients.map((p) => (
                    <div
                        key={p.id}
                        className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                        {p.img ? (
                            // [FIREBASE - BACKEND] Ensure 'p.img' is a valid URL
                            <img src={p.img} alt={p.name} className="w-24 h-24 rounded-full object-cover mb-3 bg-gray-100" />
                        ) : (
                            <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-full mb-3 flex items-center justify-center text-2xl font-bold">
                                {p.name.charAt(0)}
                            </div>
                        )}

                        <p className="font-semibold text-lg text-gray-900">{p.name}</p>

                        <div className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">{p.age} Years</span> •{" "}
                            <span>{p.gender}</span>
                        </div>

                        <span className="mt-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            {p.condition}
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

            {/* --- DETAILED PROFILE MODAL --- */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="bg-teal-600 p-6 text-white flex justify-between items-start shrink-0">
                            <div className="flex items-center gap-4 w-full">
                                {selectedPatient.img ? (
                                    <img src={selectedPatient.img} alt={selectedPatient.name} className="w-20 h-20 rounded-full border-4 border-white/30" />
                                ) : (
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                )}
                                
                                {/* CONDITIONAL RENDERING: EDIT MODE VS VIEW MODE IN HEADER */}
                                {isEditing && editFormData ? (
                                    <div className="flex-1 mr-8">
                                        {/* [FIREBASE - BACKEND] Editing Name */}
                                        <input 
                                            name="name" 
                                            value={editFormData.name} 
                                            onChange={handleInputChange} 
                                            className="w-full text-2xl font-bold bg-white/20 border border-white/30 rounded px-2 py-1 mb-1 text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
                                            placeholder="Name"
                                        />
                                        <div className="flex gap-2">
                                            {/* [FIREBASE - BACKEND] Editing Gender */}
                                            <select 
                                                name="gender" 
                                                value={editFormData.gender} 
                                                onChange={handleInputChange} 
                                                className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm text-white focus:outline-none [&>option]:text-black"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            {/* [FIREBASE - BACKEND] Editing Age */}
                                            <input 
                                                type="number" 
                                                name="age" 
                                                value={editFormData.age} 
                                                onChange={handleInputChange} 
                                                className="w-20 bg-white/20 border border-white/30 rounded px-2 py-1 text-sm text-white focus:outline-none" 
                                                placeholder="Age"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                                        <p className="opacity-90">{selectedPatient.gender}, {selectedPatient.age} Years Old</p>
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
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">📞</div>
                                            {isEditing && editFormData ? (
                                                <input 
                                                    name="phone" 
                                                    value={editFormData.phone} 
                                                    onChange={handleInputChange} 
                                                    className="w-full border border-gray-300 rounded px-2 py-1 focus:border-teal-500 focus:outline-none" 
                                                />
                                            ) : (
                                                selectedPatient.phone
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">✉️</div>
                                            {isEditing && editFormData ? (
                                                <input 
                                                    name="email" 
                                                    value={editFormData.email} 
                                                    onChange={handleInputChange} 
                                                    className="w-full border border-gray-300 rounded px-2 py-1 focus:border-teal-500 focus:outline-none" 
                                                />
                                            ) : (
                                                selectedPatient.email
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">📍</div>
                                            {isEditing && editFormData ? (
                                                <input 
                                                    name="address" 
                                                    value={editFormData.address} 
                                                    onChange={handleInputChange} 
                                                    className="w-full border border-gray-300 rounded px-2 py-1 focus:border-teal-500 focus:outline-none" 
                                                />
                                            ) : (
                                                selectedPatient.address
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Info */}
                                <div>
                                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Medical Details</h3>
                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                        <p className="text-xs text-orange-600 font-bold mb-1">PRIMARY CONDITION</p>
                                        {isEditing && editFormData ? (
                                            <input 
                                                name="condition" 
                                                value={editFormData.condition} 
                                                onChange={handleInputChange} 
                                                className="w-full border border-orange-200 rounded px-2 py-1 text-gray-800 font-semibold focus:border-orange-400 focus:outline-none" 
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-800">{selectedPatient.condition}</p>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-400 font-bold mb-1">LAST APPOINTMENT</p>
                                        {isEditing && editFormData ? (
                                            <input 
                                                name="lastVisit" 
                                                value={editFormData.lastVisit} 
                                                onChange={handleInputChange} 
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-teal-500 focus:outline-none" 
                                            />
                                        ) : (
                                            <p className="text-gray-700 font-medium">{selectedPatient.lastVisit}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Doctor's Notes</h3>
                                {isEditing && editFormData ? (
                                    <textarea 
                                        name="notes" 
                                        value={editFormData.notes} 
                                        onChange={handleInputChange} 
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-teal-500 focus:outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm leading-relaxed">
                                        {selectedPatient.notes}
                                    </p>
                                )}
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