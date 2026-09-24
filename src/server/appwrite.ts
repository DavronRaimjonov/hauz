import "@tanstack/react-start/server-only";

import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";
import { Account, Client, Functions } from "node-appwrite";
import { z } from "zod";

const env = z
  .object({
    APPWRITE_ENDPOINT: z.url(),
    APPWRITE_PROJECT_ID: z.string().min(1),
    APPWRITE_API_KEY: z.string().min(1),
    APPWRITE_FUNCTION_ID: z.string().min(1),
  })
  .parse(process.env);

export const FUNCTION_ID = env.APPWRITE_FUNCTION_ID;

function baseClient() {
  return new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID);
}

export function createAdminClient() {
  const client = baseClient().setKey(env.APPWRITE_API_KEY);

  return { account: new Account(client) };
}

export function createSessionClient(secret: string) {
  const client = baseClient().setSession(secret);

  return { account: new Account(client), functions: new Functions(client) };
}

const SESSION_COOKIE = "hauz_session";

export function getSessionSecret() {
  return getCookie(SESSION_COOKIE);
}

export function setSessionCookie(secret: string, expires: Date) {
  setCookie(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
