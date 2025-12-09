export const formatTime = (timeInput: any) => {
  if (!timeInput) return 'N/A';
  const [hours, minutes] = timeInput.split(':');
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const m_padded = m < 10 ? '0' + m : m;
  return `${h12}:${m_padded} ${ampm}`;
};