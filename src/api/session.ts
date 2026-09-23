import { apiDelete, apiGet, apiPost } from "./client";
import type { Engineer } from "./types";

export function getSession(): Promise<{ engineer: Engineer | null }> {
  return apiGet("/api/session");
}

export function login(
  engineerKey: string,
  password: string,
): Promise<{ engineer: Engineer }> {
  return apiPost("/api/session/login", {
    engineer_key: engineerKey,
    password,
  });
}

export function claimAccount(
  engineerKey: string,
  firstName: string,
  password: string,
): Promise<{ engineer: Engineer }> {
  return apiPost("/api/session/claim", {
    engineer_key: engineerKey,
    first_name: firstName,
    password,
  });
}

export function register(
  firstName: string,
  lastName: string,
  password: string,
): Promise<{ status: string; message: string }> {
  return apiPost("/api/session/register", {
    first_name: firstName,
    last_name: lastName,
    password,
  });
}

export function logout(): Promise<{ engineer: null }> {
  return apiDelete("/api/session");
}
