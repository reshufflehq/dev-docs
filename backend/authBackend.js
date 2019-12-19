import { getCurrentUser } from '@reshuffle/server-function';

const { VALID_HOSTED_DOMAINS } = process.env;
const domains = VALID_HOSTED_DOMAINS.split(' ');

/**
* validates if email is the right VALID_HOSTED_DOMAIN
* setting getCurrentUser to false since I'm calling this function in the front end and I don't want
* want the CRA to crash for not being logged in if user hits this function.
*/
function checkIfValidDomain() {
  const profile = getCurrentUser(true);

  if (profile) {
    const emails = profile.emails.map((email) => {
      return email.value.split('@')[1];
    })

    const match = emails.some((email) => domains.includes(email));

    if (match) {
      return true
    }
  }

  throw new Error(`User cannot be authenticated, no valid host domain for ${profile.emails.join(', ')}.`)
}


/**
 *
 * @return {boolean} - returns true if user is a valid domain, if not function throws an error.
 /** @expose */
export async function validateUser() {
  await checkIfValidDomain()

  return true
}


