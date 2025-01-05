import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { AuthInfo, checkAuthStatus } from "../../data/auth";

const AuthContext = createContext<{
  userInfo: AuthInfo;
  refresh: () => Promise<void>;
}>({
  userInfo: { authenticated: false, user: {} },
  refresh: () => Promise.resolve(),
});

export const AuthProvider = (props: PropsWithChildren) => {
  const [userInfo, setUserInfo] = useState<AuthInfo>({
    authenticated: false,
    user: {},
  });

  const checkUserInfo = async () => {
    const newUserInfo = await checkAuthStatus();
    console.log(`New userInfo: ${JSON.stringify(newUserInfo)}`);
    setUserInfo(newUserInfo);
  };

  useEffect(() => {
    checkUserInfo();
  }, []);

  useEffect(() => {
    console.log(
      `Re-rendered main AuthContext. UserInfo is: ${JSON.stringify(userInfo)}`
    );
  }, [userInfo]);

  return (
    <AuthContext.Provider
      value={{ userInfo: userInfo, refresh: checkUserInfo }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
