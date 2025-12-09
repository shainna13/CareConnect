import React, { useState, useEffect, useRef } from "react";
// Adjust import path as needed for your project structure
import { formatTime } from "../../../src/lib/formatTime";
import PrescriptionFormModal from "./PrescriptionFormModal";
import PrescriptionViewerModal from "./PrescriptionViewerModal";
import EvaluationFormModal from "./EvaluationFormModal"; 
// ✅ IMPORT THE NEW VIEWER
import EvaluationViewerModal from "./EvaluationViewerModal";

export default function ChatWindow({ chat, onMessageSent }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [isEvalOpen, setIsEvalOpen] = useState(false); // State for Evaluation Form
  
  // Viewer States
  const [viewerData, setViewerData] = useState(null); 
  const [evalViewerData, setEvalViewerData] = useState(null); // ✅ NEW STATE FOR EVAL VIEWER
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // [FIREBASE - BACKEND] REAL-TIME LISTENER
  // 1. Listen to the subcollection: `chats/{chat.id}/messages`
  // 2. Order by: `timestamp` ascending
  // 3. Map Firestore snapshot to 'messages' state
  useEffect(() => {
    if (chat) {
      const doctorName = "Dr. Sarah Watson";
      const patientName = chat.name; 

      // [FIREBASE - BACKEND] MOCK DATA
      // Replace this array with the initial snapshot from Firestore.
      const initialMessages = [
        { 
          id: 1, 
          // 👇 UPDATED TEXT HERE
          text: `Hello ${patientName}! ${doctorName} confirmed your appointment request. Please wait for your appointment schedule.`, 
          sender: "me", 
          type: "text", 
          time: "08:30 AM" 
        }
      ];

      setMessages(initialMessages);

      // Sync with sidebar (preview shows the last message)
      if (initialMessages.length > 0 && onMessageSent) {
        const lastMsg = initialMessages[initialMessages.length - 1];
        const previewText = lastMsg.type === 'text' ? lastMsg.text : "Sent an attachment";
        onMessageSent(chat.id, previewText);
      }
    }
  }, [chat?.id]); // Only reset when the chat user changes

  // Scroll to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Handle clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isMenuOpen && !event.target.closest('.attachment-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // [FIREBASE - BACKEND] SEND TEXT MESSAGE
  // 1. Create payload: { 
  //      text: inputValue, 
  //      sender: currentUser.uid, 
  //      type: "text", 
  //      timestamp: serverTimestamp() 
  //    }
  // 2. await addDoc(collection(db, 'chats', chat.id, 'messages'), payload)
  // 3. Update Parent Chat Document: lastMessage = inputValue
  const handleSendText = (e: any) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Optimistic Update
    const newMsg = { id: Date.now(), text: inputValue, sender: "me", type: "text", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages([...messages, newMsg]);
    setInputValue("");

    // 2. UPDATE THE PARENT LIST HERE
    if (onMessageSent && chat) {
      onMessageSent(chat.id, inputValue);
    }
  };

  // [FIREBASE - BACKEND] SEND PRESCRIPTION MESSAGE
  // 1. Create payload: { 
  //      type: "prescription",
  //      sender: currentUser.uid,
  //      timestamp: serverTimestamp(),
  //      prescriptionData: data // Store the full object passed from the modal
  //    }
  // 2. await addDoc(...)
  // 3. Update Parent Chat Document: lastMessage = "Sent a prescription"
  const handleSendPrescription = (data: any) => {
    const newMsg = { 
      id: Date.now(), sender: "me", type: "prescription", prescriptionData: data, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages([...messages, newMsg]);
    setIsFormOpen(false);

    // 3. UPDATE THE PARENT LIST HERE
    if (onMessageSent && chat) {
      onMessageSent(chat.id, "Sent a prescription");
    }
  };

  // [FIREBASE - BACKEND] SEND EVALUATION MESSAGE
  // 1. Create payload: { 
  //      type: "evaluation",
  //      sender: currentUser.uid,
  //      timestamp: serverTimestamp(),
  //      evaluationData: data // Store the full object passed from the modal
  //    }
  // 2. await addDoc(...)
  // 3. Update Parent Chat Document: lastMessage = "Sent an evaluation"
  const handleSendEvaluation = (data: any) => {
    const newMsg = { 
      id: Date.now(), sender: "me", type: "evaluation", evaluationData: data, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages([...messages, newMsg]);
    setIsEvalOpen(false);

    // 4. UPDATE THE PARENT LIST HERE
    if (onMessageSent && chat) {
      onMessageSent(chat.id, "Sent an evaluation");
    }
  };

  if (!chat) return <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#e3f0f1]">Select a chat</div>;

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#e3f0f1]">
      {/* Header */}
      <div className="p-4 bg-white flex items-center gap-3 h-[75px]">
        <img src={chat.avatar} className="w-10 h-10 rounded-full" alt="avatar" />
        <h2 className="text-xl font-semibold">{chat.name}</h2>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            
            {/* [FIREBASE - BACKEND] RENDER: TEXT TYPE */}
            {msg.type === "text" && (
              <div className={`p-3 rounded-lg shadow max-w-md ${msg.sender === "me" ? "bg-[#a7d3d3] ml-auto" : "bg-white"}`}>
                <p>{msg.text}</p>
                <span className="text-xs text-gray-600 block text-right mt-1">{msg.time}</span>
              </div>
            )}

            {/* [FIREBASE - BACKEND] RENDER: PRESCRIPTION TYPE */}
            {/* Requires 'prescriptionData' field in the document */}
            {msg.type === "prescription" && (
              <div className="bg-[#a7d3d3] p-3 rounded-lg shadow max-w-sm w-full ml-auto">
                 <div className="flex gap-3 items-center">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <div><h3 className="font-bold text-gray-800">Prescription Sent</h3><p className="text-sm">Click open to view.</p></div>
                </div>
                <div className="border-t border-gray-400 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-red-600 font-bold text-sm">Pending</span>
                    <button onClick={() => setViewerData(msg.prescriptionData)} className="bg-[#006A71] text-white px-3 py-1 rounded text-sm">Open</button>
                </div>
                <span className="text-xs text-right block mt-1">{msg.time}</span>
              </div>
            )}

            {/* [FIREBASE - BACKEND] RENDER: EVALUATION TYPE */}
            {/* Requires 'evaluationData' field in the document */}
            {msg.type === "evaluation" && (
              <div className="bg-[#a7d3d3] p-3 rounded-lg shadow max-w-sm w-full ml-auto">
                 <div className="flex gap-3 items-center">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <div><h3 className="font-bold text-gray-800">Evaluation Sent</h3><p className="text-sm">Patient evaluation details.</p></div>
                </div>
                <div className="border-t border-gray-400 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-gray-700 text-sm font-medium">{msg.evaluationData.diagnosis || "No Diagnosis"}</span>
                    
                    <button onClick={() => setEvalViewerData(msg.evaluationData)} className="bg-[#006A71] text-white px-3 py-1 rounded text-sm hover:bg-[#005257]">Open</button>
                </div>
                <span className="text-xs text-right block mt-1">{msg.time}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 bg-white relative">
        <form onSubmit={handleSendText} className="flex items-center attachment-container">
            {/* Attachment Toggle */}
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[#006A71] hover:bg-gray-100 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </button>

            {/* Attachment Menu */}
            {isMenuOpen && (
                <div className="absolute bottom-16 left-2 w-56 bg-white shadow-xl rounded-lg border border-gray-100 z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button type="button" onClick={() => { setIsFormOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <span className="text-xl">💊</span><span className="text-gray-700 font-medium">Prescription</span>
                    </button>
                    <button type="button" onClick={() => { setIsEvalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors">
                         <span className="text-xl">📝</span><span className="text-gray-700 font-medium">Evaluation Form</span>
                    </button>
                </div>
            )}

            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 outline-none" />
            <button type="submit" className="p-2 text-[#006A71] hover:opacity-80 transition"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
        </form>
      </div>

      {/* Modals */}
      <PrescriptionFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleSendPrescription} initialPatientName={chat.name} />
      <PrescriptionViewerModal isOpen={!!viewerData} onClose={() => setViewerData(null)} data={viewerData} />
      <EvaluationFormModal isOpen={isEvalOpen} onClose={() => setIsEvalOpen(false)} onSubmit={handleSendEvaluation} initialPatientName={chat.name} />
      
      {/* RENDER EVALUATION VIEWER */}
      <EvaluationViewerModal isOpen={!!evalViewerData} onClose={() => setEvalViewerData(null)} data={evalViewerData} />
    </div>
  );
}