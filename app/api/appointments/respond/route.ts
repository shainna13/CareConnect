// app/api/appointments/respond/route.ts
// Doctor accepts or rejects an appointment request

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/src/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { DocumentReference } from 'firebase-admin/firestore';

interface RespondRequest {
  appointmentId: string;
  action: 'accept' | 'reject';
  rejectionReason?: string;
  doctorId: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const body: RespondRequest = await request.json();

    const { appointmentId, action, rejectionReason, doctorId } = body;

    // Validate input
    if (!appointmentId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request: appointmentId and action (accept/reject) are required' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting an appointment' },
        { status: 400 }
      );
    }

    // Appointments are stored in accounts > notes subcollection
    // appointmentId format: "accountId_noteId" or just noteId
    // We need to find which account this note belongs to
    
    const accountsSnapshot = await adminDb.collection('accounts').get();
    let noteRef: DocumentReference | null = null;
    let appointmentData: any = null;
    let clientId: string | null = null;

    // Search through all accounts to find the note
    for (const accountDoc of accountsSnapshot.docs) {
      const notesSnapshot = await accountDoc.ref.collection('notes').get();
      
      for (const noteDoc of notesSnapshot.docs) {
        if (noteDoc.id === appointmentId) {
          noteRef = noteDoc.ref;
          appointmentData = noteDoc.data();
          clientId = accountDoc.id;
          break;
        }
      }
      
      if (noteRef) break;
    }

    if (!noteRef || !appointmentData) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify doctor is the one responding (security check)
    if (appointmentData.doctorId !== doctorId && appointmentData.assignedTo !== doctorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only respond to your own appointments' },
        { status: 403 }
      );
    }

    // Check if already responded
    if (appointmentData.approved !== undefined && appointmentData.approved !== null) {
      return NextResponse.json(
        { error: 'Cannot respond to an already processed appointment' },
        { status: 400 }
      );
    }

    // Update appointment based on action
    const updateData =
      action === 'accept'
        ? {
            approved: 'true',
            acceptedAt: Timestamp.now(),
            message: 'Appointment confirmed',
          }
        : {
            approved: 'false',
            rejectedAt: Timestamp.now(),
            rejectionReason: rejectionReason,
            message: `Appointment rejected: ${rejectionReason}`,
          };

    // Update the note in Firestore
    await noteRef.update(updateData);

    // If appointment is accepted, create a chat
    if (action === 'accept' && clientId && doctorId) {
      try {
        const chatId = `${doctorId}_${clientId}`;
        const chatDocRef = adminDb.collection('chats').doc(chatId);

        // Get doctor and client data for the chat
        const doctorDoc = await adminDb.collection('accounts').doc(doctorId).get();
        const clientDoc = await adminDb.collection('accounts').doc(clientId).get();

        // Check if chat already exists
        const chatExists = await chatDocRef.get();
        
        if (!chatExists.exists) {
          // Create new chat
          await chatDocRef.set({
            doctor: doctorId,
            client: clientId,
            doctorName: doctorDoc.exists ? doctorDoc.data()?.name || 'Doctor' : 'Doctor',
            clientName: clientDoc.exists ? clientDoc.data()?.name || 'Patient' : 'Patient',
            createdAt: Timestamp.now(),
            unreadCountDoctor: 0,
            unreadCountClient: 1, // Mark as unread for client
          });
        }
      } catch (chatError) {
        console.error('Error creating chat:', chatError);
        // Don't fail the request if chat creation fails
      }
    }

    // Add notification to client's notifications subcollection
    if (clientId) {
      const notificationData: any = {
        name: appointmentData.doctorName || 'Doctor',
        noteId: appointmentId,
        message:
          action === 'accept'
            ? `${appointmentData.doctorName || 'Doctor'} accepted your consultation request`
            : `${appointmentData.doctorName || 'Doctor'} declined your consultation request`,
        type: 'consultation',
        timestamp: Timestamp.now(),
        isNew: true,
      };

      // Only add email if it exists
      if (appointmentData.doctorEmail) {
        notificationData.email = appointmentData.doctorEmail;
      }

      await adminDb
        .collection('accounts')
        .doc(clientId)
        .collection('notifications')
        .add(notificationData);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Appointment ${action}ed successfully`,
        appointmentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error responding to appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process appointment response';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
