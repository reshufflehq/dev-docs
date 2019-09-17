import '@reshuffle/code-transform/macro';
import React, { Component } from 'react';

import PostCard from '../components/PostCard';

import {
  deletePostByRoute,
  setDisabledPostByRoute,
  getContentMeta,
  setRouteAsHome,
} from '../../backend/contentBackend.js';

import '../style/Admin.scss';

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      homeRoute: undefined,
    };
    // immediately start trying to load metadata
    this.backgroundLoadMeta();
  }

  async backgroundLoadMeta() {
    const { content, homeRoute } = await getContentMeta(this.props.userToken);
    this.setState({ posts: content, homeRoute });
  }

  disablePost = async (route, disable) => {
    await setDisabledPostByRoute(this.props.userToken, route, disable);
    this.setState((prevState) => {
      const { posts } = prevState;
      const updated = posts.map((post) => {
        if (post.route === route) {
          return {
            ...post,
            disabled: !disable,
          };
        }
        return post;
      });
      return { posts: updated };
    });
    this.backgroundLoadMeta();
  }

  deletePost = async (route) => {
    await deletePostByRoute(this.props.userToken, route);
    this.setState((prevState) => {
      const { posts } = prevState;
      return {
        posts: posts.filter(post => post.route !== route)
      };
    });
    this.backgroundLoadMeta();
  }

  setRouteAsHome = async (route) => {
    await setRouteAsHome(this.props.userToken, route);
    this.setState({ homeRoute: route });
  }

  makeAdminPosts() {
    if (this.state.posts) {
      return this.state.posts.map((post) => {
        const isHome = this.state.homeRoute === post.route;
        return <PostCard {...post}
                         key={post.route}
                         isHome={isHome}
                         isDisabled={post.disabled}
                         setHome={this.setRouteAsHome}
                         deletePost={this.deletePost}
                         disablePost={this.disablePost}
               />
      });
    }
    return null;
  }

  render() {
    return (
      <div className='admin'>
        <div className='admin-posts'>
          {this.makeAdminPosts()}
        </div>
      </div>
    );
  }
}
