import React, { useState, useEffect } from "react";

export default function EvaluationFormModal({ isOpen, onClose, onSubmit, initialPatientName }: any) {
  // [FIREBASE - BACKEND] FORM STATE -> FIRESTORE FIELDS
  // These state variables map directly to the fields required in the "evaluations" collection.
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialPatientName) setPatientName(initialPatientName);
  }, [initialPatientName]);

  if (!isOpen) return null;

  // [FIREBASE - BACKEND] CREATE OPERATION (SUBMIT)
  // This function triggers the database write.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return alert("Please enter a patient name.");
    
    // 1. Prepare Payload for "evaluations" collection
    // const payload = {
    //   patientId: string
    //   patientName: patientName,
    //   diagnosis: diagnosis,
    //   notes: notes,
    //   createdAt: serverTimestamp(),
    //   doctorId: currentUser.uid
    // };

    // 2. Perform Write: await addDoc(collection(db, "evaluations"), payload);

    // 3. Send data back to parent (Optimistic UI update)
    onSubmit({ patientName, diagnosis, notes });
    
    // Reset
    setDiagnosis("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#006A71]">Create Evaluation</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            {/* [FIREBASE - BACKEND] Input: patientName */}
            <input 
              type="text" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71]" 
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            {/* [FIREBASE - BACKEND] Input: diagnosis */}
            <input 
              type="text" 
              value={diagnosis} 
              onChange={(e) => setDiagnosis(e.target.value)} 
              placeholder="e.g., Acute Migraine"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71]" 
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Notes</label>
            {/* [FIREBASE - BACKEND] Input: notes */}
            <textarea 
              rows={5}
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Enter detailed evaluation notes here..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71] resize-none" 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button type="submit" className="w-full bg-[#006A71] text-white py-3 rounded-lg font-semibold hover:bg-[#005257] transition">
            Send Evaluation
          </button>
        </div>
      </form>
    </div>
  );
}