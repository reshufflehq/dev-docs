import '@reshuffle/code-transform/macro';
import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '@reshuffle/react-auth';
import { checkEmail } from '../../backend/contentBackend';

import '../style/Auth.scss';

export default props => {
  const { getLoginURL, authenticated } = useAuth();
  const [email, setEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (authenticated) {
        const value = await checkEmail();
        setEmail(value);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  if (authenticated && email) {
    // if the user authenticated, take user to Editor page
    return <Redirect to='/editor' />;
  }

  if (authenticated && email === false) {
    return <Redirect to='/' />;
  }

  return (
    <div className='auth'>
      <a
        href={getLoginURL(`${window.location.origin.toString()}/editor`)}
        className='auth-button'
      >
        {`Click here to authenticate with Reshuffle Identity`}
      </a>
    </div>
  );
};
