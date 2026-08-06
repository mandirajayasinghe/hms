import client from "./client";

export const listInvoices = (params) => client.get("/billing", { params }).then((r) => r.data.data);
export const getInvoice = (id) => client.get(`/billing/${id}`).then((r) => r.data.data);
export const createInvoice = (payload) => client.post("/billing", payload).then((r) => r.data.data);
export const recordPayment = (id, payload) => client.post(`/billing/${id}/payments`, payload).then((r) => r.data.data);