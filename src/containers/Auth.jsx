import '@reshuffle/code-transform/macro';
import React from 'react';
import { useAuth } from '@reshuffle/react-auth';

import '../style/Auth.scss';

export default props => {
  const { getLoginURL } = useAuth();
  let path = (props
    && props.location
    && props.location.state
    && props.location.state.path) || 'editor';

  return (
    <div className='auth'>
      <a
        href={getLoginURL(`${window.location.origin.toString()}${path}`)}
        className='auth-button'
      >
        Click here to authenticate with Reshuffle Identity
      </a>
    </div>
  );
}
