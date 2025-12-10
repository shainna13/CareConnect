// app/src/lib/hooks/useAppointments.ts
// Custom hook for managing appointments

import { useState, useCallback } from 'react';
import { AppointmentRequest, AppointmentResponse } from '@/app/src/lib/types/appointment';

export const useAppointments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit appointment request (Patient)
  const submitAppointment = useCallback(
    async (appointmentData: Omit<AppointmentRequest, 'timestamp' | 'status'>): Promise<AppointmentResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/appointments/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit appointment');
        }

        const data = await response.json();
        return data;
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

  // Respond to appointment (Doctor)
  const respondToAppointment = useCallback(
    async (
      appointmentId: string,
      action: 'accept' | 'reject',
      doctorId: string,
      rejectionReason?: string
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/appointments/respond', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId,
            action,
            doctorId,
            rejectionReason,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to ${action} appointment`);
        }

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

  // Fetch appointments
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
        const params = new URLSearchParams();

        if (filters.doctorId) params.append('doctorId', filters.doctorId);
        if (filters.clientId) params.append('clientId', filters.clientId);
        if (filters.status) params.append('status', filters.status);
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await fetch(`/api/appointments/fetch?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch appointments');
        }

        const data = await response.json();
        return data.appointments || [];
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

  return {
    loading,
    error,
    submitAppointment,
    respondToAppointment,
    fetchAppointments,
  };
};
