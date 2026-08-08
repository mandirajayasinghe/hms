import client from "./client";

export const login = (username, password) =>
  client.post("/auth/login", { username, password }).then((r) => r.data);

export const me = () => client.get("/auth/me").then((r) => r.data.data);

export const logout = () => client.post("/auth/logout");

export const changePassword = (currentPassword, newPassword) =>
  client.post("/auth/change-password", { currentPassword, newPassword }).then((r) => r.data);