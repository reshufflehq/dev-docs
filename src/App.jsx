import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import DevSite from './containers/DevSite';
import Auth from './containers/Auth';
import Editor from './containers/Editor';
import Admin from './containers/Admin';

class App extends Component {

  render() {
    return (
      <Switch>
        <PrivateRoute exact path='/editor' component={Editor} />
        <PrivateRoute path='/admin' component={Admin} />
        <Route path='/auth' render={props => <Auth {...props} />} />
        <Route component={DevSite} props={this.props} />
      </Switch>
    );
  }
}

export default withRouter(App);
