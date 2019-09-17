import React from 'react';

import Button from 'react-bootstrap/Button';

import '../style/PostCard.scss';

export default ({ route, title, isDisabled, isHome, setHome, deletePost, disablePost }) => {
  return (
    <div className='postcard'>
      <div className='postcard-title'>
        {title}
      </div>
      <div className='postcard-route'>
        Route: {route}
      </div>
      <div className='postcard-actions'>
        <Button variant='primary'
                disabled={isHome}
                onClick={() => setHome(route)}
        >
          {
            isHome ?
              'Home route'
            :
              'Set as home'
          }
        </Button>
        <Button variant='warning'
                onClick={() => disablePost(route, !isDisabled)}>
          {
            isDisabled ?
              'Enable'
            :
              'Disable'
          }
        </Button>
        <Button variant='danger'
                onClick={() => deletePost(route)}
                disabled={!isDisabled}
        >
          Delete Post
        </Button>
      </div>
    </div>
  );
}
