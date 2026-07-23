/**
 * „Dzień" w Wobble jest dniem w strefie użytkownika, nie w UTC — inaczej ktoś
 * planujący wieczorem dostałby wieżę na jutro. Ta funkcja jest jedynym miejscem,
 * które zamienia moment w czasie na `local_date` zapisywaną w bazie.
 */
export function localDateFor(timezone: string, now: Date = new Date()): string {
  try {
    // en-CA formatuje jako YYYY-MM-DD, czyli dokładnie format kolumny `date`.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    // Nieznana strefa (np. literówka w profilu) nie może wywalić całego ekranu.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  }
}
