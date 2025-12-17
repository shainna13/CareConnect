import React from "react";

// [FIREBASE - BACKEND] DATA STRUCTURE EXPECTATION
// The 'data' prop passed to this modal must match the following Firestore Document structure:
// Collection: "evaluations" (or "medical_records")
// Document Fields:
// - patientId: string (Reference to users collection)
// - patientName: string (Denormalized for easier read, or fetched via Join)
// - diagnosis: string (Main condition identified)
// - notes: string (Clinical details)
// - timestamp: Timestamp (Date of evaluation)
// - doctorId: string (Reference to doctor)
export default function EvaluationViewerModal({ isOpen, onClose, data }: any) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header with Teal Brand Color (Matches Prescription Viewer) */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#006A71] text-white">
          <div className="flex items-center gap-3">
            {/* Clipboard Icon */}
            <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-bold">Medical Evaluation</h2>
                <p className="text-teal-100 text-xs uppercase tracking-wide opacity-90">Patient Assessment</p>
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
          
          {/* Patient Info Section (Sticky) */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex justify-between items-center">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</label>
                {/* [FIREBASE - BACKEND] Field: patientName */}
                <p className="text-xl font-bold text-gray-800">{data.patientName || "N/A"}</p>
            </div>
            <div className="text-right">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
                {/* [FIREBASE - BACKEND] Field: timestamp */}
                {/* Currently using local date. Replace with: data.timestamp.toDate().toLocaleDateString() */}
                <p className="text-sm font-medium text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
             
             {/* Diagnosis Card */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-orange-50 px-5 py-3 border-b border-orange-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide">Diagnosis</h3>
                </div>
                <div className="p-5">
                    {/* [FIREBASE - BACKEND] Field: diagnosis */}
                    <p className="text-2xl font-semibold text-gray-800">
                        {data.diagnosis}
                    </p>
                </div>
             </div>

             {/* Clinical Notes Card */}
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Doctor's Clinical Notes</h3>
                </div>
                <div className="p-5 bg-gray-50/50">
                    {/* [FIREBASE - BACKEND] Field: notes */}
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {data.notes || "No additional notes provided."}
                    </p>
                </div>
             </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white text-center">
            <p className="text-xs text-gray-400">Confidential Medical Record</p>
        </div>

      </div>
    </div>
  );
}