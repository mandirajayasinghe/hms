import client from "./client";

export const listAdmissions = (params) => client.get("/admissions", { params }).then((r) => r.data.data);
export const createAdmission = (payload) => client.post("/admissions", payload).then((r) => r.data.data);
export const dischargePatient = (id) => client.patch(`/admissions/${id}/discharge`).then((r) => r.data.data);
export const listWards = () => client.get("/admissions/wards").then((r) => r.data.data);
export const listBeds = () => client.get("/admissions/beds").then((r) => r.data.data);