// app/api/chats/[chatId]/lastMessage/route.ts
// Fetch the last message from a chat's convo subcollection

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/src/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      );
    }

    // Fetch last message from convo subcollection
    const convoSnapshot = await adminDb
      .collection('chats')
      .doc(chatId)
      .collection('convo')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (convoSnapshot.empty) {
      return NextResponse.json(
        { message: null },
        { status: 200 }
      );
    }

    const lastMsg = convoSnapshot.docs[0].data();
    const timestamp = lastMsg.timestamp?.toMillis?.() || lastMsg.timestamp || Date.now();

    return NextResponse.json(
      {
        message: {
          id: convoSnapshot.docs[0].id,
          type: lastMsg.type,
          message: lastMsg.message,
          medicineName: lastMsg.medicineName,
          timestamp: timestamp,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching last message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch last message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
