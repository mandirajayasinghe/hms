import client from "./client";

export const listPatients = (params) => client.get("/patients", { params }).then((r) => r.data.data);
export const getPatient = (id) => client.get(`/patients/${id}`).then((r) => r.data.data);
export const createPatient = (payload) => client.post("/patients", payload).then((r) => r.data.data);
export const updatePatient = (id, payload) => client.put(`/patients/${id}`, payload).then((r) => r.data.data);
export const getPatientHistory = (id) => client.get(`/patients/${id}/history`).then((r) => r.data.data);
export const uploadPatientDocument = (id, formData) =>
  client.post(`/patients/${id}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data.data);
export const listPatientDocuments = (id) => client.get(`/patients/${id}/documents`).then((r) => r.data.data);