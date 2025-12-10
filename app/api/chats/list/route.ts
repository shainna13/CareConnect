// app/api/chats/list/route.ts
// Fetch all chats for a user

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/src/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Query chats where user is either doctor or client
    const chatsSnapshot = await adminDb.collection('chats')
      .where('doctor', '==', userId)
      .get();

    const chatsSnapshot2 = await adminDb.collection('chats')
      .where('client', '==', userId)
      .get();

    // Combine results
    const allChats: any[] = [];
    chatsSnapshot.docs.forEach(doc => {
      allChats.push({ id: doc.id, ...doc.data() });
    });
    chatsSnapshot2.docs.forEach(doc => {
      allChats.push({ id: doc.id, ...doc.data() });
    });

    // Remove duplicates (if any)
    const uniqueChats = Array.from(new Map(allChats.map(chat => [chat.id, chat])).values());

    // Fetch doctor and client names (use stored names or fetch from accounts)
    const chatsWithNames = await Promise.all(
      uniqueChats.map(async (chat) => {
        try {
          // If names already stored in chat, use them; otherwise fetch from accounts
          let doctorName = chat.doctorName;
          let clientName = chat.clientName;

          if (!doctorName || !clientName) {
            const doctorDoc = await adminDb.collection('accounts').doc(chat.doctor).get();
            const clientDoc = await adminDb.collection('accounts').doc(chat.client).get();

            if (!doctorName) {
              doctorName = doctorDoc.exists ? doctorDoc.data()?.name || 'Doctor' : 'Doctor';
            }
            if (!clientName) {
              clientName = clientDoc.exists ? clientDoc.data()?.name || 'Patient' : 'Patient';
            }
          }

          return {
            ...chat,
            doctorName,
            clientName,
          };
        } catch (error) {
          console.error(`Error fetching names for chat ${chat.id}:`, error);
          return {
            ...chat,
            doctorName: chat.doctorName || 'Doctor',
            clientName: chat.clientName || 'Patient',
          };
        }
      })
    );

    return NextResponse.json(
      { chats: chatsWithNames },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching chats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chats';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
