import '@binaris/shift-code-transform/macro';
import React, { Component } from 'react';

import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import { css } from '@emotion/core';

import {
  parseMDPost,
  updatePost,
  getPostMeta,
  getRawByRoute,
} from '../../backend/contentBackend.js';

import { isError } from '../backendHelpers.js';

import ContentContainer from './ContentContainer';

import '../style/Admin.scss';

const override = css`
z-index: 10001;
display: block;
margin: 0 auto;
position: relative;
top: calc(50% - 70px);
-ms-transform: translateY(-50%);
transform: translateY(-50%);
`

function PostDropdown ({ items, onSelect }) {
  return (
    <DropdownButton id='dropdown-item-button'
                    title='Select a Post'
    >
      {
        items.map((item) => {
          return (
            <Dropdown.Item id={item.route}
                           key={item.route}
                           eventKey={JSON.stringify(item)}
                           as='button'
                           onSelect={onSelect}
            >
              {item.route}
            </Dropdown.Item>
          );
        })
      }
    </DropdownButton>
  );
}

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      html: undefined,
      dropdownItems: [],
      formValidated: false,
      textAreaValue: '',
      startingTextState: undefined,
      showAlert: undefined,
      alertVariant: undefined,
    };
    this.backgroundLoadPosts();
  }

  setPost = async (route) =>{
    try {
      const res = await getRawByRoute(this.props.userToken, route);
      this.setState({
        html: res.parsed,
        startingTextState: res.raw,
        textAreaValue: res.raw,
      });
    } catch (err) {
      console.log(err);
    }
  }

  onPostSelected = async (event, e0) => {
    try {
      const parsed = JSON.parse(event);
      await this.setPost(parsed.route);
    } catch (err) {
      console.log(err);
    }
  }

  async backgroundLoadPosts() {
    const meta = await getPostMeta();
    this.setState({ dropdownItems: meta });
  }

  async updateDisplay(rawContent) {
    try {
      const parsed = await parseMDPost(this.props.userToken, rawContent);
      this.setState({ html: parsed.parsed });
    } catch (err) {
      console.error(err);
    }
  }

  onTextAreaChange = (event) => {
    event.preventDefault();
    const fieldVal = event.target.value;
    this.updateDisplay(fieldVal);
    this.setState({ textAreaValue: fieldVal });
  }

  handleSubmitPost = async (event) => {
    event.preventDefault();
    if (this.state.textAreaValue !== '' &&
        this.state.textAreaValue !== undefined) {
      try {
        const updated = await updatePost(this.props.userToken, this.state.textAreaValue, this.state.startingTextState);
        if (isError(updated)) {
          this.setState({
            showAlert: updated.message,
            alertVariant: 'danger',
          });
        } else {
          this.setState({
            startingTextState: this.state.textAreaValue,
            showAlert: 'Post successfully updated!',
            alertVariant: 'info',
          });
        }
      } catch (err) {
        this.setState({
          showAlert: 'Something went wrong, sorry about that',
          alertVariant: 'danger',
        });
      }
    }
  }

  render() {
    return (
      <div className='admin'>
        <div className='admin-config'>
          <PostDropdown items={this.state.dropdownItems}
                        onSelect={this.onPostSelected}
          />
          <div className='admin-config-submit'>
            <Button variant='primary'
                    onClick={this.handleSubmitPost}
            >
              Update
            </Button>
          </div>
          {
            this.state.showAlert && (
              <div className='admin-config-alert'>
                <Alert variant={this.state.alertVariant}
                       onClose={
                         () => this.setState({
                           showAlert: undefined, alertVariant: undefined
                         })
                       }
                       dismissible
                >
                  <Alert.Heading>{this.state.showAlert}</Alert.Heading>
                </Alert>
              </div>
            )
          }
        </div>
        <div className='admin-display'>
          <ContentContainer html={this.state.html}
          />
        </div>
        <div className='admin-form-wrapper'>
          <div className='admin-form'>
            <Form noValidate
                  validated={this.state.formValidated}
                  id='admin-update-form'
            >
              <Form.Group controlId='form.textinput'>
                <Form.Label>Post Content (markdown format)</Form.Label>
                <Form.Control as='textarea'
                              rows='20'
                              onChange={this.onTextAreaChange}
                              value={this.state.textAreaValue}
                              required
                />
              </Form.Group>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
