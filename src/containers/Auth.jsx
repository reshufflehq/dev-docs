import '@binaris/shift-code-transform/macro';

import React from 'react';
import { Redirect } from 'react-router-dom';

import { GoogleLogin } from 'react-google-login';
import { authenticateUser } from '../../backend/authBackend';

import '../style/Auth.scss';

const {
  REACT_APP_AUTH_NAME,
  REACT_APP_OAUTH_CLIENT_ID,
  REACT_APP_VALID_HOSTED_DOMAIN,
} = process.env;

/**
 * Attempt to authenticate with the backend by providing
 * it the google token returned by the clientside auth
 */
async function onSuccess({ tokenId }, storeUserToken) {
  try {
    const authToken = await authenticateUser(tokenId);
    // store the JWT
    storeUserToken(authToken);
  } catch (err) {
    console.error(err);
  }
}

export default ({ storeUserToken, userToken }) => {
  if (REACT_APP_OAUTH_CLIENT_ID === undefined ) {
    // Google OAuth flow requires OAUTH ID
    // Read more here: https://developers.google.com/identity/protocols/OAuth2
    return (
      <div>
        <span>
          No OAUTH ID configured!
        </span>
      </div>
    );
  } else if (userToken !== undefined) {
    // if the user token exists, take user to Admin page
    return (<Redirect to='/admin'/>);
  }

  return (
    <div className='auth'>
      <GoogleLogin
          clientId={REACT_APP_OAUTH_CLIENT_ID}
          buttonText='Login'
          onSuccess={(response) => onSuccess(response, storeUserToken)}
          hostedDomain={REACT_APP_VALID_HOSTED_DOMAIN}
          render={renderProps => (
            <button onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className='auth-button'
            >
              {`Click here to authenticate with ${REACT_APP_AUTH_NAME}`}
            </button>
          )}
      />
    </div>
  );
}
