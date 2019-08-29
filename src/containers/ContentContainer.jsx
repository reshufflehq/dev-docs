import '@binaris/shift-code-transform/macro';
import React, { Component } from 'react';

import Prism from 'prismjs';
// eslint-disable-next-line
import PrismJsx from 'prismjs/components/prism-jsx.min';

import { loadPostByTitle } from '../../backend/contentBackend';

// reactjs.org syntax styles
import '../style/oceanic.scss';
import '../style/ContentContainer.scss';

export default class ContentContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { html: null };
    // immediately start grabbing the post
    this.loader(this.props.meta.title);
  }

  componentDidUpdate() {
    this.jumpToHash();
    Prism.highlightAll();
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

  async loader(title) {
    if (title) {
      try {
        const content = await loadPostByTitle(title);
        this.setState({ html: content });
      } catch (err) {
        console.error(`Failed to load post ${title}`);
      }
    }
  }

  render() {
    return (
      <div className='content-container' id='content-container'>
        {
          this.state.html !== null &&
            <div id='markdown-content'
                 className='markdown-body'
                 dangerouslySetInnerHTML={{ __html: this.state.html }}
            />
        }
      </div>
    );
  }
}
