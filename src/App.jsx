import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';

import DevSite from './containers/DevSite';
import Auth from './containers/Auth';
import Editor from './containers/Editor';
import Admin from './containers/Admin';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { userToken: undefined };
  }

  async componentDidMount() {
    // if the token doesn't exist, it will be set to null
    this.setState({ userToken: localStorage.getItem('userToken') });
  }

  /**
   * Store a user token for future sessions
   */
  storeUserToken = (userToken) => {
    localStorage.setItem('userToken', userToken);
    this.setState({ userToken });
  }

  render() {
    const childProps = {
      userToken: this.state.userToken,
      storeUserToken: this.storeUserToken,
    };

    // If the route is an auth or admin route, display it.
    // Otherwise, defer to the DevSite nested routing
    if (this.state.userToken !== undefined) {
      return (
        <Switch>
          <PrivateRoute exact path='/editor'
                        component={Editor}
                        userToken={childProps.userToken}
                        {...this.props}
                        {...childProps}
          />
          <PrivateRoute path='/admin'
                        component={Admin}
                        userToken={childProps.userToken}
                        {...this.props}
                        {...childProps}
          />
          <Route path='/auth' render={
              (props) => <Auth {...props} {...childProps} />
            }
          />
          { /* catch all for unknown routes */ }
          <Route component={DevSite} props={this.props} />
        </Switch>
      );
    } else {
      return null;
    }
  }
}

export default withRouter(App);
