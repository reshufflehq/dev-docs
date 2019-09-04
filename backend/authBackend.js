import { create, get } from '@binaris/shift-db';

import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const { OAUTH_CLIENT_ID, PEM } = process.env;
const client = new OAuth2Client(OAUTH_CLIENT_ID);

async function verifyGoogleID(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: OAUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  return payload;
}

/* @expose */
export async function authenticateUser(googleToken) {
  const payload = await verifyGoogleID(googleToken);
  const { hd } = payload;
  if (hd === 'shiftjs.com') {
    return jwt.sign({
      name: payload.name,
      picture: payload.picture,
      email: payload.email,
    }, PEM);
  } else {
    throw new Error(`User cannot be authenticated, ${hd} is not a valid host domain`);
  }
}

export async function validateJWT(token) {
  const verified = jwt.verify(token, PEM);
  return true;
}
