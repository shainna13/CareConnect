// Type definitions for Appointment data structure
// This matches what the patient sends when booking an appointment

export interface AppointmentRequest {
  // Patient Information
  clientId: string;
  clientName: string;
  clientEmail: string;

  // Doctor Information
  doctorId: string;
  doctorName: string;
  assignedTo: string; // Same as doctorId

  // Medical Information
  bodyTemperature: string;
  currentMedication: string;
  medicationPrescribe: string;
  onsetSymptoms: string;
  painIntensity: string;
  painLocation: string;
  patientFeels: string;

  // Appointment Details
  dateKey?: string; // The date string (e.g., "Sat Dec 20 2025")
  time?: string; // The time (e.g., "09:00 AM")
  selectedDateKey?: string; // Alternative field name for dateKey
  selectedTimeSlot?: string; // Alternative field name for time

  // Metadata
  timestamp: number; // Firebase server timestamp (milliseconds)
  approved?: string | boolean; // 'true', 'false', or boolean
  message?: string;
  rejectionReason?: string;
  acceptedAt?: number; // When doctor accepted it
  rejectedAt?: number; // When doctor rejected it
}

export interface AppointmentResponse {
  id: string; // Firestore document ID
  data: AppointmentRequest;
  createdAt: number;
}

export interface AppointmentFilter {
  doctorId?: string;
  clientId?: string;
  approved?: string | boolean;
  dateRange?: {
    start: number;
    end: number;
  };
}
