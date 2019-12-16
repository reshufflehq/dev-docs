import '@reshuffle/code-transform/macro';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '@reshuffle/react-auth';

/**
 * Standard React-router route that requires  reshuffle identity
 */
const PrivateRoute = ({ props, component: Component, ...rest }) => {
  const { authenticated } = useAuth();
  if (authenticated === undefined) return null;

  return (
    <Route
      {...rest}
      render={routeProps => {
        if (authenticated) {
          return <Component {...routeProps} {...props} />;
        } else {
          // if authenticated is false, redirect to auth page
          return <Redirect to='/auth' />;
        }
      }}
    />
  );
};

export default PrivateRoute;
