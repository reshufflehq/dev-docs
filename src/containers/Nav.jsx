import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { Link, withRouter } from 'react-router-dom';


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
            to={'/home#overview'}
      >
        {logoText}
      </Link>
    </div>
  );
}
