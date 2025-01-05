import { useContext } from "react";
import { logOut } from "../../data/auth";
import { cognitoLogoutUrl } from "../../utility/general";
import AuthContext from "./AuthContext";

export default function LogoutButton() {
  const authContext = useContext(AuthContext);

  const login = async () => {
    await logOut()
    authContext.refresh()
    window.location = cognitoLogoutUrl as any
  }

  return (
    <div className={"btn btn-primary w-full sm:w-24"} onClick={login}>
      Logout
    </div>
  );
}