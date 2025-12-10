import React, { useState, useEffect, useRef } from "react";
import { formatTime } from "../../../src/lib/formatTime";
import { db } from "@/app/src/lib/firebase/client";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  increment,
} from "firebase/firestore";
import { useUser } from "@/app/src/lib/context/UserContext";
import PrescriptionFormModal from "./PrescriptionFormModal";
import PrescriptionViewerModal from "./PrescriptionViewerModal";
import EvaluationFormModal from "./EvaluationFormModal";
import EvaluationViewerModal from "./EvaluationViewerModal";

export default function ChatWindow({ chat, onMessageSent }: any) {
  const { currentUser, accountData } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");

  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);

  // Viewer States
  const [viewerData, setViewerData] = useState(null);
  const [evalViewerData, setEvalViewerData] = useState(null);

  // Loading and cache states
  const [loading, setLoading] = useState(true);
  const [photoCache, setPhotoCache] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user photos on chat change
  useEffect(() => {
    const loadPhotos = async () => {
      if (!chat) return;
      const cache: Record<string, string> = {};

      try {
        // Fetch doctor's photo directly from Firestore
        const doctorDoc = await getDoc(doc(db, "accounts", chat.doctor));
        if (doctorDoc.exists() && doctorDoc.data()?.photo) {
          cache[chat.doctor] = doctorDoc.data().photo;
        }

        // Fetch client's photo directly from Firestore
        const clientDoc = await getDoc(doc(db, "accounts", chat.client));
        if (clientDoc.exists() && clientDoc.data()?.photo) {
          cache[chat.client] = clientDoc.data().photo;
        }

        setPhotoCache(cache);
      } catch (error) {
        console.error("Error loading photos:", error);
      }
    };

    loadPhotos();
  }, [chat]);

  // Real-time message listener
  useEffect(() => {
    if (!chat) {
      setMessages([]);
      return;
    }

    setLoading(true);

    // Reset unread count when opening chat
    const resetUnreadCount = async () => {
      try {
        const chatRef = doc(db, "chats", chat.id);
        const updateData: any = {};

        if (chat.isDoctor) {
          updateData.unreadCountDoctor = 0;
        } else {
          updateData.unreadCountClient = 0;
        }

        await updateDoc(chatRef, updateData);
      } catch (error) {
        console.error("Error resetting unread count:", error);
      }
    };

    resetUnreadCount();

    // Listen to messages
    const messagesRef = collection(db, "chats", chat.id, "convo");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const loadedMessages: any[] = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let senderName = data.senderName || "Unknown";
          
          // Determine expected name based on sender
          const isDoctor = data.sender === chat.doctor;
          const expectedName = isDoctor ? chat.doctorName : chat.clientName;
          
          // Use chat context name if available, otherwise fetch from account
          if (expectedName && expectedName !== "Unknown") {
            senderName = expectedName;
          } else if (senderName === "Unknown" && data.sender) {
            try {
              const senderDoc = await getDoc(doc(db, "accounts", data.sender));
              if (senderDoc.exists()) {
                senderName = senderDoc.data()?.name || "Unknown";
              }
            } catch (error) {
              console.error("Error fetching sender name:", error);
            }
          }

          // Handle prescription_ref type (lightweight reference)
          let messageData: any = {
            id: docSnap.id,
            sender: data.sender,
            senderName: senderName,
            senderPhoto: photoCache[data.sender],
            type: data.type,
            message: data.message,
            timestamp: data.timestamp,
            status: data.status,
          };

          // If it's a prescription_ref, load the full prescription data from patient's collection
          if (data.type === "prescription_ref" && data.prescriptionId) {
            try {
              // Get patientId from the chat data (prescription is stored in patient's account)
              const patientIdForPrescription = data.patientId;
              const presDoc = await getDoc(
                doc(db, "accounts", patientIdForPrescription, "prescriptions", data.prescriptionId)
              );
              if (presDoc.exists()) {
                const presData = presDoc.data();
                messageData.prescriptionData = presData;
                messageData.prescriptionId = data.prescriptionId;
                // Update status from prescription document
                messageData.status = presData.status || data.status;
              }
            } catch (error) {
              console.error("Error loading prescription:", error);
              messageData.prescriptionData = null;
            }
          } else {
            messageData.prescriptionData = data.prescriptionData;
            messageData.prescriptionId = data.prescriptionId;
          }

          messageData.evaluationData = data.evaluationData;
          messageData.medicineName = data.medicineName;
          
          loadedMessages.push(messageData);
        }
        setMessages(loadedMessages);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading messages:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chat, photoCache]);

  // Send text message
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chat || !currentUser) return;

    setIsSending(true);
    try {
      const messagesRef = collection(db, "chats", chat.id, "convo");
      await addDoc(messagesRef, {
        sender: currentUser.uid,
        senderName: accountData?.name || "Unknown",
        type: "text",
        message: inputValue,
        timestamp: serverTimestamp(),
      });

      // Update parent chat with last message
      if (onMessageSent) {
        onMessageSent(chat.id, inputValue);
      }

      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Send prescription
  const handleSendPrescription = async (data: any) => {
    if (!chat || !currentUser) return;

    setIsSending(true);
    try {
      // Extract medicine name from the medicines array
      const medicineName = 
        data.medicines && data.medicines.length > 0 
          ? data.medicines[0].medicineName || 'Prescription'
          : 'Prescription';

      // Get patient ID
      const patientId = chat.isDoctor ? chat.client : chat.doctor;
      const doctorId = currentUser.uid;

      // 1. Create prescription document in PATIENT's account
      const patientPrescriptionsRef = collection(db, "accounts", patientId, "prescriptions");
      const prescriptionDocRef = doc(patientPrescriptionsRef);
      const prescriptionId = prescriptionDocRef.id;

      // Form uses: medicineName, type, dosage, frequency, time, duration, remarks
      // Flutter expects: name, type, dose, freq, time, duration, notes
      const transformedMedicines = (data.medicines || [])
        .map((med: any) => {
          const transformed: any = {
            medicineName: med.medicineName || "",
            type: med.type || "Tablet",
            dosage: med.dosage || "",
            frequency: med.frequency || "Once daily",
            time: med.time || "",
            duration: parseInt(med.duration) || 3,
            remarks: med.remarks || "",
          };
          // Remove any undefined values
          return Object.fromEntries(
            Object.entries(transformed).filter(([_, v]) => v !== undefined && v !== "")
          );
        })
        .filter((med: any) => med.medicineName); // Only include medicines with at least a name

      const prescriptionData = {
        prescriptionId: prescriptionId,
        doctorId: doctorId,
        patientId: patientId,
        patientName: data.patientName || chat.clientName || chat.name,
        medicines: transformedMedicines,
        status: "pending",
        timestamp: serverTimestamp(),
      };

      await setDoc(prescriptionDocRef, prescriptionData);

      // 2. Add lightweight chat message referencing the prescription (prescription_ref type)
      const messagesRef = collection(db, "chats", chat.id, "convo");
      const chatMsgRef = await addDoc(messagesRef, {
        type: "prescription_ref",
        prescriptionId: prescriptionId,
        summary: {
          firstMedicine: medicineName,
          count: transformedMedicines.length,
        },
        patientId: patientId,
        patientName: data.patientName || chat.clientName || chat.name,
        status: "pending",
        timestamp: serverTimestamp(),
        sender: currentUser.uid,
        senderName: accountData?.name || "Unknown",
      });

      // 3. Update prescription doc with chat message id for cross-reference
      await updateDoc(prescriptionDocRef, { chatMessageId: chatMsgRef.id });

      // 4. Create notification for patient in their account
      const medicineNames = transformedMedicines
        .map((med: any) => med.name)
        .join(", ");
      
      // Try to write notification to patient's collection
      // If this fails due to permissions, the patient will still see it in the chat
      try {
        const patientNotifRef = collection(db, "accounts", patientId, "notifications");
        await addDoc(patientNotifRef, {
          type: "prescription",
          prescriptionId: prescriptionId,
          message: `${accountData?.name || "Doctor"} sent you a prescription`,
          details: `Medicine: ${medicineNames || "N/A"}`,
          sender: currentUser.uid,
          doctorId: currentUser.uid,
          timestamp: serverTimestamp(),
          isNew: true,
        });
      } catch (notifError) {
        // Notification write failed, but prescription was created successfully
        console.warn("Could not create notification, but prescription was sent", notifError);
      }

      // 5. Increment unread count for patient (like Flutter does)
      const isCurrentUserDoc = chat.isDoctor;
      const unreadCountKey = isCurrentUserDoc ? 'unreadCountClient' : 'unreadCountDoctor';
      const chatRef = doc(db, "chats", chat.id);
      await updateDoc(chatRef, {
        [unreadCountKey]: increment(1),  // Increment unread count by 1
      });

      // Update parent chat
      if (onMessageSent) {
        onMessageSent(chat.id, `Sent a prescription: ${medicineName}`);
      }

      setIsFormOpen(false);
    } catch (error) {
      console.error("Error sending prescription:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Send evaluation
  const handleSendEvaluation = async (data: any) => {
    if (!chat || !currentUser) return;

    setIsSending(true);
    try {
      const messagesRef = collection(db, "chats", chat.id, "convo");
      await addDoc(messagesRef, {
        sender: currentUser.uid,
        senderName: accountData?.name || "Unknown",
        type: "evaluation",
        message: `Sent an evaluation: ${data.diagnosis || "Patient evaluation"}`,
        timestamp: serverTimestamp(),
        evaluationData: data,
      });

      // Update parent chat
      if (onMessageSent) {
        onMessageSent(chat.id, "Sent an evaluation");
      }

      setIsEvalOpen(false);
    } catch (error) {
      console.error("Error sending evaluation:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Accept prescription (patient only)
  const handleAcceptPrescription = async (messageId: string, prescriptionData: any, prescriptionId?: string) => {
    if (!chat || !currentUser || chat.isDoctor) return;

    try {
      const patientId = currentUser.uid;
      const doctorId = chat.doctor;

      // Extract medicine info
      const medicines = prescriptionData.medicines || [];
      const medicineName = medicines.length > 0 ? medicines[0].name : "Medicine";

      // 1. Update prescription status in message
      const messageRef = doc(db, "chats", chat.id, "convo", messageId);
      await updateDoc(messageRef, { status: "accepted" });

      // 2. Update prescription reference status (in patient's collection)
      if (prescriptionId) {
        const prescriptionRef = doc(db, "accounts", patientId, "prescriptions", prescriptionId);
        await updateDoc(prescriptionRef, { 
          status: "accepted",
          acceptedBy: currentUser.uid,
          acceptedAt: serverTimestamp(),
        });
      }

      // 3. Create task in tasks collection (matching Flutter structure)
      const tasksRef = collection(db, "accounts", patientId, "tasks");
      
      // Handle multiple medicines like Flutter does
      for (const medicine of medicines) {
        const medicineType = medicine.type || "";
        const medicineDose = medicine.dosage || "";
        const medicineFreq = medicine.frequency || "";
        const medicineTime = medicine.time || "";
        const medicineDuration = parseInt(medicine.duration) || 30;
        const medicineNotes = medicine.remarks || ""; 

        await addDoc(tasksRef, {
          title: medicine.name,
          type: "prescription",
          prescriptionId: prescriptionId,
          medicineName: medicine.name,
          medicineType: medicineType,
          dosage: medicineDose,
          frequency: medicineFreq,
          time: medicineTime,
          duration: medicineDuration,
          remarks: medicineNotes,
          createdAt: serverTimestamp(),
          status: "active",
          doctorId: doctorId,
        });
      }

      // 4. Create notification for doctor (matching Flutter format)
      const patientName = chat.name;
      const notificationsRef = collection(db, "accounts", doctorId, "notifications");
      await addDoc(notificationsRef, {
        type: "prescription_response",
        prescriptionId: prescriptionId,
        message: `${patientName} accepted your prescription`,
        details: `Medicine: ${medicineName}`,
        sender: patientId,
        timestamp: serverTimestamp(),
        isNew: true,
      });

      console.log("✓ Prescription accepted successfully");
    } catch (error) {
      console.error("Error accepting prescription:", error);
    }
  };

  // Decline prescription (patient only)
  const handleDeclinePrescription = async (messageId: string, prescriptionData: any, prescriptionId?: string) => {
    if (!chat || !currentUser || chat.isDoctor) return;

    try {
      const patientId = currentUser.uid;
      const doctorId = chat.doctor;

      // Extract medicine name from medicines array
      const medicines = prescriptionData.medicines || [];
      const medicineName = medicines.length > 0 ? medicines[0].name : "Medicine";

      // 1. Update prescription status in message
      const messageRef = doc(db, "chats", chat.id, "convo", messageId);
      await updateDoc(messageRef, { status: "declined" });

      // 2. Update prescription reference status (in patient's collection)
      if (prescriptionId) {
        const prescriptionRef = doc(db, "accounts", patientId, "prescriptions", prescriptionId);
        await updateDoc(prescriptionRef, { 
          status: "declined",
          declinedBy: currentUser.uid,
          declinedAt: serverTimestamp(),
        });
      }

      // 3. Create notification for doctor (matching Flutter format)
      const patientName = chat.name;
      const notificationsRef = collection(db, "accounts", doctorId, "notifications");
      await addDoc(notificationsRef, {
        type: "prescription_response",
        prescriptionId: prescriptionId,
        message: `${patientName} declined your prescription`,
        details: `Medicine: ${medicineName}`,
        sender: patientId,
        timestamp: serverTimestamp(),
        isNew: true,
      });

      console.log("✓ Prescription declined successfully");
    } catch (error) {
      console.error("Error declining prescription:", error);
    }
  };

  // Format timestamp
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return formatTime(date);
  };

  // Get avatar initial
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#e3f0f1]">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#e3f0f1]">
      {/* Header */}
      <div className="p-4 bg-white flex items-center gap-3 h-[75px] border-b">
        {photoCache[chat.otherUserId] ? (
          <img
            src={photoCache[chat.otherUserId]}
            className="w-10 h-10 rounded-full object-cover"
            alt={chat.name}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#006A71] text-white flex items-center justify-center font-semibold">
            {getInitial(chat.name)}
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-800">{chat.name}</h2>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.sender === currentUser?.uid;

            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} gap-2`}
              >
                {/* Avatar for other user */}
                {!isCurrentUser && (
                  <div className="flex-shrink-0">
                    {photoCache[msg.sender] ? (
                      <img
                        src={photoCache[msg.sender]}
                        className="w-8 h-8 rounded-full object-cover"
                        alt={msg.senderName}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#006A71] text-white flex items-center justify-center text-xs font-semibold">
                        {getInitial(msg.senderName)}
                      </div>
                    )}
                  </div>
                )}

                <div className={isCurrentUser ? "flex-col items-end" : "flex-col items-start"}>
                  {!isCurrentUser && (
                    <p className="text-xs text-gray-500 px-3">{msg.senderName}</p>
                  )}

                  {/* TEXT MESSAGE */}
                  {msg.type === "text" && (
                    <div
                      className={`p-3 rounded-lg shadow max-w-md ${
                        isCurrentUser
                          ? "bg-[#a7d3d3] text-gray-800"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <span className="text-xs text-gray-600 block text-right mt-1">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* PRESCRIPTION MESSAGE */}
                  {(msg.type === "prescription" || msg.type === "prescription_ref") && msg.prescriptionData && (
                    <div
                      className={`${
                        isCurrentUser ? "bg-[#a7d3d3]" : "bg-white"
                      } p-3 rounded-lg shadow max-w-sm`}
                    >
                      <div className="flex gap-3 items-center">
                        <svg
                          className="w-8 h-8 text-gray-700 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div>
                          <h3 className="font-bold text-gray-800">Prescription</h3>
                          <p className="text-sm text-gray-700">
                            {msg.prescriptionData.medicines && msg.prescriptionData.medicines.length > 0
                              ? msg.prescriptionData.medicines[0].name
                              : "Medicine"}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-400 mt-2 pt-2 flex justify-between items-center gap-2">
                        <span
                          className={`font-bold text-sm ${
                            msg.status === "accepted"
                              ? "text-green-600"
                              : msg.status === "declined"
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {msg.status === "accepted"
                            ? "Accepted"
                            : msg.status === "declined"
                            ? "Declined"
                            : "Pending"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewerData(msg.prescriptionData)}
                            className="bg-[#006A71] text-white px-3 py-1 rounded text-sm hover:bg-[#005257] transition"
                          >
                            View
                          </button>

                          {/* Accept/Decline buttons for patient */}
                          {!isCurrentUser &&
                            !chat.isDoctor &&
                            msg.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleAcceptPrescription(
                                      msg.id,
                                      msg.prescriptionData,
                                      msg.prescriptionId
                                    )
                                  }
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeclinePrescription(
                                      msg.id,
                                      msg.prescriptionData,
                                      msg.prescriptionId
                                    )
                                  }
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                        </div>
                      </div>

                      <span className="text-xs text-gray-600 block text-right mt-1">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* EVALUATION MESSAGE */}
                  {msg.type === "evaluation" && msg.evaluationData && (
                    <div
                      className={`${
                        isCurrentUser ? "bg-[#a7d3d3]" : "bg-white"
                      } p-3 rounded-lg shadow max-w-sm`}
                    >
                      <div className="flex gap-3 items-center">
                        <svg
                          className="w-8 h-8 text-gray-700 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        <div>
                          <h3 className="font-bold text-gray-800">Evaluation</h3>
                          <p className="text-sm text-gray-700">
                            {msg.evaluationData.diagnosis ||
                              "Patient Evaluation"}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-400 mt-2 pt-2 flex justify-between items-center">
                        <button
                          onClick={() => setEvalViewerData(msg.evaluationData)}
                          className="bg-[#006A71] text-white px-3 py-1 rounded text-sm hover:bg-[#005257] transition"
                        >
                          View Details
                        </button>
                      </div>

                      <span className="text-xs text-gray-600 block text-right mt-1">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Avatar for current user */}
                {isCurrentUser && currentUser && (
                  <div className="flex-shrink-0">
                    {photoCache[currentUser.uid] ? (
                      <img
                        src={photoCache[currentUser.uid]}
                        className="w-8 h-8 rounded-full object-cover"
                        alt={accountData?.name || "Me"}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#006A71] text-white flex items-center justify-center text-xs font-semibold">
                        {accountData?.name
                          ? getInitial(accountData.name)
                          : "Y"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 bg-white border-t">
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          {/* Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-[#006A71] hover:bg-gray-100 rounded-full transition relative"
            disabled={isSending}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {/* Menu Dropdown - Only show for doctors */}
          {isMenuOpen && chat.isDoctor && (
            <div className="absolute bottom-20 left-2 w-56 bg-white shadow-xl rounded-lg border border-gray-100 z-10 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <span className="text-xl">💊</span>
                <span className="text-gray-700 font-medium">Prescription</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEvalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
              >
                <span className="text-xl">📝</span>
                <span className="text-gray-700 font-medium">Evaluation Form</span>
              </button>
            </div>
          )}

          {/* Message Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 outline-none border border-gray-200 rounded-lg focus:border-[#006A71]"
            disabled={isSending}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="p-2 text-[#006A71] hover:opacity-80 transition disabled:opacity-50"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Modals */}
      <PrescriptionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSendPrescription}
        initialPatientName={chat.name}
      />
      <PrescriptionViewerModal
        isOpen={!!viewerData}
        onClose={() => setViewerData(null)}
        data={viewerData}
      />
      <EvaluationFormModal
        isOpen={isEvalOpen}
        onClose={() => setIsEvalOpen(false)}
        onSubmit={handleSendEvaluation}
        initialPatientName={chat.name}
      />
      <EvaluationViewerModal
        isOpen={!!evalViewerData}
        onClose={() => setEvalViewerData(null)}
        data={evalViewerData}
      />
    </div>
  );
}