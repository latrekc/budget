export const monthNames = new Map([
  [1, "January"],
  [2, "February"],
  [3, "March"],
  [4, "April"],
  [5, "May"],
  [6, "June"],
  [7, "July"],
  [8, "August"],
  [9, "September"],
  [10, "October"],
  [11, "November"],
  [12, "December"],
]);

export function getUTCStartOfDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
  );
}

function getUTCDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getUTCStartOfDateString(date: Date): string {
  return getUTCDateString(getUTCStartOfDate(date));
}
