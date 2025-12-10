import React from "react";
// IMPORT YOUR LIB FUNCTION HERE
import { formatTime } from "../../../src/lib/formatTime";

// Helper function to convert duration number to readable label
const getDurationLabel = (duration: any): string => {
  if (!duration) return '';
  
  // If it's already a string with text (e.g., "3 days", "1 month"), return as is
  if (typeof duration === 'string' && isNaN(Number(duration))) {
    return duration;
  }
  
  // Convert to number
  const days = parseInt(duration);
  
  // Duration mapping (matching PrescriptionFormModal options)
  const durationMap: Record<number, string> = {
    3: '3 days',
    5: '5 days',
    7: '1 week',
    14: '2 weeks',
    21: '3 weeks',
    30: '1 month',
    60: '2 months',
    90: '3 months',
    180: '6 months',
    365: 'Ongoing',
  };
  
  return durationMap[days] || `${days} days`;
};

// [FIREBASE - BACKEND] DATA STRUCTURE EXPECTATION
// The 'data' prop passed to this modal must match the following Firestore Document structure:
// Collection: "prescriptions"
// Document Fields:
// - patientName: string (or fetched via patientId reference)
// - medicines: Array of Objects [
//      {
//          name: string,
//          type: string (e.g., "Tablet", "Syrup"),
//          dose: string (e.g., "500mg"),
//          freq: string (e.g., "1-0-1"),
//          time: Timestamp (converted to string via formatTime lib),
//          duration: string (e.g., "7 days"),
//          notes: string (optional)
//      }
//   ]
export default function PrescriptionViewerModal({ isOpen, onClose, data }: any) {
  if (!isOpen || !data) return null;

  // Handle different data structures
  const patientName = data.patientName || 'Patient';
  const medicines = Array.isArray(data.medicines) ? data.medicines : [];

  // Normalize medicine fields to handle both web and Flutter field names
  const normalizedMedicines = medicines.map((med: any) => ({
    name: med.name || med.medicineName || 'Medicine',
    type: med.type || 'Tablet',
    dose: med.dose || med.dosage || '',
    freq: med.freq || med.frequency || '',
    time: med.time || '',
    duration: med.duration || '',
    notes: med.notes || med.remarks || '',
  }));

  // If no medicines, show empty state
  if (normalizedMedicines.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose}></div>
        
        {/* Modal Container */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          
          {/* Header with Teal Brand Color */}
          <div className="flex items-center justify-between px-6 py-5 bg-[#006A71] text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
              </div>
              <div className="flex flex-col">
                  <h2 className="text-xl font-bold leading-none">Prescription</h2>
                  <p className="text-teal-100 text-xs uppercase tracking-wide opacity-90 mt-1">Medical Advice</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400">No medicines prescribed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header with Teal Brand Color */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#006A71] text-white">
          <div className="flex items-center gap-3">
            {/* Prescription Icon */}
            <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            </div>
            {/* Text Container - Adjusted for better vertical alignment */}
            <div className="flex flex-col">
                <h2 className="text-xl font-bold leading-none">Prescription</h2>
                <p className="text-teal-100 text-xs uppercase tracking-wide opacity-90 mt-1">Medical Advice</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
            
            {/* Patient Info Section */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</label>
                <p className="text-xl font-bold text-gray-800">{patientName}</p>
            </div>

            <div className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Medications Prescribed</h3>
                
                {normalizedMedicines.map((med: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        
                        {/* Top Row: Name and Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-[#E0F2F1] text-[#006A71] font-bold rounded-full text-sm">
                                    {index + 1}
                                </span>
                                <p className="text-lg font-bold text-gray-900">{med.name || 'Medicine'}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {med.type && (
                                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                      {med.type}
                                  </span>
                                )}
                                {med.dose && (
                                  <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                                      {med.dosage}
                                  </span>
                                )}
                            </div>
                        </div>

                        {/* Middle Row: Instructions Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                            
                            {/* Frequency */}
                            {med.freq && (
                              <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <div>
                                      <p className="text-xs text-gray-400 font-medium">Frequency</p>
                                      <p className="text-sm font-semibold text-gray-700">{med.freq}</p>
                                  </div>
                              </div>
                            )}

                            {/* Time */}
                            {med.time && (
                              <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <div>
                                      <p className="text-xs text-gray-400 font-medium">Time</p>
                                      <p className="text-sm font-semibold text-gray-700">{formatTime(med.time)}</p>
                                  </div>
                              </div>
                            )}

                            {/* Duration */}
                            {med.duration && (
                              <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  <div>
                                      <p className="text-xs text-gray-400 font-medium">Duration</p>
                                      <p className="text-sm font-semibold text-gray-700">{getDurationLabel(med.duration)}</p>
                                  </div>
                              </div>
                            )}
                        </div>

                        {/* Bottom Row: Notes (Conditional) */}
                        {med.notes && (
                            <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-2">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <p className="text-xs text-yellow-700 font-bold uppercase mb-0.5">Doctor's Note</p>
                                    <p className="text-sm text-yellow-800 italic">{med.notes}</p>
                                </div>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white text-center">
            <p className="text-xs text-gray-400">Please follow the prescribed dosage strictly.</p>
        </div>

      </div>
    </div>
  );
}