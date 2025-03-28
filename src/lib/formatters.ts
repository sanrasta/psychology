import { formatInTimeZone } from "date-fns-tz";
import { format, intlFormat } from "date-fns";

export function formatEventDescription(durationInMinutes: number) {
  if (durationInMinutes < 60) {
    return `${durationInMinutes} Minutes`;
  }
  
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} Hour${hours > 1 ? "s" : ""}`;
  }
  
  return `${hours} Hour${hours > 1 ? "s" : ""} ${minutes} Minute${minutes > 1 ? "s" : ""}`;
}

export function formatTimezoneOffset(timezone: string) {
  const now = new Date();
  const offset = now.toLocaleString("en-US", { 
    timeZone: timezone, 
    timeZoneName: "short" 
  }).split(" ").pop();
  
  return offset;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
})

export function formatDate(date: Date) {
  return format(date, "EEEE, MMMM d, yyyy");
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  timeStyle: "short",
})

export function formatTimeString(date: Date) {
  return format(date, "h:mm a");
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date)
}