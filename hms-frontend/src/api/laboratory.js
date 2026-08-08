import client from "./client";

export const listLabCatalog = () => client.get("/laboratory/catalog").then((r) => r.data.data);
export const listLabRequests = (params) => client.get("/laboratory", { params }).then((r) => r.data.data);
export const requestLabTest = (payload) => client.post("/laboratory", payload).then((r) => r.data.data);
export const collectSample = (id) => client.patch(`/laboratory/${id}/collect-sample`).then((r) => r.data.data);
export const enterLabResult = (id, payload) => client.patch(`/laboratory/${id}/result`, payload).then((r) => r.data.data);
export const markReportReady = (id) => client.patch(`/laboratory/${id}/report-ready`).then((r) => r.data.data);
export const createLabCatalogItem = (payload) => client.post("/laboratory/catalog", payload).then((r) => r.data.data);