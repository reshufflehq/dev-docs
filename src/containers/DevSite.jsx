import '@reshuffle/code-transform/macro';

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Sidebar from 'react-sidebar';
import Button from 'react-bootstrap/Button';

import { getSitePublicMeta } from '../../backend/contentBackend';
import { hasCredentials } from '../../backend/authBackend';

import Routes from '../Routes';

import SidebarContent from './SidebarContent';
import EnvKeyBanner from './EnvKeyBanner';
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
  'Tutorial',
  'Main Concepts',
  'FAQ',
  'Other Goodies',
  // 'API Reference',
  // 'Testing',
  // 'Template Apps',
  // 'Community',
];

function partition(array, isValid) {
  return array.reduce(([pass, fail], elem) => {
    return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
  }, [[], []]);
}


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
      routeChanged: false,
      hasCreds: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setState({ routeChanged: true });
    } else if (this.state.routeChanged === true) {
      this.setState({ routeChanged: false });
    }
  }

  // fetch all of the posts metadata when the component mounts
  async componentDidMount() {
    try {
      this.setState({
        postMeta: await getSitePublicMeta(),
        hasCreds: await hasCredentials(),
      });
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
    const {
      navOpen,
      postMeta,
      routeChanged,
      sidebarOpen,
      sidebarDocked
    } = this.state;

    if (postMeta === undefined) {
      return null;
    }

    let currentCat = undefined;
    const maybeCurrentRoute = this.props.location.pathname;
    if (maybeCurrentRoute) {
      const { contentMeta, homeRoute } = postMeta;
      currentCat = this.findRouteCategory(contentMeta, maybeCurrentRoute, homeRoute);
    }

    const [standalone, grouped] = partition(postMeta.contentMeta,
      ({ type }) => type === 'standalone');
    const standaloneItems = standalone.map(({ title, route }) =>
      ({ linkOrRoute: route, displayName: title }));

    const ConfiguredSidebar = (
      <SidebarContent pages={grouped}
        handleLinkSelected={
          () => this.setState({ navOpen: false })
        }
        categories={sidebarCategories}
        standaloneItems={standaloneItems}
        isResponsive={navOpen}
        currentCat={currentCat}
        routeChanged={routeChanged}
      />
    );

    return (
      <div className='root-container'>
        <div className='nav-shaper'>
          <Nav />
        </div>
        {!this.state.hasCreds && (
          <EnvKeyBanner />
        )}
        <div className='root-content'>
          <Sidebar
            pullRight={true}
            open={sidebarOpen}
            docked={sidebarDocked}
            onSetOpen={(open) => this.setState({ sidebarOpen: open })}
            styles={{ ...sidebarStyles }}
            sidebar={ConfiguredSidebar}
          >
            {
              navOpen ? ConfiguredSidebar :
                <Routes childProps={{
                  meta: postMeta,
                }} />
            }
          </Sidebar>
          <div className='mobile-button'>
            {this.getMobileButton()}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Devsite);
