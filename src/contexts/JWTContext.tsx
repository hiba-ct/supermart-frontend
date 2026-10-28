import React, {
  createContext,
  useEffect,
  useReducer
} from 'react';

import { jwtDecode } from 'jwt-decode';

// reducer
import {
  LOGIN,
  LOGOUT
} from 'contexts/auth-reducer/actions';

import authReducer from
  'contexts/auth-reducer/auth';

// components
import Loader from 'components/Loader';

// axios
import axios from 'axios';

// types
import {
  AuthProps,
  JWTContextType
} from 'types/auth';

const API_URL = import.meta.env.VITE_APP_API_URL;
// ======================================================
// INITIAL STATE
// ======================================================

const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};


// ======================================================
// VERIFY TOKEN
// ======================================================

const verifyToken = (
  token: string
): boolean => {

  if (!token) {
    return false;
  }

  try {

    const decoded: any =
      jwtDecode(token);

    if (!decoded.exp) {
      return false;
    }

    return (
      decoded.exp >
      Date.now() / 1000
    );

  } catch (error) {

    console.error(
      'Token verification error:',
      error
    );

    return false;
  }
};


// ======================================================
// SET SESSION
// ======================================================

const setSession = (
  token?: string | null
) => {

  if (token) {

    // Save supermarket JWT
    localStorage.setItem(
      'token',
      token
    );

    // Also keep serviceToken because
    // Able Pro may use it internally
    localStorage.setItem(
      'serviceToken',
      token
    );

    // Axios authorization
    axios.defaults.headers.common.Authorization =
      `Bearer ${token}`;

  } else {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'serviceToken'
    );

    localStorage.removeItem(
      'user'
    );

    localStorage.removeItem(
      'role'
    );

    delete axios
      .defaults
      .headers
      .common
      .Authorization;
  }
};


// ======================================================
// CONTEXT
// ======================================================

const JWTContext =
  createContext<JWTContextType | null>(
    null
  );


// ======================================================
// JWT PROVIDER
// ======================================================

export const JWTProvider = ({
  children
}: {
  children: React.ReactElement;
}) => {

  const [
    state,
    dispatch
  ] = useReducer(
    authReducer,
    initialState
  );


  // ====================================================
  // INITIALIZE AUTH
  // ====================================================

  useEffect(() => {

    const init = async () => {

      try {

        const token =
          localStorage.getItem(
            'token'
          );

        const storedUser =
          localStorage.getItem(
            'user'
          );


        // ----------------------------------------------
        // NO TOKEN
        // ----------------------------------------------

        if (
          !token ||
          !verifyToken(token)
        ) {

          setSession(null);

          dispatch({
            type: LOGOUT
          });

          return;
        }


        // ----------------------------------------------
        // TOKEN EXISTS
        // ----------------------------------------------

        setSession(token);


        let user = null;

        if (storedUser) {

          user =
            JSON.parse(
              storedUser
            );
        }


        // ----------------------------------------------
        // LOGIN STATE
        // ----------------------------------------------

        dispatch({
          type: LOGIN,

          payload: {

            isLoggedIn: true,

            user: user
          }
        });

      } catch (error) {

        console.error(
          'Auth initialization error:',
          error
        );

        setSession(null);

        dispatch({
          type: LOGOUT
        });

      } finally {

        // IMPORTANT
        // Tell Able Pro authentication
        // initialization is complete

        dispatch({
          type: 'INITIALIZE'
        });
      }
    };


    init();

  }, []);


  // ====================================================
  // LOGIN
  // ====================================================

  const login = async (
    email: string,
    password: string
  ) => {

    try {

      console.log(
        '================================'
      );

      console.log(
        'SUPERMARKET LOGIN'
      );

      console.log(
        'Email:',
        email
      );


      // ----------------------------------------------
      // CALL YOUR SUPERMARKET SERVER
      // ----------------------------------------------
const response = await axios.post(
  `${API_URL}/api/auth/login`,
  {
    email,
    password
  }
);


      console.log(
        'SERVER RESPONSE:',
        response.data
      );


      const {
        token,
        user
      } = response.data;


      // ----------------------------------------------
      // CHECK SERVER RESPONSE
      // ----------------------------------------------

      if (
        !response.data.success ||
        !token
      ) {

        throw new Error(
          response.data.message ||
          'Login failed'
        );
      }


      // ----------------------------------------------
      // SAVE SESSION
      // ----------------------------------------------

      setSession(token);


      // ----------------------------------------------
      // SAVE USER
      // ----------------------------------------------

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );


      // ----------------------------------------------
      // SAVE ROLE
      // ----------------------------------------------

      localStorage.setItem(
        'role',
        user.role
      );


      console.log(
        'Token saved successfully'
      );

      console.log(
        'User:',
        user
      );

      console.log(
        'Role:',
        user.role
      );


      // ----------------------------------------------
      // UPDATE REACT AUTH STATE
      // ----------------------------------------------

      dispatch({

        type: LOGIN,

        payload: {

          isLoggedIn: true,

          user
        }
      });


      console.log(
        'LOGIN STATE UPDATED'
      );

      console.log(
        '================================'
      );


      // Return response to AuthLogin
      return response.data;


    } catch (error: any) {

      console.error(
        '================================'
      );

      console.error(
        'SUPERMARKET LOGIN ERROR'
      );

      console.error(
        error
      );

      console.error(
        error?.response?.data
      );

      console.error(
        '================================'
      );


      // ----------------------------------------------
      // SHOW BACKEND ERROR
      // ----------------------------------------------

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed';


      throw new Error(
        message
      );
    }
  };


  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {

    console.log(
      'Logging out...'
    );

    setSession(null);

    dispatch({
      type: LOGOUT
    });
  };


  // ====================================================
  // REGISTER
  // ====================================================

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {

    try {
const response = await axios.post(
  `${API_URL}/api/auth/register`,
  {
    name: `${firstName} ${lastName}`,
    email,
    password,
    role: 'admin'
  }
);

      console.log(
        'Register response:',
        response.data
      );


      if (
        !response.data.success
      ) {

        throw new Error(
          response.data.message ||
          'Registration failed'
        );
      }


      return response.data;


    } catch (error: any) {

      console.error(
        'Register error:',
        error
      );

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed'
      );
    }
  };


  // ====================================================
  // RESET PASSWORD
  // ====================================================

  const resetPassword = async (
    email: string
  ) => {

    console.log(
      'Reset password:',
      email
    );
  };


  // ====================================================
  // UPDATE PROFILE
  // ====================================================

  const updateProfile = () => {

    console.log(
      'Update profile'
    );
  };


  // ====================================================
  // LOADER
  // ====================================================

  if (
    state.isInitialized !== undefined &&
    !state.isInitialized
  ) {

    return <Loader />;
  }


  // ====================================================
  // PROVIDER
  // ====================================================

  return (

    <JWTContext.Provider
      value={{
        ...state,

        login,

        logout,

        register,

        resetPassword,

        updateProfile
      }}
    >

      {children}

    </JWTContext.Provider>
  );
};


export default JWTContext;