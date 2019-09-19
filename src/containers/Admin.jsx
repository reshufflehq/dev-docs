import '@reshuffle/code-transform/macro';
import React, { Component } from 'react';

import PostCard from '../components/PostCard';

import {
  deletePostByRoute,
  setDisabledPostByRoute,
  getSiteMetadata,
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
  }

  async componentDidMount() {
    // immediately start trying to load metadata
    await this.backgroundLoadMeta();
  }

  async backgroundLoadMeta() {
    const { contentMeta, homeRoute } = await getSiteMetadata(this.props.userToken);
    this.setState({ posts: contentMeta, homeRoute });
  }

  setPostDisabled = async (route, disabled) => {
    await setDisabledPostByRoute(this.props.userToken, route, disabled);
    this.setState((prevState) => {
      const { posts } = prevState;
      const updated = posts.map((post) => {
        if (post.route === route) {
          return {
            ...post,
            disabled: !disabled,
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
      return this.state.posts.map(({ disabled, attributes }) => {
        const { route, title } = attributes;
        const isHome = this.state.homeRoute === route;
        return <PostCard route={route}
                         title={title}
                         key={route}
                         isHome={isHome}
                         isDisabled={disabled}
                         setHome={this.setRouteAsHome}
                         deletePost={this.deletePost}
                         disablePost={this.setPostDisabled}
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
