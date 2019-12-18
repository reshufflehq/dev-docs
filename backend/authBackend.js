import { getCurrentUser } from '@reshuffle/server-function';
const { REACT_APP_VALID_HOSTED_DOMAIN } = process.env;

//throw error once user is not a valid domain
function throwErr() {
  throw new Error(`User not valid, ${REACT_APP_VALID_HOSTED_DOMAIN} is correct domain.`)
}

// validates if email is the right REACT_APP_VALID_HOSTED_DOMAIN
/**
 *
 * @return {boolean} - returns if user is REACT_APP_VALID_HOSTED_DOMAIN matches their email
 */
/** @expose */
export async function validateUser() {
  const profile = getCurrentUser(false);
  if (profile === undefined) {
    return { errors: { msg: 'User is not logged in.' } }
  }
  let email = profile.emails[0].value;
  email = email.split('@');

  if (email[1] === REACT_APP_VALID_HOSTED_DOMAIN) {
    return true;
  }

  return {
    error: {
      msg: `User cannot be authenticated, ${email[1]} is not a valid host domain,
  valued host is ${REACT_APP_VALID_HOSTED_DOMAIN}.`,
    },
  };
}


