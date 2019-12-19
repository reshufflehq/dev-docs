import '@reshuffle/code-transform/macro';
import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '@reshuffle/react-auth';
import { validateUser } from '../../backend/authBackend';

/**
 * Standard React-router route that requires reshuffle identity
 */
const PrivateRoute = (props) => {
  const { component: Component, ...rest } = props;
  const { authenticated } = useAuth();
  const [email, setEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const value = await validateUser();
        setEmail(value);

      } catch (err) {
        console.error(err);
        setEmail(false)
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
          // if authenticated is false and the email is not the right domain, redirect to home page
          return <Redirect to='/' />;
        } else if (!authenticated) {
          // if authenticated is false, redirect to auth page, and pass the pathname so user can be redirected there once
          // user is logged in.
          return (
            <Redirect
              to={{
                pathname: '/auth',
                state: { path: props.location.pathname },
              }}
            />
          );
        }
      }}
    />
  );
};

export default PrivateRoute;
