import '@binaris/shift-code-transform/macro';

import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { GoogleLogin } from 'react-google-login';
import { authenticateUser } from '../../backend/authBackend';

import '../style/Auth.scss';

const OAUTH_CLIENT_ID = '554280455378-k5n7nkfcla2ti51gi5j5u33chamvf3r9.apps.googleusercontent.com';

async function onSuccess({ tokenId }, storeUserToken) {
  try {
    const authToken = await authenticateUser(tokenId);
    // store the JWT
    storeUserToken(authToken);
  } catch (err) {
    console.error('Error encountered while authenticating');
    console.error(err);
  }
}

async function onFailure(err) {
  console.log('failed');
  console.log(err);
}


export default class Auth extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { storeUserToken, userToken } = this.props;
    if (OAUTH_CLIENT_ID === undefined ) {
      return (
        <div>
          <span>
            No OAUTH ID configured!
          </span>
        </div>
      );
    }
    if (userToken !== undefined) {
      return (
        <Redirect to='/admin'/>
      );
    }

    return (
      <div className='auth'>
        <div className='auth-action'>
          <GoogleLogin
              clientId={'554280455378-k5n7nkfcla2ti51gi5j5u33chamvf3r9.apps.googleusercontent.com'}
              buttonText='Login'
              onSuccess={(response) => onSuccess(response, storeUserToken)}
              onFailure={onFailure}
              hostedDomain='shiftjs.com'
              render={renderProps => (
                <button onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                        className='auth-action-button'
                >
                  Click here to authenticate with ShiftJS
                </button>
              )}
          />
        </div>
      </div>
    );
  }
}
