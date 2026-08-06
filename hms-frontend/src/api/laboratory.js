import client from "./client";

export const createMedicalRecord = (payload) => client.post("/medical-records", payload).then((r) => r.data.data);
export const addPrescription = (recordId, payload) =>
  client.post(`/medical-records/${recordId}/prescriptions`, payload).then((r) => r.data.data);
export const getPatientPrescriptions = (patientId) =>
  client.get(`/medical-records/patient/${patientId}/prescriptions`).then((r) => r.data.data);