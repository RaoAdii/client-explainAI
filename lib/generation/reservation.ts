type ReservationError = { code?: string; message?: string };

export function reservationUnavailable(error: ReservationError): boolean {
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "PGRST202" || error.code === "42883" ||
    (message.includes("reserve_explanation") && (message.includes("not find") || message.includes("does not exist")));
}
