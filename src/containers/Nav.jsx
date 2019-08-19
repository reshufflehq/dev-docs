import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { Link, withRouter } from 'react-router-dom';

import '../style/Nav.scss';

export default function Nav({ logoText }) {
  return (
    <div className='nav-bar'>
      <Link className='logo'
            style={{ 
              color: '#ff4f4f',
              fontFamily: 'Helvetica, sans-serif',
              fontSize: '33px',
              fontWeight: '400',
              letterSpacing: '1px',
              textDecoration: 'none',
              marginLeft: '2%',
              outline: 'none',
            }}
            to={'/home'}
      >
        {logoText}
      </Link>

      <div className='nav-bar-right'>
        <a href='https://discord.gg/M8CC5hy' className='fab fa-discord' aria-hidden='true' />
        <a href='twitter.com/shiftjsteam' className='fab fa-twitter' aria-hidden='true' />
        <a href='github.com/binaris' className='fab fa-github' aria-hidden='true' />
      </div>      
    </div>
  );
}
// <span className='fa fa-caret-down' aria-hidden='true'></span>
// fab fa-discord
// fab fa-twitter
// fab fa-github
