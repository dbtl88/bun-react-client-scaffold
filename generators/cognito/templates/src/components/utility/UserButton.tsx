import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";

export default function UserButton() {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const [userInfoString, setUserInfoString] = useState("User: None");

  const goToLoginPage = () => {
    navigate("/login");
  };

  useEffect(() => {
    if (userInfo.user?.email) {
      setUserInfoString(truncateString(userInfo.user.email, 8));
    }
  }, [userInfo]);

  // useEffect(() => {
  //   console.log(`Re-rendered UserButton. UserInfo is: ${JSON.stringify(userInfo)}`)
  // },)
  
  return (
    <div className={"btn btn-secondary w-full sm:w-24"} onClick={goToLoginPage}>
      {userInfoString}
    </div>
  );
}

function truncateString(str: string, num: number) {
  if (str.length > num) {
    return "User: " + str.slice(0, num) + "...";
  } else {
    return str;
  }
}
