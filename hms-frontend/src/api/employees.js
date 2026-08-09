import client from "./client";

export const listEmployees = () => client.get("/employees").then((r) => r.data.data);
export const registerEmployee = (payload) => client.post("/employees/register", payload).then((r) => r.data.data);
export const updateEmployee = (id, payload) => client.put(`/employees/${id}`, payload).then((r) => r.data.data);
export const markAttendance = (payload) => client.post("/employees/attendance", payload).then((r) => r.data.data);
export const getAttendance = (employeeId) => client.get(`/employees/${employeeId}/attendance`).then((r) => r.data.data);
export const requestLeave = (payload) => client.post("/employees/leaves", payload).then((r) => r.data.data);
export const listLeaves = () => client.get("/employees/leaves").then((r) => r.data.data);
export const decideLeave = (id, status) => client.patch(`/employees/leaves/${id}`, { status }).then((r) => r.data.data);