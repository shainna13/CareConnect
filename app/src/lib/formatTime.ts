export const formatTime = (timeInput: any) => {
  if (!timeInput) return 'N/A';
  
  // Handle Date objects or Firestore Timestamps
  let date: Date;
  if (timeInput instanceof Date) {
    date = timeInput;
  } else if (timeInput.toDate && typeof timeInput.toDate === 'function') {
    // Firestore Timestamp
    date = timeInput.toDate();
  } else if (typeof timeInput === 'string' && timeInput.includes(':')) {
    // Handle "HH:MM" format
    const [hours, minutes] = timeInput.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const m_padded = m < 10 ? '0' + m : m;
    return `${h12}:${m_padded} ${ampm}`;
  } else {
    return 'N/A';
  }
  
  // Format Date object as "HH:MM AM/PM"
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const m_padded = minutes < 10 ? '0' + minutes : minutes;
  return `${h12}:${m_padded} ${ampm}`;
};