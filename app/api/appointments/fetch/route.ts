// app/api/appointments/fetch/route.ts
// Fetch appointments with optional filters

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/src/lib/firebase/admin';

interface FetchQuery {
  doctorId?: string;
  clientId?: string;
  status?: 'Pending' | 'Confirmed' | 'Rejected' | 'Completed';
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // If no filters, return error
    if (!doctorId && !clientId && !status) {
      return NextResponse.json(
        { error: 'At least one filter (doctorId, clientId, or status) is required' },
        { status: 400 }
      );
    }

    // Fetch all accounts and extract appointments from notes subcollection
    const accountsSnapshot = await adminDb.collection('accounts').get();
    let allAppointments: any[] = [];

    // Iterate through each account
    for (const accountDoc of accountsSnapshot.docs) {
      // Get the notes subcollection for this account
      const notesSnapshot = await accountDoc.ref.collection('notes').get();

      notesSnapshot.docs.forEach((noteDoc) => {
        const noteData = noteDoc.data();

        // Filter notes that match our criteria
        if (doctorId && noteData.doctorId !== doctorId) return;
        if (clientId && noteData.clientId !== clientId) return;
        if (status && noteData.status !== status) return;

        // Convert Firestore Timestamp to milliseconds if needed
        const timestamp = noteData.timestamp?.toMillis?.() || noteData.timestamp || Date.now();

        allAppointments.push({
          id: noteDoc.id,
          accountId: accountDoc.id,
          data: {
            ...noteData,
            timestamp: timestamp, // Ensure timestamp is a number in milliseconds
          },
        });
      });
    }

    // Sort by timestamp descending
    allAppointments.sort((a, b) => {
      const bTime = b.data.timestamp || 0;
      const aTime = a.data.timestamp || 0;
      return bTime - aTime;
    });

    if (allAppointments.length === 0) {
      return NextResponse.json(
        {
          success: true,
          appointments: [],
          count: 0,
        },
        { status: 200 }
      );
    }

    // Apply limit
    const appointments = allAppointments.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        appointments,
        count: appointments.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
