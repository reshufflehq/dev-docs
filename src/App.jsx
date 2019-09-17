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
    this.state = { userToken: null };
  }

  async componentDidMount() {
    // try and retrieve a previously stored user token
    // which will allow the client to visit protected
    // routes
    try {
      const userToken = localStorage.getItem('userToken');
      if (userToken !== null) {
        return this.setState({ userToken });
      }
    } catch (err) {
      console.error(err);
    }
    this.setState({ userToken: undefined });
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
    if (this.state.userToken !== null) {
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
