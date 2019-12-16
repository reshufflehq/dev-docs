import { getCurrentUser } from '@reshuffle/server-function';
const { REACT_APP_VALID_HOSTED_DOMAIN } = process.env;

// validates if email is the right REACT_APP_VALID_HOSTED_DOMAIN
export async function validateUser() {
  const profile = getCurrentUser(true);
  let email = profile.emails[0].value;
  email = email.split('@');

  if (email[1] === REACT_APP_VALID_HOSTED_DOMAIN) {
    return true;
  }

  throw new Error(
    `User cannot be authenticated, ${email[1]} is not a valid host domain`,
  );
}

// validates if email is the right REACT_APP_VALID_HOSTED_DOMAIN
export async function validate() {
  const profile = getCurrentUser(true);
  let email = profile.emails[0].value;
  email = email.split('@');

  if (email[1] === REACT_APP_VALID_HOSTED_DOMAIN) {
    return true;
  }

  return false;
}
