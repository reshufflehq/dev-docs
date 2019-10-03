import '@reshuffle/code-transform/macro';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Sidebar from 'react-sidebar';
import Button from 'react-bootstrap/Button';

import { getSitePublicMeta } from '../../backend/contentBackend';

import Routes from '../Routes';

import SidebarContent from './SidebarContent';
import Nav from './Nav';

import '../style/DevSite.scss';

const sidebarWidth = '300px';

// react-sidebar requires you to pass styles
const sidebarStyles = {
  content: {
    overflow: 'hidden',
  },
  overlay: {
    overflow: 'hidden',
  },
  sidebar: {
    overflow: 'auto',
    minWidth: sidebarWidth,
    maxWidth: sidebarWidth,
    height: '100%',
    width: sidebarWidth,
    backgroundColor: '#F6F6F6',
  },
  root: {
    position: 'relative',
    overflow: 'hidden',
    width: 'inherit',
    height: 'inherit'
  },
};

// these define the valid categories for the sidebar
const sidebarCategories = [
  'Getting Started',
  'Main Concepts',
  'Other Goodies',
  // 'API Reference',
  // 'Testing',
  // 'FAQ',
  // 'Template Apps',
  // 'Community',
];

// define a media query for views that are at least 800px
const mql = window.matchMedia(`(min-width: 800px)`);

class Devsite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarDocked: mql.matches,
      sidebarOpen: false,
      navOpen: false,
      postMeta: undefined,
    };
  }

  // fetch all of the posts metadata when the component mounts
  async componentDidMount() {
    try {
      this.setState({ postMeta: await getSitePublicMeta() });
    } catch (err) {
      console.error('Failed to load post metadata');
    }
  }

  // add the media query listener on tentative mount
  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
  }

  // add the media query listener on tentative dismount
  componentWillUnmount() {
    mql.removeListener(this.mediaQueryChanged);
  }

  mediaQueryChanged = () => {
    const sidebarOpen = mql.matches;
    this.setState({
      // if width is > 800px permanently display sidebar
      sidebarDocked: mql.matches,
      sidebarOpen,
      navOpen: false,
    });
  }

  getMobileButton() {
    const { navOpen } = this.state;
    // displays the correct action icon based on nav state
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

  findRouteCategory(meta, currRoute, homeRoute) {
    const shortRoute = currRoute.slice(1);
    for (let i = 0; i < meta.length; i += 1) {
      const { route, category } = meta[i];
      const isRouteHome = (currRoute === '/' || currRoute === '/home');
      if (shortRoute === route || (route === homeRoute && isRouteHome)) {
        return category;
      }
    }
  }

  render() {
    const { postMeta } = this.state;
    if (postMeta !== undefined) {
      let currentCat = undefined;
      const maybeCurrentRoute = this.props.location.pathname;
      if (maybeCurrentRoute) {
        const { contentMeta, homeRoute } = this.state.postMeta;
        currentCat = this.findRouteCategory(contentMeta, maybeCurrentRoute, homeRoute);
      }
      const ConfiguredSidebar = (
        <SidebarContent pages={this.state.postMeta.contentMeta}
                        handleLinkSelected={
                          () => this.setState({ navOpen: false })
                        }
                        categories={sidebarCategories}
                        isResponsive={this.state.navOpen}
                        currentCat={currentCat}
        />
      );

      return (
        <div className='root-container'>
          <div className='nav-shaper'>
            <Nav/>
          </div>
          <div className='root-content'>
            <Sidebar
              currentCat={currentCat}
              pullRight={true}
              open={this.state.sidebarOpen}
              docked={this.state.sidebarDocked}
              onSetOpen={(open) => this.setState({ sidebarOpen: open })}
              styles={{ ...sidebarStyles }}
              sidebar={ConfiguredSidebar}
            >
              {
                this.state.navOpen ? ConfiguredSidebar :
                  <Routes childProps={{
                    meta: postMeta,
                  }} />
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

export default withRouter(Devsite);
