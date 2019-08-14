import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import AppliedRoute from './components/AppliedRoute';
import ContentContainer from './containers/ContentContainer';
import Four0Four from './containers/Four0Four';

function Routes(props) {
  const { childProps } = props;
  let defaultComponent = undefined;
  const routes = childProps.pages.map((meta) => {
    const { fileName, isDefault } = meta;
    // remove .md
    const trimmed = fileName.slice(0, -3);
    const tPath = `/${trimmed}`;
    if (isDefault === true) {
      if (defaultComponent !== undefined) {
        throw new Error('Maximum of 1 default page allowed');
      }
      defaultComponent = <AppliedRoute key={trimmed} path={['/', 'home', '/home']} component={ContentContainer} props={{meta}} />;
    }
    return <AppliedRoute key={trimmed} path={tPath} component={ContentContainer} props={{meta}} />

  });
  return (
  <Switch>
    {routes}
    {
      (defaultComponent !== undefined) && defaultComponent
    }
    <Route component={Four0Four} />
  </Switch>);
}

export default withRouter(Routes);
