import React, { useEffect } from 'react';

import * as hm from 'html-to-react'

import Prism from 'prismjs';
// eslint-disable-next-line
import PrismJsx from 'prismjs/components/prism-jsx.min';

// reactjs.org syntax styles
import '../style/oceanic.scss';
import '../style/ContentContainer.scss';

const HtmlToReactParser = hm.Parser;
const htmlToReactParser = new HtmlToReactParser();

/**
 * Dumb container which takes in raw html and converts it
 * to valid React elements. Those elements are subsequently
 * rendered in a well-defined view container.
 */
const ContentContainer = function ({ html }) {
  // this should run after each DOM rendering, that way syntax
  // is always highlighted even after updates
  useEffect(() => {
    Prism.highlightAll();
  });

  return (
    <div className='content-container' id='content-container'>
      {
        html !== undefined &&
          <div id='markdown-content'
               className='markdown-body'
          >
            {htmlToReactParser.parse(html)}
          </div>
      }
    </div>
  );
};

export default ContentContainer;
