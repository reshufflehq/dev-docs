import { get, update, Q, find, remove } from '@reshuffle/db';

import { validateJWT } from './authBackend';
import { parseMDLocal } from './parseMD';

const contentPrefix = 'content__';

// Routes must adhere to a specific format (because
// they literally are turned into URL paths). No spaces
// and only lowercase letters.
//
// Note: this is not a security check and not foolproof,
//       only for convenience.
//
function cleanRoute(someRoute) {
  return someRoute.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Authenticate a user using jwt, and then validate
 * the provided route by checking for null/undefined.
 *
 * @param { string } jwt - token used for identification
 * @param { string } route - site route that will be validated
 * @param { string } invalidRouteError - error that should be thrown on invalid route
 */
async function authUserAndValidateRoute(jwt, route, invalidRouteError) {
  await validateJWT(jwt);
  if (route === undefined || route === null) {
    throw new Error(invalidRouteError || 'Invalid route');
  }
}

/**
 * Authenticated route which will convert raw markdown
 * into its valid HTML repr. Also returns frontmatter
 * attributes extracted from the original content.
 *
 * @param { string } jwt - token used for identification
 * @param { string } markdownContent - content to parse
 *
 * @return { object } - parsed content and attributes
 */
/* @expose */
export async function parseMD(jwt, markdownContent) {
  await validateJWT(jwt);
  return parseMDLocal(markdownContent);
}

/**
 * Set the site's home route
 *
 * @param { string } jwt - token used for identification
 * @param { string } route - route to set as home
 *
 */
/* @expose */
export async function setRouteAsHome(jwt, route) {
  await authUserAndValidateRoute(jwt, route, 'Cannot set undefined or null route as home');
  await update('homeRoute', () => route);
}


/**
 * Delete the post at the specified route
 *
 * @param { string } jwt - token used for identification
 * @param { string } route - which post to delete
 */
/* @expose */
export async function deletePostByRoute(jwt, route) {
  await authUserAndValidateRoute(jwt, route, 'Cannot delete undefined or null route');
  await remove(`${contentPrefix}${route}`);
}

/**
 * Disable the post at the specified route
 *
 * @param { string } jwt - token used for identification
 * @param { string } route - which post to disable/enable
 * @param { boolean } disabled - enable or disable this route
 */
/* @expose */
export async function setDisabledPostByRoute(jwt, route, disabled) {
  await authUserAndValidateRoute(jwt, route, 'Cannot disable undefined or null route');
  await update(`${contentPrefix}${route}`, (prevContent) => ({
    ...prevContent,
    disabled,
  }));
}

/**
 * Authenticated route which attempts to update or create a
 * post, based on the provided content. The unique key of the
 * content is based on the route attribute defined in the
 * contents frontmatter. If the content does not define a route
 * attribute, this method will fail.
 *
 * @param { string } jwt - token used for identification
 * @param { string } content - valid markdown content with fronmatter containing route
 * attribute
 */
/* @expose */
export async function updateContent(jwt, content) {
  await validateJWT(jwt);
  // parse the client provided markdown to extract
  // the route attribute
  const parsed = await parseMDLocal(content);
  // content must have a route
  if (parsed.attributes.route === undefined) {
    return {
      type: 'error',
      code: 'CONTENT_MISSING_FIELD',

      message: `Content: must contain "route" field in frontmatter`,
    };
  }
  const route = cleanRoute(parsed.attributes.route);

  try {
    await update(`${contentPrefix}${route}`, (prevContent) => ({
      disabled: (prevContent ? prevContent.disabled : true),
      ...parsed,
    }));
  } catch (err) {
    console.error(err);
    // "err" object is currently wrapped by backend,
    // this makes it very hard to use
    return potentialError || {
      type: 'error',
      code: 'UNKNOWN_ERROR',
      message: err.message,
    };
  }
}

async function contentByRoute(route) {
  const content = await get(`${contentPrefix}${cleanRoute(route)}`);
  if (content === undefined) {
    throw new Error(`No content found for route: ${route}`);
  } else if (content.disabled) {
    throw new Error(`Content at route: ${route} is disabled`);
  }
  return content;
}

/**
 * Authenticated route which retrieves the raw markdown
 * representation of existing content.
 *
 * @param { string } jwt - token used for identification
 * @param { string } route - route of raw markdown content to retrieve
 *
 * @return { string } - raw markdown for provided route
 */
/* @expose */
export async function getContentByRoute(jwt, route) {
  await validateJWT(jwt);
  return await contentByRoute(route);
}

/**
 * Load content from the backend. Case of the route does
 * not matter, as all routes are compared with lowercase.
 *
 * @param { string } routes - what the content is named
 *
 * @return { string } - html representation of the content
 */
// @expose
export async function loadContentByRoute(route) {
  const { parsed } = await contentByRoute(route);
  return parsed;
}

async function queryMeta() {
  return {
    found: await find(Q.filter(Q.key.startsWith(contentPrefix))),
    homeRoute: await get('homeRoute') || undefined,
  };
}

/**
 * Returns the metadata of all content.
 *
 * @return {object} - metadata of content
 */
/** @expose */
export async function getContentMeta(jwt) {
  await validateJWT(jwt);
  const { found, homeRoute } = await queryMeta();
  const foundWithDisabled = found.map(({ value }) => {
    return { ...value.attributes, disabled: value.disabled };
  });
  return {
    content: foundWithDisabled,
    homeRoute,
  };
}

/**
 * Returns the metadata of all public content.
 *
 * @return {object} - metadata of public content
 */
/** @expose */
export async function getPublicContentMeta() {
  const { found, homeRoute } = await queryMeta();
  const onlyPublic = found.filter(({ value }) => !value.disabled);
  // even if this is empty it works
  return {
    content: onlyPublic.map(({ value }) => value.attributes),
    homeRoute,
  };
}
