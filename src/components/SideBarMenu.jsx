import React, { Component } from 'react';
import { Nav, NavItem, Navbar, NavDropdown, MenuItem, Glyphicon } from 'react-bootstrap';

import styles from '../style/SideBarMenu.css';

export default function SideBarMenu() {
  return (
    <div className="menu sticky-top p-3 bg-light" activeKey="/home">
      <Nav.Item>
        <Nav.Link href="/home">Active</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="link-1">Link</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="link-2">Link</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="disabled" disabled>
          Disabled
        </Nav.Link>
      </Nav.Item>
    </div>
    // <div id="sidebar-menu" className={styles.sideBarMenuContainer}>
    //   <Navbar role='menu' className={styles.sidebar} inverse >
    //     <Navbar.Brand>
    //       <a href="/">User Name</a>
    //     </Navbar.Brand>
    //     <Navbar.Toggle />
    //     <Navbar.Collapse>
    //       <Navbar.Text className={styles.userMenu}>
    //         <Nav.Link href="#">Home</Nav.Link>
    //         <Nav.Link href="#">Log out</Nav.Link>
    //       </Navbar.Text>
    //       <Nav>
    //         <NavDropdown key={1} title="Item 1">
    //           <NavDropdown.Item key={1.1} href="#">Item 1.1</NavDropdown.Item>
    //         </NavDropdown>
    //         <NavItem key={2}>Item 2</NavItem>
    //         <NavItem key={3}>Item 3</NavItem>
    //       </Nav>
    //     </Navbar.Collapse>
    //   </Navbar>
    // </div>
  );
}
