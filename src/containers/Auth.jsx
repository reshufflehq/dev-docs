import '@reshuffle/code-transform/macro';
import React from 'react';
import { useAuth } from '@reshuffle/react-auth';

import '../style/Auth.scss';

export default props => {
  const { getLoginURL } = useAuth();
  let path = 'editor'

  if (props.location.state !== undefined) {
    path = props.location.state.path;
  }

  return (
    <div className='auth'>
      <a
        href={getLoginURL(`${window.location.origin.toString()}/${path}`)}
        className='auth-button'
      >
        Click here to authenticate with Reshuffle Identity
      </a>
    </div>
  );
}
