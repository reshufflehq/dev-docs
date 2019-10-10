import React from 'react';
import { Link } from 'react-router-dom';

import '../style/Nav.scss';

// Reshuffle nav logo
import logo from '../reshuffle-logo.svg';
import miniLogo from '../mini-reshuffle-logo.svg';
import docsLink from '../docs-link.svg';
import miniDocsLink from '../mini-docs-link.svg';

// various links to our social media
const Links = {
  DISCORD: 'https://discord.gg/M8CC5hy',
  TWITTER: 'https://twitter.com/reshufflehq',
  GITHUB: 'https://github.com/reshufflehq',
  RESHUFFLE_HOME: 'https://reshuffle.com',
}

export default function Nav() {
  return (
    <div className='nav-bar'>
      <div className='nav-bar-content'>
        <div className='nav-bar-logo unselectable'>
          <div className='logo-container'>
            <a href={Links.RESHUFFLE_HOME}>
              <img src={logo} alt='Reshuffle logo'/>
            </a>
            <div className='nav-bar-doclink'>
              <Link to='/'>
                <img src={docsLink} alt='Reshuffle docs logo'/>
              </Link>
            </div>
          </div>
        </div>
        <div className='nav-bar-mini-logo unselectable'>
          <div className='logo-container'>
            <a href={Links.RESHUFFLE_HOME}>
              <img src={miniLogo} alt='Reshuffle logo'/>
            </a>
            <div className='nav-bar-doclink'>
              <Link to='/'>
                <img src={miniDocsLink} alt='Reshuffle docs logo'/>
              </Link>
            </div>
          </div>
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
