import { create, get } from '@binaris/shift-db';

// JWT is our primary identification mechanism
import * as jwt from 'jsonwebtoken';

// used to validate incoming Google profiles from client
import { OAuth2Client } from 'google-auth-library';

// we depend on both OAUTH_CLIENT_ID and a SECURE
// PEM which is used to sign our tokens
//
// THE PEM CANNOT BE LEAKED!!!!!!!!!!!!!!
const { OAUTH_CLIENT_ID, PEM } = process.env;
const client = new OAuth2Client(OAUTH_CLIENT_ID);

/**
 * Makes the necessary requests to Google auth servers
 * to verify that the client user is actually who they
 * say they are.
 *
 * @param { string } token - idToken returned by clientside auth
 */
async function verifyGoogleUser(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: OAUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  return payload;
}

/**
 * Authenticates a Google user whose token was returned
 * from the client-side Google authentication flow. Assuming
 * the user is valid, a side-wide JWT will be returned for
 * future identification.
 *
 * @param { string } googleToken - googleToken returned by clientside auth
 *
 * @return { string } - site-specific JWT that allows future access
 */
/* @expose */
export async function authenticateUser(googleToken) {
  const payload = await verifyGoogleID(googleToken);
  const { hd } = payload;
  if (hd === 'shiftjs.com') {
    // store some basic (unreliable) profile information in the token
    return jwt.sign({
      name: payload.name,
      picture: payload.picture,
      email: payload.email,
    }, PEM);
  } else {
    // TODO: Format error to meet specification defined in contentBackend
    throw new Error(`User cannot be authenticated, ${hd} is not a valid host domain`);
  }
}

// validates a JWT by decoding it with the PEM secret
export async function validateJWT(token) {
  // this will throw if verification fails
  jwt.verify(token, PEM);
  return true;
}
