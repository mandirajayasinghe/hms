import client from "./client";

export const getDashboard = () => client.get("/reports/dashboard").then((r) => r.data.data);
export const getRevenueReport = (params) => client.get("/reports/revenue", { params }).then((r) => r.data.data);
export const getPharmacyReport = () => client.get("/reports/pharmacy").then((r) => r.data.data);
export const getLaboratoryReport = () => client.get("/reports/laboratory").then((r) => r.data.data);
export const getStaffReport = () => client.get("/reports/staff").then((r) => r.data.data);
export const getAppointmentReport = () => client.get("/reports/appointments").then((r) => r.data.data);