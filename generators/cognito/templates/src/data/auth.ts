import {
  cognitoTokenCallBody,
  cognitoTokenUrl,
  dataUrl,
} from "../utility/general";

interface TokenResponse {
  id_token: string,
  access_token: string,
  refresh_token: string,
  token_type: string,
  expires_in: number
}

export interface AuthInfo {
  authenticated: boolean
  user: {
    userId?: string
    email?: string
  }
}

export async function getTokens(code: string): Promise<TokenResponse> {
  const url = cognitoTokenUrl;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: cognitoTokenCallBody(code),
  });
  return await response.json() as TokenResponse
}

export async function exchangeTokensForCookies(tokens: TokenResponse) {
  const url = `${dataUrl}/login`;
  await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify(tokens)
  });
}

export async function exchangeCodeForCookies(code: string) {
  const url = `${dataUrl}/auth/login-code?code=${code}`;
  await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "include"
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
  const status = await response.json() as AuthInfo
  console.log(`User status: ${status}`)
  return status
}

export async function logOut() {
  const url = `${dataUrl}/auth/logout`;
  await fetch(url, {
    method: "GET",
    mode: "cors"
  });
}