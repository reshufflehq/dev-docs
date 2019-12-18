import { getCurrentUser } from '@reshuffle/server-function';

const { VALID_HOSTED_DOMAINS } = process.env;
const domains = VALID_HOSTED_DOMAINS.split(' ');

/**
* validates if email is the right VALID_HOSTED_DOMAIN
* setting getCurrentUser to false since I'm calling this function in the front end and I don't want
* want the CRA to crash for not being logged in if user hits this function.
/** @expose */
export async function checkIfValidDomain() {
  const profile = getCurrentUser(false);

  if (profile === undefined) {
    return false;
  }

  const emails = profile.emails.map((email) => {
    return email.value
  })

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i]

    for (let j = 0; j < domains.length; j++) {
      const validDomain = domains[j]

      if (email.includes(validDomain)) {
        return true;
      }
    }
  }

  return false;
}


/**
 *
 * @return {boolean} - returns if user is VALID_HOSTED_DOMAIN matches their email
 */
export async function validateUser() {
  const profile = getCurrentUser(true);

  const email = profile.emails[0].value;

  if (!checkIfValidDomain()) {
    throw new Error(`User cannot be authenticated, ${email} is not a valid host domain.`)
  }

  return true;
}


