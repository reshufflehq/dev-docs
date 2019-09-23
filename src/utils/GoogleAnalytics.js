import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';

// Special thanks to:
// https://medium.com/brownbag/add-google-analytics-to-create-react-app-project-with-react-router-v4-f12b947262fc
// for provinding this awesome Component!

class GoogleAnalytics extends Component {
  componentDidMount () {
    this.logPageChange(
      this.props.location.pathname,
      this.props.location.search
    );
  }

  componentDidUpdate ({ location: prevLocation }) {
    const { location: { pathname, search } } = this.props;
    const isDifferentPathname = pathname !== prevLocation.pathname;
    const isDifferentSearch = search !== prevLocation.search;

    if (isDifferentPathname || isDifferentSearch) {
      this.logPageChange(pathname, search);
    }
  }

  logPageChange (pathname, search = '') {
    const page = pathname + search;
    const { location } = window;
    ReactGA.set({
      page,
      location: `${location.origin}${page}`,
      ...this.props.options
    });
    ReactGA.pageview(page);
  }

  render () {
    return null;
  }
}

const RouteTracker = () => <Route component={GoogleAnalytics} />;

const init = (options = {}) => {
  const { NODE_ENV, REACT_APP_GA_TRACKING_ID: id } = process.env;
  const isGAEnabled = NODE_ENV === 'production';
  if (id && isGAEnabled) {
    ReactGA.initialize(id);
    return true;
  }

  return false;
};

export default {
  GoogleAnalytics,
  RouteTracker,
  init
};
