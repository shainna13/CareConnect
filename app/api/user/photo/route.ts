// app/api/user/photo/route.ts
// Fetch user's photo

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

    // Fetch user document
    const userDoc = await adminDb.collection('accounts').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { photo: null },
        { status: 200 }
      );
    }

    const userData = userDoc.data();
    const photo = userData?.photo || null;

    return NextResponse.json(
      { photo },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user photo:', error);
    return NextResponse.json(
      { photo: null },
      { status: 200 }
    );
  }
}
