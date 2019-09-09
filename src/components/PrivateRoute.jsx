import React from 'react';
import { Route, Redirect } from 'react-router-dom';

/**
 * Standard React-router route that requires a userToken
 */
const PrivateRoute = ({ props, component: Component, userToken, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (userToken !== undefined) {
          return (<Component userToken={userToken} {...routeProps} {...props} />);
        } else {
          // if userToken is not found, redirect to auth page
          return (<Redirect to='/auth'/>);
        }
      }}
    />
  );
};

export default PrivateRoute;
