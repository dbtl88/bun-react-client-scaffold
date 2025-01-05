import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { callAuthenticatedRoute } from "../data/auth";
import RedirectButton from "./utility/RedirectButton";
import { cognitoLoginUrl } from "../utility/general";
import LogoutButton from "./utility/LogoutButton";
import { useAuth } from "../data/useAuth";

export default function AuthPage() {
  const [loggedIn, setLoggedIn] = useState<Boolean>(false);
  const { userInfo, login } = useAuth();
  const [status, setStatus] = useState<string | undefined>(
    "Not authenticated."
  );
  const [authStatus, setAuthStatus] = useState<string>("none");
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      login(code);
      searchParams.delete("code");
      setSearchParams(searchParams);
    }
    callAuthenticatedRoute();
  }, [code, login]);

  // NB: Separate useEffect hook for updating these bits of local state, as otherwise there is nothing to trigger the re-render, as putting these in the other useEffect would capture the old userInfo value, at the point it gets invoked. The new value would be available here through AuthContext, but a re-render doesn't get triggered, because it's not consumed anywhere in the return statement.

  useEffect(() => {
    setAuthStatus(JSON.stringify(userInfo));
    setLoggedIn(userInfo.authenticated);
    setStatus(userInfo.authenticated ? "Authenticated." : "Not authenticated.");
  }, [userInfo]);

  return (
    <div className="justify-center space-y-6">
      {!loggedIn && <RedirectButton url={cognitoLoginUrl} text="Login" />}
      {loggedIn && <LogoutButton />}
      <div className="text-xl">{status}</div>
      <div className="text">Auth status: {authStatus}</div>
    </div>
  );
}
