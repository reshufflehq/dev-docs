import '@reshuffle/code-transform/macro';
import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '@reshuffle/react-auth';
import { checkEmail } from '../../backend/contentBackend';

/**
 * Standard React-router route that requires  reshuffle identity
 */
const PrivateRoute = ({ props, component: Component, ...rest }) => {
  const { authenticated } = useAuth();
  const [email, setEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (authenticated) {
        const value = await checkEmail();

        setEmail(value);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [authenticated]);

  if (authenticated === undefined) return null;

  return (
    <Route
      {...rest}
      render={routeProps => {
        if (authenticated && email) {
          return <Component {...routeProps} {...props} />;
        } else if (!authenticated) {
          // if authenticated is false, redirect to auth page
          return <Redirect to='/auth' />;
        }
      }}
    />
  );
};

export default PrivateRoute;
