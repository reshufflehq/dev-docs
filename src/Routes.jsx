import React from 'react';

import { Route, Switch, withRouter } from 'react-router-dom';
import AppliedRoute from './components/AppliedRoute';
import DynamicContentContainer from './containers/DynamicContentContainer';
import Four0Four from './containers/Four0Four';

function Routes(props) {
  const { childProps } = props;
  let defaultFound = false;

  // create a route for every markdown page that
  // is provided by the backend
  const routes = childProps.pages.map((meta) => {
    const { route, isDefault } = meta;
    const routePaths = [`/${route}`];
    if (isDefault) {
      // only allow 1 default page
      if (defaultFound) {
        throw new Error('Maximum of 1 default page allowed');
      }
      defaultFound = true;
      routePaths.push(...['/', 'home', '/home']);
    }
    return <AppliedRoute key={route}
                         exact path={routePaths}
                         component={DynamicContentContainer}
                         props={{meta}}
           />

  });
  return (
    <Switch>
      {routes}
      { /* catch all for unknown routes */ }
      <Route component={Four0Four} />
    </Switch>
  );
}

export default withRouter(Routes);
