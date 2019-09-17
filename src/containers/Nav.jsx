import React from 'react';
import { Link } from 'react-router-dom';

import '../style/Nav.scss';

// Reshuffle nav logo
import logo from '../reshuffle.svg';

// various links to our social media
const Links = {
  DISCORD: 'https://discord.gg/M8CC5hy',
  TWITTER: 'https://twitter.com/reshufflehq',
  GITHUB: 'https://github.com/reshufflehq',
}

export default function Nav() {
  return (
    <div className='nav-bar'>
      <div className='nav-bar-content'>
        <div className='nav-bar-title'>
          <Link to='/'>
            <img src={logo} alt='Reshuffle logo'/>
          </Link>
        </div>

        <div className='nav-bar-icons'>
          <a href={Links.DISCORD}
             className='fab fa-discord'
             aria-hidden='true'
             alt='Talk to us on Discord'
          >
          </a>
          <a href={Links.TWITTER}
             className='fab fa-twitter'
             aria-hidden='true'
             alt='Follow on Twitter'
          >
          </a>
          <a href={Links.GITHUB}
             className='fab fa-github'
             aria-hidden='true'
             alt='Check out our Github'
          >
          </a>
        </div>
      </div>
    </div>
  );
}
