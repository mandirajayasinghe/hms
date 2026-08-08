import client from "./client";

export const listDoctors = (params) => client.get("/doctors", { params }).then((r) => r.data.data);
export const getDoctor = (id) => client.get(`/doctors/${id}`).then((r) => r.data.data);
export const createDoctor = (payload) => client.post("/doctors", payload).then((r) => r.data.data);
export const registerDoctor = (payload) => client.post("/doctors/register", payload).then((r) => r.data.data);
export const updateDoctor = (id, payload) => client.put(`/doctors/${id}`, payload).then((r) => r.data.data);
export const getDoctorSchedule = (id) => client.get(`/doctors/${id}/schedule`).then((r) => r.data.data);
export const setDoctorSchedule = (id, payload) => client.post(`/doctors/${id}/schedule`, payload).then((r) => r.data.data);