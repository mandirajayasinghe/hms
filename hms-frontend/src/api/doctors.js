import client from "./client";

export const listDoctors = (params) => client.get("/doctors", { params }).then((r) => r.data.data);
export const getDoctor = (id) => client.get(`/doctors/${id}`).then((r) => r.data.data);
export const createDoctor = (payload) => client.post("/doctors", payload).then((r) => r.data.data);
export const registerDoctor = (payload) => client.post("/doctors/register", payload).then((r) => r.data.data);
export const updateDoctor = (id, payload) => client.put(`/doctors/${id}`, payload).then((r) => r.data.data);