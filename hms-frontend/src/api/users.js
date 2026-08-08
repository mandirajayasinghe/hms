import client from "./client";

export const listUsers = () => client.get("/users").then((r) => r.data.data);
export const createUser = (payload) => client.post("/users", payload).then((r) => r.data.data);
export const updateUser = (id, payload) => client.put(`/users/${id}`, payload).then((r) => r.data.data);
export const resetUserPassword = (id, newPassword) =>
  client.post(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data);
export const deactivateUser = (id) => client.delete(`/users/${id}`).then((r) => r.data);