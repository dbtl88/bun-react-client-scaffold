import { useContext } from 'react';
import { exchangeCodeForCookies } from './auth';
import AuthContext from '../components/utility/AuthContext';

export const useAuth = () => {
  const { userInfo, refresh } = useContext(AuthContext);

  const login = async (code: string) => {
    await exchangeCodeForCookies(code);
    await refresh()
  };

  return { userInfo, login };
};