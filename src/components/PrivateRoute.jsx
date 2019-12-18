import '@reshuffle/code-transform/macro';
import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '@reshuffle/react-auth';
import { validateUser } from '../../backend/authBackend';

/**
 * Standard React-router route that requires  reshuffle identity
 */
const PrivateRoute = ({ props, component: Component, ...rest }) => {
  const { authenticated } = useAuth();
  const [email, setEmail] = useState(false);
  const url = window.location.href;
  const urlArr = url.split('/');

  useEffect(() => {
    const fetchData = async () => {
      const value = await validateUser();
      if (value.error) {
        setEmail(false);
      } else {
        setEmail(value);
      }
    };
    fetchData();
  }, []);

  if (authenticated === undefined) {
    return null;
  }

  return (
    <Route
      {...rest}
      render={routeProps => {
        if (authenticated && email) {
          return <Component {...routeProps} {...props} />;
        } else if (authenticated && !email) {
          // if authenticated is false, redirect to auth page
          return <Redirect to='/' />;
        } else if (!authenticated) {
          // if authenticated is false, redirect to auth page
          return (
            <Redirect
              to={{
                pathname: '/auth',
                state: { path: urlArr[3] },
              }}
            />
          );
        }
      }}
    />
  );
};

export default PrivateRoute;
