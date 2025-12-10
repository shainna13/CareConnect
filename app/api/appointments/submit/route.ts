// app/api/appointments/submit/route.ts
// Patient submits an appointment request to a doctor

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/src/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { AppointmentRequest } from '@/app/src/lib/types/appointment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'clientId',
      'clientName',
      'clientEmail',
      'doctorId',
      'doctorName',
      'assignedTo',
      'bodyTemperature',
      'currentMedication',
      'medicationPrescribe',
      'onsetSymptoms',
      'painIntensity',
      'painLocation',
      'patientFeels',
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if doctor exists (optional validation)
    const doctorsSnapshot = await adminDb
      .collection('accounts')
      .where('id', '==', body.doctorId)
      .limit(1)
      .get();

    if (doctorsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if client account exists
    const clientSnapshot = await adminDb
      .collection('accounts')
      .doc(body.clientId)
      .get();

    if (!clientSnapshot.exists) {
      return NextResponse.json(
        { error: 'Client account not found' },
        { status: 404 }
      );
    }

    // Create appointment data
    const appointmentData = {
      clientId: body.clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      doctorId: body.doctorId,
      doctorName: body.doctorName,
      assignedTo: body.assignedTo || body.doctorId,
      bodyTemperature: body.bodyTemperature,
      currentMedication: body.currentMedication,
      medicationPrescribe: body.medicationPrescribe,
      onsetSymptoms: body.onsetSymptoms,
      painIntensity: body.painIntensity,
      painLocation: body.painLocation,
      patientFeels: body.patientFeels,
      timestamp: Timestamp.now(),
      message: body.message || 'New appointment request',
    };

    // Store in client's notes subcollection
    const noteRef = await adminDb
      .collection('accounts')
      .doc(body.clientId)
      .collection('notes')
      .add(appointmentData);

    return NextResponse.json(
      {
        success: true,
        id: noteRef.id,
        message: 'Appointment request submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit appointment request';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
