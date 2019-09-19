import React from 'react';

import { Route, Switch, withRouter } from 'react-router-dom';
import AppliedRoute from './components/AppliedRoute';
import DynamicContentContainer from './containers/DynamicContentContainer';
import Four0Four from './containers/Four0Four';

function Routes({ childProps }) {
  const { contentMeta, homeRoute } = childProps.meta;

  // create a route for every markdown page that
  // is provided by the backend
  const routes = contentMeta.map((meta) => {
    const { route } = meta;
    const routePaths = [`/${route}`];
    if (route === homeRoute) {
      routePaths.push('/', '/home');
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
