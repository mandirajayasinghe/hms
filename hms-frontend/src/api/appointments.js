import client from "./client";

export const listAppointments = (params) => client.get("/appointments", { params }).then((r) => r.data.data);
export const createAppointment = (payload) => client.post("/appointments", payload).then((r) => r.data.data);
export const cancelAppointment = (id) => client.patch(`/appointments/${id}/cancel`).then((r) => r.data.data);
export const rescheduleAppointment = (id, scheduledAt) =>
  client.patch(`/appointments/${id}/reschedule`, { scheduledAt }).then((r) => r.data.data);