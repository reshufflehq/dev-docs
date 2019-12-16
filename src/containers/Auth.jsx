import '@reshuffle/code-transform/macro';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '@reshuffle/react-auth';

import '../style/Auth.scss';

export default props => {
  const { getLoginURL, authenticated } = useAuth();

  if (authenticated) {
    // if the user authenticated, take user to Editor page
    return <Redirect to='/editor' />;
  }

  return (
    <div className='auth'>
      <a href={getLoginURL()} className='auth-button'>
        {`Click here to authenticate with Reshuffle Identity`}
      </a>
    </div>
  );
};
