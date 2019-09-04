import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ props, component: Component, userToken, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (userToken !== undefined) {
          return (<Component userToken={userToken} {...routeProps} {...props} />);
        } else {
          return (<Redirect to='/auth'/>);
        }
      }}
    />
  );
};

export default PrivateRoute;
