import React from 'react';

import '../style/EnvKeyBanner.scss';

const EnvKeyBanner = () => {
    return (
        <div className='banner'>
            <p>This template requires a .env file with a key called VALID_HOSTED_DOMAINS.</p>
            <p>Press Remix and download the code, then read the
            <a href='https://github.com/reshufflehq/dev-docs'>README file</a> for more instructions.</p>
        </div>
    );
}

export default EnvKeyBanner;