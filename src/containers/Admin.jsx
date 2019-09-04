import '@binaris/shift-code-transform/macro';
import React, { Component } from 'react';

import ReactDOMServer from 'react-dom/server';
import * as hm from 'html-to-react'

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ClipLoader from 'react-spinners/ClipLoader';

import { css } from '@emotion/core';

import {
  parseMDPost,
  updatePost,
  getPostMeta,
  getRawByRoute,
} from '../../backend/contentBackend.js';

import ContentContainer from './ContentContainer';

import '../style/Admin.scss';

const HtmlToReactParser = hm.Parser;
const htmlToReactParser = new HtmlToReactParser();

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
    };
    this.backgroundLoadPosts();
  }

  setPost = async (route) =>{
    try {
      const res = await getRawByRoute(this.props.userToken, route);
      this.setState({
        html: htmlToReactParser.parse(res.parsed),
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
      this.setState({ html: htmlToReactParser.parse(parsed.parsed) });
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
    if (this.state.textAreaValue !== '' && this.state.textAreaValue !== undefined) {
      const updated = await updatePost(this.props.userToken, this.state.textAreaValue, this.state.startingTextState);
      console.log('updated!');
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
            <Button variant='primary' onClick={this.handleSubmitPost}>
              Submit
            </Button>
          </div>
        </div>
        <div className='admin-display'>
          <ContentContainer className='admin-display-container'
                            history={this.props.history}
                            ele={this.state.html}
                            html={null}
          />
        </div>
        <div className='admin-action'>
          <div className='admin-form'>
            <Form noValidate
                  validated={this.state.formValidated}
                  id='post-update-form'
            >
              <Form.Group controlId="form.textinput">
                <Form.Label>Content</Form.Label>
                <Form.Control as="textarea"
                              rows="20"
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
  // onFilenameChange = (event) => {
  //   event.preventDefault();
  //   const fieldVal = event.target.value;
  //   this.setState({ fileNameValue: fieldVal });
  // }

              {/* <div className='post-form-submission'> */}
              {/*   <Button type='submit'> */}
              {/*     text */}
              {/*   </Button> */}
              {/* </div> */}
              {/* <Form.Group controlId='form.filename'> */}
              {/*   <Form.Label className='auth-form-filename'> */}
              {/*     Filename */}
              {/*   </Form.Label> */}
              {/*   <Form.Control onChange={this.onFilenameChange} */}
              {/*                 value={this.state.fileNameValue} */}
              {/*                 disabled={false} */}
              {/*                 type='text' */}
              {/*                 placeholder='A post about ReactJS hooks' */}
              {/*                 required */}
              {/*   /> */}
              {/* </Form.Group> */}
