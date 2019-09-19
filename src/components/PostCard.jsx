import React from 'react';

import Button from 'react-bootstrap/Button';

import '../style/PostCard.scss';

/**
 * Displays information for a specific post. Also surfaces
 * the capability to delete, disable or set a post as home.
 *
 * @param { boolean } isDisabled - is the post disabled
 * @param { boolean } isHome - is the post the home route
 * @param { function } setHome - set this post as the home route
 * @param { function } deletePost - delete this post (cannot be undone)
 * @param { function } disablePost - disable this post
 * @param { string } route - unique identifier of the post
 * @param { string } title - what is the post called
 */
export default ({ isDisabled, isHome, setHome, deletePost, disablePost, route, title }) => {
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
