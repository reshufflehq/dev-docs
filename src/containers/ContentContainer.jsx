import React, { useEffect } from 'react';
import Clipboard from 'clipboard';

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

    const pres = document.getElementsByTagName("pre");

    if (pres !== null) {
      for (let codeSnippet of pres) {
        if (codeSnippet.className === ' language-js' || codeSnippet.className === ' language-jsx') {
          codeSnippet.innerHTML = `<div class="copy"><i class="fas fa-copy"></i></div><code class="${codeSnippet.className}">${codeSnippet.innerHTML}</code>`;
        }
      }
      const clipboard = new Clipboard('.copy', {
        target: trigger => {
          return trigger.nextElementSibling;
        }
      });

      clipboard.on('success', event => {
        event.trigger.textContent = 'copied!';
      });

    }
  });

  // TODO: Fix issue with whitespace in generated React elements
  //       See: https://github.com/aknuds1/html-to-react/issues/79
  return (
    <div className='content-container' id='content-container'>
      <div className='content-container-inner'>
        {
          html !== undefined &&
          <div id='markdown-content'
            className='markdown-body'
          >
            {htmlToReactParser.parse(html)}
          </div>
        }
      </div>
    </div>
  );
};

export default ContentContainer;
