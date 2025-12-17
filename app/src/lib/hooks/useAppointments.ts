// app/src/lib/hooks/useAppointments.ts
// Custom hook for managing appointments with direct Firebase queries

import { useState, useCallback } from 'react';
import { db } from '@/app/src/lib/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { AppointmentRequest, AppointmentResponse } from '@/app/src/lib/types/appointment';

export const useAppointments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit appointment request (Patient) - Direct Firebase
  const submitAppointment = useCallback(
    async (appointmentData: Omit<AppointmentRequest, 'timestamp' | 'status'>, clientId: string): Promise<AppointmentResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const appointmentRef = collection(db, 'accounts', clientId, 'notes');
        const timestamp = Date.now();
        const docRef = await addDoc(appointmentRef, {
          ...appointmentData,
          timestamp: serverTimestamp(),
          approved: 'false',
        });

        return {
          id: docRef.id,
          data: {
            ...appointmentData,
            timestamp: timestamp,
            approved: 'false',
          } as AppointmentRequest,
          createdAt: timestamp,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Submit appointment error:', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Respond to appointment (Doctor) - Direct Firebase (UPDATE accounts/{userId}/notes)
  const respondToAppointment = useCallback(
    async (
      appointmentId: string,
      action: 'accept' | 'reject',
      clientId: string,
      rejectionReason?: string,
      bookedDateKey?: string,
      bookedTime?: string
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        // Appointments are stored in accounts/{clientId}/notes/{appointmentId}
        const appointmentRef = doc(db, 'accounts', clientId, 'notes', appointmentId);
        
        const updateData: any = {
          approved: action === 'accept' ? 'true' : 'false',
          status: action === 'accept' ? 'Confirmed' : 'Rejected',
        };

        if (rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }

        // Add booking details if provided
        if (action === 'accept') {
          if (bookedDateKey) {
            updateData.dateKey = bookedDateKey;
          }
          if (bookedTime) {
            updateData.time = bookedTime;
          }
        }

        await updateDoc(appointmentRef, updateData);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Respond to appointment error:', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch appointments - Direct Firebase with optimized queries (from accounts > notes)
  const fetchAppointments = useCallback(
    async (filters: {
      doctorId?: string;
      clientId?: string;
      status?: 'Pending' | 'Confirmed' | 'Rejected' | 'Completed';
      limit?: number;
    }): Promise<AppointmentResponse[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const allAppointments: AppointmentResponse[] = [];
        const accountsRef = collection(db, 'accounts');
        const accountsSnapshot = await getDocs(accountsRef);

        // Iterate through each account and get their notes
        for (const accountDoc of accountsSnapshot.docs) {
          const notesRef = collection(accountDoc.ref, 'notes');
          const notesSnapshot = await getDocs(notesRef);

          notesSnapshot.docs.forEach((noteDoc) => {
            const noteData = noteDoc.data() as AppointmentRequest;

            // Filter notes based on criteria
            if (filters.doctorId && noteData.assignedTo !== filters.doctorId) return;
            if (filters.clientId && noteData.clientId !== filters.clientId) return;

            // Convert Firestore Timestamp to milliseconds if needed
            let timestamp = noteData.timestamp;
            if (timestamp && typeof timestamp === 'object' && 'toMillis' in timestamp) {
              timestamp = (timestamp as any).toMillis();
            }

            allAppointments.push({
              id: noteDoc.id,
              data: { ...noteData, timestamp } as AppointmentRequest,
              createdAt: timestamp || Date.now(),
            });
          });
        }

        // Sort by timestamp descending (client-side)
        const sorted = allAppointments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Apply limit if specified
        let result = sorted;
        if (filters.limit) {
          result = sorted.slice(0, filters.limit);
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Fetch appointments error:', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Real-time listener for appointments (optional - for live updates, from accounts > notes)
  const subscribeToAppointments = useCallback(
    (
      filters: { doctorId?: string; clientId?: string },
      onUpdate: (appointments: AppointmentResponse[]) => void,
      onError?: (error: Error) => void
    ): (() => void) => {
      try {
        const allAppointments: AppointmentResponse[] = [];
        const accountsRef = collection(db, 'accounts');
        
        // Subscribe to accounts collection changes
        const unsubscribe = onSnapshot(
          accountsRef,
          (accountsSnapshot) => {
            const updated: AppointmentResponse[] = [];
            let processedCount = 0;

            accountsSnapshot.docs.forEach((accountDoc) => {
              const notesRef = collection(accountDoc.ref, 'notes');
              
              // Subscribe to each account's notes
              const noteUnsubscribe = onSnapshot(
                notesRef,
                (notesSnapshot) => {
                  notesSnapshot.docs.forEach((noteDoc) => {
                    const noteData = noteDoc.data() as AppointmentRequest;

                    // Filter based on criteria
                    if (filters.doctorId && noteData.assignedTo !== filters.doctorId) return;
                    if (filters.clientId && noteData.clientId !== filters.clientId) return;

                    let timestamp = noteData.timestamp;
                    if (timestamp && typeof timestamp === 'object' && 'toMillis' in timestamp) {
                      timestamp = (timestamp as any).toMillis();
                    }

                    updated.push({
                      id: noteDoc.id,
                      data: { ...noteData, timestamp } as AppointmentRequest,
                      createdAt: timestamp || Date.now(),
                    });
                  });

                  processedCount++;
                  // After all accounts are processed, sort and update
                  if (processedCount === accountsSnapshot.docs.length) {
                    const sorted = updated.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    onUpdate(sorted);
                  }
                }
              );
            });
          },
          (error) => {
            console.error('Appointment subscription error:', error);
            if (onError) onError(error as Error);
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error('Setup subscription error:', err);
        return () => {};
      }
    },
    []
  );

  return {
    loading,
    error,
    submitAppointment,
    respondToAppointment,
    fetchAppointments,
    subscribeToAppointments,
  };
};
