import React, { useEffect } from 'react';

import Prism from 'prismjs';
// eslint-disable-next-line
import PrismJsx from 'prismjs/components/prism-jsx.min';

// reactjs.org syntax styles
import '../style/oceanic.scss';
import '../style/ContentContainer.scss';

const ContentContainer = function ({ html, history, className, ele }) {
  useEffect(() => {
    Prism.highlightAll();
  });

  const classString = `content-container ${className || ''}`;

  return (
    <div className={classString} id='content-container'>
      {
        html !== null &&
          <div id='markdown-content'
               className='markdown-body'
               dangerouslySetInnerHTML={{ __html: html }}
          />
      }
      {
        ele !== undefined &&
          <div id='markdown-content'
               className='markdown-body'
          >
            {ele}
          </div>
      }
    </div>
  );
};

export default ContentContainer;
