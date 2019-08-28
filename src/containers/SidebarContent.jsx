import React from 'react';
import { Link, withRouter } from 'react-router-dom';

import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import '../style/SidebarContent.scss';

// specific down arrow svg used in Figma
import downArrow from '../down.svg';

function Category({ category, pages, handleLinkSelected }) {
  // this ensures that there are any pages (at all) for a category
  if (Object.prototype.hasOwnProperty.call(pages, category)) {
    const prioritized = pages[category].sort((a, b) => {
      if (a.priority < b.priority) return -1;
      if (a.priority > b.priority) return 1;
      return 0;
    });
    return prioritized.map(({ fileName, title, numbered }, i) => {
      // if the page is numbered, use the current map index
      const preText = numbered ? `${i + 1}.` : '';
      return (
        <div key={fileName}
             className='sidebar-category-subitem'
        >
          <Link key={fileName}
                onClick={handleLinkSelected}
                style={{
                  textDecoration: 'none',
                  color: 'black',
                  outline: 'none'
                }}
                to={fileName}
          >
            {preText} {title}
          </Link>
        </div>
      );
    })
  }
  return null;
}

// Displays a TOC for all navigable content on the site.
//
// Changes size/behavior based on the view area
//
function SidebarContent(props) {
  const { pages, handleLinkSelected, categories, isResponsive } = props;

  // Sort our pages into their respective sidebar categories. Pages without
  // matching categories will be assigned the 'unknown' container
  const pagesByCategory = { unknown: [] };
  pages.forEach((page) => {
    const lowerCat = page.category.toLowerCase();
    if (page.category === undefined) {
      // add all uncategorizable pages to unknown category (not rendered)
      pagesByCategory['unknown'].push({ ...page });
    } else if (Object.prototype.hasOwnProperty.call(pagesByCategory, lowerCat)) {
      pagesByCategory[lowerCat].push({ ...page });
    } else {
      pagesByCategory[lowerCat] = [{ ...page }];
    }
  });

  // determines whether the current view area is small enough
  // to warrant responisve content
  const rClass = isResponsive ? 'responsive-card' : '';
  const contentClass = isResponsive ?
    'sidebar-responsive-content' : 'sidebar-content';

  return (
    <div className='sidebar'>
      <div className={contentClass}>
        <Accordion className='sidebar-accordion'>
          {
            categories.map((category, i) => {
              // case sensitivity makes the process very error prone
              const lowerCat = category.toLowerCase();
              const eKey = isResponsive ? undefined : i;
              return (
                <Card className={rClass} key={lowerCat}>
                  <Card.Header>
                    <Accordion.Toggle as={Button} variant='link' eventKey={eKey}>
                      <span className='sidebar-category'>
                        {category.toUpperCase()}&nbsp;&nbsp;
                      </span>
                      {
                        (eKey !== undefined) &&
                          <img src={downArrow} alt='Down arrow'/>
                      }
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey={eKey}>
                    <Card.Body>
                      {
                        <Category category={lowerCat}
                                  pages={pagesByCategory}
                                  handleLinkSelected={handleLinkSelected}
                        />
                      }
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              );
            })
          }
        </Accordion>
      </div>
    </div>
  );
}

export default withRouter(SidebarContent);
