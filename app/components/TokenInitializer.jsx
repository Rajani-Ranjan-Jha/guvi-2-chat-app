'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken, setLoading } from '@/app/redux/authSlice';
import { getTokenFromCookies } from '@/utils/tokenManager';


export default function TokenInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        
        // Get token from cookies
        const token = getTokenFromCookies();
        
        if (token) {
          const result = await validateNextAuthToken(token)
          console.log('validateNextAuthToken:',result)
          console.log("The token is verified ✅", token);
          dispatch(setToken(token));
        } else {
          console.log("No token found in cookies(initializer.jsx)");
        }
        
        dispatch(setLoading(false));
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}

<read_file>
<path>app/login/page.jsx</path>
</read_file>
