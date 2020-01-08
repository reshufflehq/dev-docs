import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';

import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import isExternal from 'is-url-external';

import '../style/SidebarContent.scss';

// specific down and right arrow svg used in Figma
import downArrow from '../down.svg';
import rightArrow from '../right.svg';
import externalLink from '../external-link.svg';

function Category({ category, pages, handleLinkSelected }) {
  // this ensures that there are any pages (at all) for a category
  if (Object.prototype.hasOwnProperty.call(pages, category)) {
    const prioritized = pages[category].sort((a, b) => {
      if (a.priority < b.priority) return -1;
      if (a.priority > b.priority) return 1;
      return 0;
    });
    return prioritized.map(({ route, title, numbered }, i) => {
      // if the page is numbered, use the current map index
      const preText = numbered ? `${i + 1}.` : '';
      
      return (
        <CategoryItem key={route}
                      preText={preText} 
                      route={route} 
                      title={title} 
                      handleLinkSelected={handleLinkSelected} />
      );
    })
  }
  return null;
}

function CategoryItem({route, title, preText, handleLinkSelected}) {
  const [active, setActive] = useState(false);
  
  const isActive = (match) => {
    if (!(match && active)) {
      setActive(match);      
    }

    return match;
  };
    
  return (
    <div key={route}
         className='sidebar-category-subitem'
    >
      {active ? (<span className='sidebar-category-subitem-active'/>) : null}
      <NavLink key={route}
        className={`sidebar-category-subitem-item ${active ? 'sidebar-category-subitem-active-text': ''}`}
        isActive={isActive}
        to={'/' + route}
        onClick={handleLinkSelected}
      >
        {preText} {title}
      </NavLink>
    </div>
  );
}

// Displays a TOC for all navigable content on the site.
//
// Changes size/behavior based on the view area
//
function SidebarContent(props) {
  const {
    categories,
    standaloneItems,
    currentCat,
    handleLinkSelected,
    isResponsive,
    pages,
    routeChanged,
  } = props;

  const [pickedCat, pickCat] = useState(currentCat);
  useEffect(() => {
    if (routeChanged) {
      pickCat(currentCat);
    }
  }, [routeChanged, currentCat]);

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

  const handleCategoryPicked = (category) => {
    if (pickedCat === category) {
      pickCat(undefined);
    } else {
      pickCat(category);
    }
  }

  // determines whether the current view area is small enough
  // to warrant responisve content
  const rClass = isResponsive ? 'responsive-card' : '';
  const contentClass = isResponsive ?
    'sidebar-responsive-content' : 'sidebar-content';
  const activeKey = isResponsive ? undefined : pickedCat;

  return (
    <div className='sidebar'>
      <div className={contentClass}>
        <Accordion className='sidebar-accordion'
                   activeKey={activeKey}
        >
          {
            categories.map((category, i) => {
              // case sensitivity makes the process very error prone
              const lowerCat = category.toLowerCase();
              let eKey = isResponsive ? undefined : category;
              return (
                <Card className={rClass} key={lowerCat}>
                  <Card.Header>
                    <Accordion.Toggle as={Button}
                                      variant='link'
                                      eventKey={eKey}
                                      onClick={() => handleCategoryPicked(category)
                    }>
                      <span className='sidebar-category'>
                        {category.toUpperCase()}&nbsp;&nbsp;
                      </span>
                      {
                        (activeKey === category) ?
                          <img src={rightArrow} alt='Right arrow'/>
                        :
                          <img src={downArrow} alt='Down arrow'/>
                      }
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey={eKey}>
                    <Card.Body className='custom-card-body'>
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
          {
            standaloneItems &&
            standaloneItems.map(({ displayName, linkOrRoute }) => {
              const extLink = isExternal(linkOrRoute);
              if (extLink) {
                return (
                  <Card className={rClass} key={displayName}>
                    <Card.Header>
                      <a href={linkOrRoute}
                         alt={displayName}
                         className='sidebar-standalone-item'
                      >
                        <span className='sidebar-category'>
                          {displayName.toUpperCase()}
                        </span>
                        <img src={externalLink}
                             alt='External link'
                             className='sidebar-external-link-icon'
                        />
                      </a>
                    </Card.Header>
                  </Card>
                );
              }
              return (
                <Card className={rClass} key={displayName}>
                  <Card.Header>
                    <NavLink to={linkOrRoute}
                             alt={displayName}
                             className='sidebar-standalone-item'
                    >
                      <span className='sidebar-category'>
                        {displayName.toUpperCase()}
                      </span>
                    </NavLink>
                  </Card.Header>
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
