import client from "./client";

export const listMedicines = (params) => client.get("/pharmacy/medicines", { params }).then((r) => r.data.data);
export const createMedicine = (payload) => client.post("/pharmacy/medicines", payload).then((r) => r.data.data);
export const adjustStock = (id, payload) => client.patch(`/pharmacy/medicines/${id}/stock`, payload).then((r) => r.data.data);
export const processPrescription = (id) => client.post(`/pharmacy/prescriptions/${id}/process`).then((r) => r.data.data);