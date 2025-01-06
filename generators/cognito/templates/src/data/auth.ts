import { dataUrl } from "../utility/general";

export interface AuthInfo {
  authenticated: boolean;
  user: {
    userId?: string;
    email?: string;
  };
}

export async function exchangeCodeForCookies(code: string) {
  const url = `${dataUrl}/auth/login-code?code=${code}`;
  await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "include",
  });
}

export async function callAuthenticatedRoute() {
  const url = `${dataUrl}/auth/authenticated`;
  await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "include",
  });
}

export async function checkAuthStatus(): Promise<AuthInfo> {
  const url = `${dataUrl}/auth/status`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "include",
  });
  const status = (await response.json()) as AuthInfo;
  console.log(`User status: ${status}`);
  return status;
}

export async function logOut() {
  const url = `${dataUrl}/auth/logout`;
  await fetch(url, {
    method: "GET",
    mode: "cors",
  });
}
