export function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMinutes(date: Date, minutes: number) {
  var result = new Date(date);
  result.setTime(result.getTime() + minutes * 60 * 1000);
  return result;
}
