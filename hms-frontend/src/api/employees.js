import client from "./client";

export const listEmployees = () => client.get("/employees").then((r) => r.data.data);
export const createEmployee = (payload) => client.post("/employees", payload).then((r) => r.data.data);
export const markAttendance = (payload) => client.post("/employees/attendance", payload).then((r) => r.data.data);
export const listLeaves = () => client.get("/employees/leaves").then((r) => r.data.data);
export const decideLeave = (id, status) => client.patch(`/employees/leaves/${id}`, { status }).then((r) => r.data.data);