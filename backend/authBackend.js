import { getCurrentUser } from '@reshuffle/server-function';
import get from 'lodash.get';
const { VALID_HOSTED_DOMAINS } = process.env;
const domains = VALID_HOSTED_DOMAINS.split(' ');

/**
* validates if email is the right VALID_HOSTED_DOMAIN
* setting getCurrentUser to false since I'm calling this function in the front end and I don't want
* want the CRA to crash for not being logged in if user hits this function.
/** @expose */
export async function checkIfValidDomain() {
  const profile = getCurrentUser(true);

  if (get(profile, 'emails.length')) {
    const emails = profile.emails.map((email) => email.value.split('@')[1]);

    if (emails.some((email) => domains.includes(email))) {
      return true;
    }
  }

  const emailString = profile.emails ? profile.emails.join(', ') : '"No email for user"';
  throw new Error(`User cannot be authenticated, no valid host domain for ${emailString}.`);
}