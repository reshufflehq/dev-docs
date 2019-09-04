import '@binaris/shift-code-transform/macro';
import React, { Component } from 'react';

import { loadPostByRoute } from '../../backend/contentBackend';

import ContentContainer from './ContentContainer';

export default class DynamicContentContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { html: null };
    this.loader(this.props.meta.route);
  }

  jumpToHash = () => {
    const hash = this.props.history.location.hash;
    if (hash !== undefined && hash !== null && hash !== '') {
      // remove hash to get actual element id
      const possEle = document.getElementById(hash.slice(1));
      if (possEle !== null) {
        possEle.scrollIntoView();
      }
    }
  }

  componentDidMount() {
    this.jumpToHash();
  }

  async loader(route) {
    if (route) {
      try {
        const content = await loadPostByRoute(route);
        this.setState({ html: content });
        this.jumpToHash();
      } catch (err) {
        console.error(`Failed to load post ${route}`);
      }
    }
  }

  render() {
    return (
      <ContentContainer history={this.props.history} html={this.state.html} />
    );
  }
}
