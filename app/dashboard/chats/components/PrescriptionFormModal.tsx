import React, { useState, useEffect } from "react";

export default function PrescriptionFormModal({ isOpen, onClose, onSubmit, initialPatientName }: any) {
  const [patientName, setPatientName] = useState("");
  
  // [FIREBASE - BACKEND] DATA SCHEMA (SUB-OBJECTS)
  // This object represents the structure of items inside the "medicines" array field in Firestore.
  // Ensure the backend/Firestore validation rules allow these specific fields (string types).
  const defaultMedicine = { 
    id: Date.now(), 
    name: "", 
    type: "Tablet", 
    dose: "", 
    freq: "Once daily", 
    time: "", 
    duration: "3 days", 
    notes: "" 
  };

  const [medicines, setMedicines] = useState([defaultMedicine]);

  // Set patient name if passed (optional, for convenience)
  useEffect(() => {
    if (initialPatientName) setPatientName(initialPatientName);
  }, [initialPatientName]);

  if (!isOpen) return null;

  const addMedicine = () => {
    setMedicines([...medicines, { ...defaultMedicine, id: Date.now() }]);
  };

  const removeMedicine = (id: number) => {
    setMedicines(medicines.filter((med) => med.id !== id));
  };

  const updateMedicine = (id: number, field: string, value: string) => {
    setMedicines(medicines.map((med) => (med.id === id ? { ...med, [field]: value } : med)));
  };

  // [FIREBASE - BACKEND] CREATE OPERATION (SUBMIT)
  // This function triggers the database write.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return alert("Please enter a patient name.");
    
    // 1. Prepare the Payload for Firestore "prescriptions" collection.
    // const payload = {
    // patientId: string
    //   patientName: patientName,
    //   medicines: medicines, // Contains array of 'defaultMedicine' structure
    //   createdAt: serverTimestamp(),
    //   doctorId: currentUser.uid,
    //   status: 'active'
    // }

    // 2. Perform Write: await addDoc(collection(db, "prescriptions"), payload);
    
    // 3. Trigger parent handler (currently handles local state updates)
    onSubmit({ patientName, medicines });
    
    // Reset and close
    setPatientName(""); 
    setMedicines([{ ...defaultMedicine, id: Date.now() }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <form onSubmit={handleSubmit} className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#006A71]">Add Prescription</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* Patient Info Section */}
          <div className="bg-[#E0F2F1] p-4 rounded-lg border border-[#B2DFDB]">
             <h3 className="text-[#006A71] font-semibold mb-2">Patient Information</h3>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {/* [FIREBASE - BACKEND] Input: Patient Name */}
                <input 
                  type="text" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)} 
                  className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71]" 
                  placeholder="Patient Name" 
                />
             </div>
          </div>

          {/* Medications Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Medications</h3>
            
            {medicines.map((med, index) => (
              <div key={med.id} className="p-4 border border-gray-200 rounded-lg space-y-4 mb-4 relative">
                
                {/* Medicine Header */}
                <div className="flex justify-between items-center">
                   <h4 className="font-semibold text-gray-800">Medicine {index + 1}</h4>
                   {medicines.length > 1 && (
                     <button type="button" onClick={() => removeMedicine(med.id)} className="text-red-500 text-sm hover:underline">
                       Remove
                     </button>
                   )}
                </div>

                {/* Medicine Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Medicine Name</label>
                  <input 
                    type="text" 
                    value={med.name} 
                    onChange={(e) => updateMedicine(med.id, "name", e.target.value)} 
                    placeholder="e.g., Paracetamol" 
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71]" 
                  />
                </div>

                {/* Type & Dose Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                    <select 
                      value={med.type} 
                      onChange={(e) => updateMedicine(med.id, "type", e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#006A71]"
                    >
                      <option>Tablet</option>
                      <option>Capsule</option>
                      <option>Syrup</option>
                      <option>Injection</option>
                      <option>Drops</option>
                      <option>Cream/Ointment</option>
                      <option>Inhaler</option>
                      <option>Patch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Dose</label>
                    <input 
                      type="text" 
                      value={med.dose} 
                      onChange={(e) => updateMedicine(med.id, "dose", e.target.value)} 
                      placeholder="e.g., 500mg" 
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71]" 
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Frequency</label>
                   <select 
                     value={med.freq} 
                     onChange={(e) => updateMedicine(med.id, "freq", e.target.value)} 
                     className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#006A71]"
                   >
                     <option>Once daily</option>
                     <option>Twice daily</option>
                     <option>Three times daily</option>
                     <option>Four times daily</option>
                     <option>Every 4 hours</option>
                     <option>Every 6 hours</option>
                     <option>Every 8 hours</option>
                     <option>Every 12 hours</option>
                     <option>Before meals</option>
                     <option>After meals</option>
                     <option>At bedtime</option>
                     <option>As needed</option>
                     <option>Weekly</option>
                   </select>
                </div>

                {/* Time */}
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
                   {/* [FIREBASE - BACKEND] Note: Save as 24h string or convert to Timestamp */}
                   <input 
                     type="time" 
                     value={med.time} 
                     onChange={(e) => updateMedicine(med.id, "time", e.target.value)} 
                     className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71]" 
                   />
                </div>

                {/* Duration */}
                <div>
                   <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
                   <select 
                     value={med.duration} 
                     onChange={(e) => updateMedicine(med.id, "duration", e.target.value)} 
                     className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#006A71]"
                   >
                     <option>3 days</option>
                     <option>5 days</option>
                     <option>1 week</option>
                     <option>2 weeks</option>
                     <option>1 month</option>
                     <option>2 month</option>
                     <option>3 month</option>
                     <option>6 month</option>
                     <option>Ongoing</option>
                     <option>As needed</option>
                   </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Remarks (Optional)</label>
                  <input 
                    type="text" 
                    value={med.notes} 
                    onChange={(e) => updateMedicine(med.id, "notes", e.target.value)} 
                    placeholder="e.g., Take with water" 
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006A71]" 
                  />
                </div>

              </div>
            ))}

            {/* Add Medicine Button */}
            <button 
              type="button" 
              onClick={addMedicine} 
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition"
            >
              + Add New Medicine
            </button>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-gray-200">
          <button 
            type="submit" 
            className="w-full bg-[#006A71] text-white py-3 rounded-lg font-semibold hover:bg-[#005257] transition shadow-sm"
          >
            Send Prescription
          </button>
        </div>

      </form>
    </div>
  );
}