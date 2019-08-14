import '@binaris/shift-code-transform/macro';

// import { loadPostByTitle } from '../../backend/contentBackend';

import React, { Component } from 'react';

import '../style/ContentContainer.css';
import 'github-markdown-css';

async function loadPostByTitle(title) {
  const loadedPosts = require('../post-data.json');

  const postKeys = Object.keys(loadedPosts);
  for (let i = 0; i < postKeys.length; i += 1) {
    const { attributes } = loadedPosts[postKeys[i]];
    if (attributes.title === title) {
      return loadedPosts[postKeys[i]].parsed;
    }
  }
  throw new Error(`No post found with title: ${title}`);
}


export default class ContentContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      meta: undefined,
      content: undefined,
    };
  }

  async componentDidMount() {
    const { title } = this.props.meta;
    if (title) {
      const content = await loadPostByTitle(title);
      this.setState({ content });
      document.getElementById('markdown-content').innerHTML = content;
    }
  }

  render() {
    return (
      <div className='content-container' id='content-container'>
        <div id='markdown-content' className='markdown-body' />
      </div>
    );
  }
}
