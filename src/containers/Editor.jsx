import '@reshuffle/code-transform/macro';
import React, { Component } from 'react';

import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {
  parseMD,
  updateContent,
  getSiteMetadata,
  getContentByRoute,
} from '../../backend/contentBackend.js';

import { isError } from '../backendHelpers.js';

import ContentContainer from './ContentContainer';
import PostDropdown from '../components/PostDropdown';

import '../style/Editor.scss';

export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      html: undefined,
      dropdownItems: [],
      formValidated: false,
      textAreaValue: '',
      showAlert: undefined,
      alertVariant: undefined,
    };
    // immediately start trying to load metadata
    this.backgroundLoadMeta();
  }

  setPost = async (route) => {
    try {
      const res = await getContentByRoute(route);
      this.setState({
        html: res.parsed,
        textAreaValue: res.raw,
      });
    } catch (err) {
      console.log(err);
    }
  }

  onPostSelected = async (event) => {
    await this.setPost(event);
  }

  async backgroundLoadMeta() {
    const { contentMeta } = await getSiteMetadata();
    this.setState({ dropdownItems: contentMeta });
  }

  /**
   * Updates the preview display to reflect the parsed
   * state of the provided raw-markdown
   */
  async updateDisplay(rawContent) {
    try {
      const parsed = await parseMD(rawContent);
      this.setState({ html: parsed.parsed });
    } catch (err) {
      // TODO: Handle this with future error handling system
      console.error(err);
    }
  }

  /**
   * Whenever the input text area changes, re-draw the
   * display to reflect the new content
   */
  onTextAreaChange = (event) => {
    event.preventDefault();
    const fieldVal = event.target.value;
    this.updateDisplay(fieldVal);
    this.setState({ textAreaValue: fieldVal });
  }

  handleSubmitPost = async (event) => {
    event.preventDefault();
    // ensure there is content to submit
    if (this.state.textAreaValue !== '' &&
      this.state.textAreaValue !== undefined) {
      try {
        const updated = await updateContent(this.state.textAreaValue);
        // manual error handling is required because of
        // some current idiosyncrasies
        if (isError(updated)) {
          this.setState({
            showAlert: updated.message,
            alertVariant: 'danger',
          });
        } else {
          this.setState({
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
      <div className='editor'>
        <div className='editor-config'>
          <PostDropdown postMeta={this.state.dropdownItems}
            onSelect={this.onPostSelected}
            title='Select a Post'
          />
          <div className='editor-config-submit'>
            <Button variant='primary'
              onClick={this.handleSubmitPost}
            >
              Update
            </Button>
          </div>
          {
            this.state.showAlert && (
              <div className='editor-config-alert'>
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
        <div className='editor-display'>
          <ContentContainer html={this.state.html} />
        </div>
        <div className='editor-form-wrapper'>
          <div className='editor-form'>
            <Form noValidate
              validated={this.state.formValidated}
              id='editor-update-form'
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