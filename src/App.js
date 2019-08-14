import '@binaris/shift-code-transform/macro';

import React, { useState, Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Sidebar from 'react-sidebar';

import scrollToElement from 'scroll-to-element';

import Button from 'react-bootstrap/Button';

import './style/App.css';

import { getPostMeta } from '../backend/contentBackend';

import Routes from './Routes';

import SideBarMenu from './components/SideBarMenu';
import SidebarContent from './containers/SidebarContent';
import Nav from './containers/Nav';

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
  'Installation',
  'Main Concepts',
  'Advanced',
  'Testing',
  'FAQ',
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

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  async componentDidMount() {
    const postMeta = require('./postMeta.json');
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

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  mediaQueryChanged() {
    const sidebarOpen = mql.matches;
    this.setState({ sidebarDocked: mql.matches, sidebarOpen });
  }

  handleLinkSelected = (event) => {
    this.setState({ navOpen: false });
  }

  render() {
    if (this.state.postMeta !== undefined) {
      const childProps = {
        pages: this.state.postMeta,
      };

      const ConfiguredSidebar = (
        <SidebarContent pages={this.state.postMeta}
                        handleLinkSelected={this.handleLinkSelected}
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
              onSetOpen={this.onSetSidebarOpen}
              styles={{ ...sidebarStyles }}
              sidebar={ConfiguredSidebar}
            >
              {
                this.state.navOpen ?
                  ConfiguredSidebar
                :
                  <Routes childProps={childProps} />
              }
            </Sidebar>
            <div className='mobile-button'>
              {
                this.state.navOpen ?
                  <Button variant="dark"
                          size='lg'
                          onClick={() => { this.setState({ navOpen: false }) }}
                  >
                    <span className='fa fa-remove' aria-hidden='true'></span>
                  </Button>
                :
                  <Button variant='dark'
                          size='lg'
                          onClick={() => { this.setState({ navOpen: true }) }}
                  >
                    <span className='fa fa-bars' aria-hidden='true'></span>
                  </Button>
              }
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

export default withRouter(App);
