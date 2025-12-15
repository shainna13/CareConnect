// app/src/lib/hooks/useSchedules.ts
// Custom hook for managing doctor schedules

import { useState, useCallback } from 'react';
import { db } from '@/app/src/lib/firebase/client';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

interface TimeSlot {
  time: string;
  status: 'available' | 'booked';
}

export const useSchedules = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available slots for a specific date
  const fetchScheduleForDate = useCallback(
    async (doctorId: string, dateKey: string): Promise<TimeSlot[]> => {
      setLoading(true);
      setError(null);
      try {
        const scheduleRef = doc(db, 'schedules', doctorId, 'dates', dateKey);
        const scheduleDoc = await getDoc(scheduleRef);

        if (scheduleDoc.exists()) {
          return scheduleDoc.data().slots || [];
        }
        return [];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Fetch schedule error:', message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch all schedules for a doctor
  const fetchAllSchedules = useCallback(
    async (doctorId: string): Promise<Record<string, TimeSlot[]>> => {
      setLoading(true);
      setError(null);
      try {
        const datesCollectionRef = collection(db, 'schedules', doctorId, 'dates');
        const snapshot = await getDocs(datesCollectionRef);

        const schedules: Record<string, TimeSlot[]> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const dateKey = doc.id; // The document ID is the dateKey
          schedules[dateKey] = data.slots || [];
        });

        return schedules;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Fetch all schedules error:', message);
        return {};
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Save schedule for a specific date (also updates doctor info in parent document)
  const saveScheduleForDate = useCallback(
    async (doctorId: string, dateKey: string, slots: TimeSlot[], doctorName?: string, doctorSpecialty?: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        // Save to the subcollection (dates)
        const scheduleRef = doc(db, 'schedules', doctorId, 'dates', dateKey);
        await setDoc(scheduleRef, {
          slots,
          updatedAt: Timestamp.now(),
        });

        // Update parent document with doctor info (only if doctorName is provided)
        const parentDocRef = doc(db, 'schedules', doctorId);
        const parentDocSnapshot = await getDoc(parentDocRef);
        
        if (!parentDocSnapshot.exists() && doctorName) {
          // Create parent document with doctor info if it doesn't exist
          await setDoc(parentDocRef, {
            doctorId,
            name: doctorName,
            specialty: doctorSpecialty || '',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } else if (parentDocSnapshot.exists() && doctorName) {
          // Update existing parent document
          await updateDoc(parentDocRef, {
            name: doctorName,
            specialty: doctorSpecialty || '',
            updatedAt: Timestamp.now(),
          });
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Save schedule error:', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Book a time slot (mark as booked)
  const bookTimeSlot = useCallback(
    async (doctorId: string, dateKey: string, time: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const scheduleRef = doc(db, 'schedules', doctorId, 'dates', dateKey);
        const scheduleDoc = await getDoc(scheduleRef);

        if (!scheduleDoc.exists()) {
          setError('Schedule not found');
          return false;
        }

        const slots = scheduleDoc.data().slots || [];
        const updatedSlots = slots.map((slot: TimeSlot) =>
          slot.time === time ? { ...slot, status: 'booked' } : slot
        );

        await updateDoc(scheduleRef, { slots: updatedSlots });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Book time slot error:', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Release a time slot (mark as available again)
  const releaseTimeSlot = useCallback(
    async (doctorId: string, dateKey: string, time: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const scheduleRef = doc(db, 'schedules', doctorId, 'dates', dateKey);
        const scheduleDoc = await getDoc(scheduleRef);

        if (!scheduleDoc.exists()) {
          setError('Schedule not found');
          return false;
        }

        const slots = scheduleDoc.data().slots || [];
        const updatedSlots = slots.map((slot: TimeSlot) =>
          slot.time === time ? { ...slot, status: 'available' } : slot
        );

        await updateDoc(scheduleRef, { slots: updatedSlots });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Release time slot error:', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Apply schedule to multiple dates (default schedule)
  const applyScheduleToMultipleDates = useCallback(
    async (doctorId: string, dateKeys: string[], slots: TimeSlot[], doctorName?: string, doctorSpecialty?: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        // Save to first date with doctor info, then to remaining dates
        const promises = dateKeys.map((dateKey, index) =>
          saveScheduleForDate(doctorId, dateKey, slots, index === 0 ? doctorName : undefined, index === 0 ? doctorSpecialty : undefined)
        );
        await Promise.all(promises);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Apply schedule error:', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [saveScheduleForDate]
  );

  return {
    loading,
    error,
    fetchScheduleForDate,
    fetchAllSchedules,
    saveScheduleForDate,
    bookTimeSlot,
    releaseTimeSlot,
    applyScheduleToMultipleDates,
  };
};
