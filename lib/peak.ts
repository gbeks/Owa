export function isPeakHour(): boolean {
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();
  const morningStart = 6 * 60 + 30;  // 06:30
  const morningEnd = 9 * 60 + 30;    // 09:30
  const eveningStart = 16 * 60 + 30; // 16:30
  const eveningEnd = 20 * 60 + 30;   // 20:30
  return (
    (time >= morningStart && time <= morningEnd) ||
    (time >= eveningStart && time <= eveningEnd)
  );
}
