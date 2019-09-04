import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';

import './style/App.scss';

import DevSite from './containers/DevSite';
import Auth from './containers/Auth';
import Admin from './containers/Admin';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { userToken: undefined };
  }

  async componentDidMount() {
    // try and retrieve a previously stored user token
    // which will allow the client to visit protected
    // routes
    let userToken;
    try {
      userToken = localStorage.getItem('userToken');
      if (userToken === null) {
        userToken = undefined;
      }
    } catch (err) {
      // this is not actually an error
      console.error(err);
    }
    this.setState({ userToken });
  }

  /**
   * Store a user token for future user
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
    return (
      <Switch>
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
  }
}

export default withRouter(App);
