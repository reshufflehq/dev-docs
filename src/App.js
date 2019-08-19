import '@binaris/shift-code-transform/macro';

import React, { useState, Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import Sidebar from 'react-sidebar';
import Button from 'react-bootstrap/Button';

import scrollToElement from 'scroll-to-element';

import { getPostMeta } from '../backend/contentBackend';

import Routes from './Routes';

import SideBarMenu from './components/SideBarMenu';
import SidebarContent from './containers/SidebarContent';
import Nav from './containers/Nav';

import './style/App.css';

const { FAKE_RUN } = process.env;

const mql = window.matchMedia(`(min-width: 800px)`);

const LOGO_TEXT = '⇧Shift';

const sidebarStyles = {
  sidebar: {
    overflow: 'auto',
    minWidth: 'max-content',
    width: '300px',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
  },
  root: {
    position: 'relative',
    width: 'inherit',
    height: 'inherit'
  },
};

const sidebarCategories = [
  'Getting Started',
  'Main Concepts',
  'API Reference',
  'Testing',
  'FAQ',
  'Template Apps',
  'Community',
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarDocked: mql.matches,
      sidebarOpen: false,
      navOpen: false,
      postMeta: undefined,
    };
  }

  async componentDidMount() {
    let postMeta;
    if (FAKE_RUN === true) {
      postMeta = require('./postMeta.json');
    } else {
      postMeta = await getPostMeta();
    }
    this.setState({ postMeta });
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      const scrollContainer = document.getElementById('content-container');
      scrollContainer.scrollTo(0, 0)
    } else {
      this.jumpToHash();
    }
  }

  jumpToHash = () => {
    const hash = this.props.history.location.hash;
    if (hash !== undefined && hash !== null && hash !== '') {
      scrollToElement(hash, { offset: -120 });
    }
  }

  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
  }

  componentWillUnmount() {
    mql.removeListener(this.mediaQueryChanged);
  }

  mediaQueryChanged = () => {
    const sidebarOpen = mql.matches;
    this.setState({ sidebarDocked: mql.matches, sidebarOpen });
  }

  getMobileButton() {
    const { navOpen } = this.state;
    const className = navOpen ? 'fa fa-remove' : 'fa fa-bars';

    return (
      <Button variant='dark'
              size='lg'
              onClick={() => { this.setState({ navOpen: !navOpen }) }}
      >
        <span className={className} aria-hidden='true'></span>
      </Button>
    );
  }

  render() {
    const { postMeta } = this.state;
    if (postMeta !== undefined) {
      const ConfiguredSidebar = (
        <SidebarContent pages={this.state.postMeta}
                        handleLinkSelected={
                          () => this.setState({ navOpen: false })
                        }
                        categories={sidebarCategories}
                        isResponsive={this.state.navOpen}
        />
      );

      return (
        <div className='root-container'>
          <div className='nav-shaper'>
            <Nav logoText={LOGO_TEXT}/>
          </div>
          <div className='root-content'>
            <Sidebar
              pullRight={true}
              open={this.state.sidebarOpen}
              docked={this.state.sidebarDocked}
              onSetOpen={(open) => this.setState({ sidebarOpen: open })}
              styles={{ ...sidebarStyles }}
              sidebar={ConfiguredSidebar}
            >
              {
                this.state.navOpen ? ConfiguredSidebar :
                  <Routes childProps={{ pages: postMeta }} />
              }
            </Sidebar>
            <div className='mobile-button'>
              { this.getMobileButton() }
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

export default withRouter(App);
