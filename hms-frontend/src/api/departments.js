import client from "./client";

export const listDepartments = () => client.get("/departments").then((r) => r.data.data);
export const createDepartment = (payload) => client.post("/departments", payload).then((r) => r.data.data);
