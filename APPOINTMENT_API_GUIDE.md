## CareConnect Backend - Appointment Management API Guide

This document explains how to use the appointment management backend APIs.

---

## **API Endpoints**

### **1. Submit Appointment (Patient)**
**Endpoint:** `POST /api/appointments/submit`

**Description:** Patient submits an appointment request to a doctor

**Request Body:**
```json
{
  "clientId": "TPN4jHp4Fea6aSSAdULyVoTpvos2",
  "clientName": "jomar coders",
  "clientEmail": "senabarcebal@gmail.com",
  "doctorId": "aQV2gT8LJCgnK41zgyJbqoWHKLm2",
  "doctorName": "jeremy barcebal",
  "assignedTo": "aQV2gT8LJCgnK41zgyJbqoWHKLm2",
  "bodyTemperature": "45",
  "currentMedication": "cf",
  "medicationPrescribe": "cf",
  "onsetSymptoms": "cg",
  "painIntensity": "df",
  "painLocation": "dd",
  "patientFeels": "ff",
  "message": "Urgent appointment needed" // optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "id": "appointment_doc_id",
  "message": "Appointment request submitted successfully"
}
```

**Response (Error - 400):**
```json
{
  "error": "Missing required fields: ..."
}
```

---

### **2. Doctor Responds to Appointment**
**Endpoint:** `PATCH /api/appointments/respond`

**Description:** Doctor accepts or rejects a pending appointment

**Request Body (Accept):**
```json
{
  "appointmentId": "doc_id_from_firestore",
  "action": "accept",
  "doctorId": "aQV2gT8LJCgnK41zgyJbqoWHKLm2"
}
```

**Request Body (Reject):**
```json
{
  "appointmentId": "doc_id_from_firestore",
  "action": "reject",
  "doctorId": "aQV2gT8LJCgnK41zgyJbqoWHKLm2",
  "rejectionReason": "Fully booked for this period"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Appointment accepted successfully",
  "appointmentId": "doc_id_from_firestore"
}
```

**Response (Error - 403):**
```json
{
  "error": "Unauthorized: You can only respond to your own appointments"
}
```

---

### **3. Fetch Appointments**
**Endpoint:** `GET /api/appointments/fetch`

**Description:** Fetch appointments with filters

**Query Parameters:**
- `doctorId` (optional) - Get appointments for a specific doctor
- `clientId` (optional) - Get appointments for a specific patient
- `status` (optional) - Filter by status: `Pending`, `Confirmed`, `Rejected`, `Completed`
- `limit` (optional) - Maximum results (default: 50)

**Example URLs:**
```
# Doctor's pending appointments
GET /api/appointments/fetch?doctorId=aQV2gT8LJCgnK41zgyJbqoWHKLm2&status=Pending

# Patient's confirmed appointments
GET /api/appointments/fetch?clientId=TPN4jHp4Fea6aSSAdULyVoTpvos2&status=Confirmed

# All appointments for a doctor
GET /api/appointments/fetch?doctorId=aQV2gT8LJCgnK41zgyJbqoWHKLm2
```

**Response (Success - 200):**
```json
{
  "success": true,
  "appointments": [
    {
      "id": "firestore_doc_id",
      "clientId": "TPN4jHp4Fea6aSSAdULyVoTpvos2",
      "clientName": "jomar coders",
      "clientEmail": "senabarcebal@gmail.com",
      "doctorId": "aQV2gT8LJCgnK41zgyJbqoWHKLm2",
      "doctorName": "jeremy barcebal",
      "bodyTemperature": "45",
      "currentMedication": "cf",
      "medicationPrescribe": "cf",
      "onsetSymptoms": "cg",
      "painIntensity": "df",
      "painLocation": "dd",
      "patientFeels": "ff",
      "timestamp": 1733688319000,
      "status": "Pending",
      "message": "New appointment request",
      "acceptedAt": null,
      "rejectedAt": null
    }
  ],
  "count": 1
}
```

---

## **Using the Hook**

### **Example 1: Patient Submitting an Appointment**

```tsx
'use client';

import { useAppointments } from '@/app/src/lib/hooks/useAppointments';

export default function BookAppointmentPage() {
  const { submitAppointment, loading, error } = useAppointments();

  const handleSubmit = async () => {
    const result = await submitAppointment({
      clientId: 'TPN4jHp4Fea6aSSAdULyVoTpvos2',
      clientName: 'jomar coders',
      clientEmail: 'senabarcebal@gmail.com',
      doctorId: 'aQV2gT8LJCgnK41zgyJbqoWHKLm2',
      doctorName: 'jeremy barcebal',
      assignedTo: 'aQV2gT8LJCgnK41zgyJbqoWHKLm2',
      bodyTemperature: '45',
      currentMedication: 'cf',
      medicationPrescribe: 'cf',
      onsetSymptoms: 'cg',
      painIntensity: 'df',
      painLocation: 'dd',
      patientFeels: 'ff',
    });

    if (result) {
      console.log('Appointment submitted:', result.id);
      // Show success message
    }
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Book Appointment'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

---

### **Example 2: Doctor Responding to Appointments**

```tsx
'use client';

import { useAppointments } from '@/app/src/lib/hooks/useAppointments';
import { useEffect, useState } from 'react';

export default function AppointmentsPage() {
  const { fetchAppointments, respondToAppointment, loading, error } = useAppointments();
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const doctorId = 'aQV2gT8LJCgnK41zgyJbqoWHKLm2'; // From user context

  useEffect(() => {
    const loadPendingAppointments = async () => {
      const appointments = await fetchAppointments({
        doctorId,
        status: 'Pending',
      });

      if (appointments) {
        setPendingAppointments(appointments);
      }
    };

    loadPendingAppointments();
  }, [doctorId, fetchAppointments]);

  const handleAccept = async (appointmentId: string) => {
    const success = await respondToAppointment(appointmentId, 'accept', doctorId);
    if (success) {
      // Refresh appointments
      const appointments = await fetchAppointments({
        doctorId,
        status: 'Pending',
      });
      setPendingAppointments(appointments || []);
    }
  };

  const handleReject = async (appointmentId: string) => {
    const success = await respondToAppointment(
      appointmentId,
      'reject',
      doctorId,
      'I am fully booked during this period'
    );
    if (success) {
      // Refresh appointments
      const appointments = await fetchAppointments({
        doctorId,
        status: 'Pending',
      });
      setPendingAppointments(appointments || []);
    }
  };

  return (
    <div>
      <h2>Pending Appointments ({pendingAppointments.length})</h2>
      {error && <p className="text-red-500">{error}</p>}

      <div>
        {pendingAppointments.map((appt) => (
          <div key={appt.id} className="border p-4 mb-2">
            <h3>{appt.clientName}</h3>
            <p>Email: {appt.clientEmail}</p>
            <p>Temperature: {appt.bodyTemperature}°C</p>
            <p>Symptoms: {appt.onsetSymptoms}</p>

            <div className="mt-4">
              <button
                onClick={() => handleAccept(appt.id)}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(appt.id)}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## **Firestore Collections Structure**

Your Firestore database should have the following structure:

### **Collection: `appointments`**

```
appointments/
├── {documentId}
│   ├── clientId: string
│   ├── clientName: string
│   ├── clientEmail: string
│   ├── doctorId: string
│   ├── doctorName: string
│   ├── assignedTo: string
│   ├── bodyTemperature: string
│   ├── currentMedication: string
│   ├── medicationPrescribe: string
│   ├── onsetSymptoms: string
│   ├── painIntensity: string
│   ├── painLocation: string
│   ├── patientFeels: string
│   ├── timestamp: timestamp
│   ├── status: string (Pending | Confirmed | Rejected | Completed)
│   ├── message: string
│   ├── acceptedAt: timestamp (nullable)
│   ├── rejectedAt: timestamp (nullable)
│   └── rejectionReason: string (nullable)
```

---

## **Firestore Security Rules**

Add these rules to your Firestore to secure appointments:

```javascript
match /appointments/{document=**} {
  // Users can read their own appointments
  allow read: if request.auth.uid == resource.data.doctorId 
              || request.auth.uid == resource.data.clientId;
  
  // Patients can only create new appointments
  allow create: if request.auth.uid == request.resource.data.clientId;
  
  // Doctors can only update status/response
  allow update: if request.auth.uid == resource.data.doctorId
                && (request.resource.data.status == "Confirmed" 
                    || request.resource.data.status == "Rejected");
}
```

---

## **Status Flow**

```
Pending → Accepted → Confirmed
       → Rejected
       
Confirmed → Completed
```

---

## **Next Steps**

1. **Update your Appointments page** to use `useAppointments` hook
2. **Implement patient booking form** with appointment submission
3. **Set up real-time listeners** using Firestore `onSnapshot()` for live updates
4. **Add notification system** when doctor responds to appointments
5. **Implement Firestore security rules** to protect sensitive data
