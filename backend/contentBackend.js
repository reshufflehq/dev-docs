import { get, update, Q, find, remove } from '@reshuffle/db';
import { validateUser } from './authBackend';
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
 * Authenticate a user and then validate
 * the provided route by checking for null/undefined.
 *
 * @param { string } route - site route that will be validated
 * @param { string } invalidRouteError - error that should be thrown on invalid route
 */
function validateRoute(route, invalidRouteError) {

  if (route === undefined || route === null) {
    throw new Error(invalidRouteError || 'Invalid route');
  }
}

/**
 * Authenticated route which will convert raw markdown
 * into its valid HTML repr. Also returns frontmatter
 * attributes extracted from the original content.
 *
 * @param { string }  - token used for identification
 * @param { string } markdownContent - content to parse
 *
 * @return { object } - parsed content and attributes
 */
/* @expose */
export function parseMD(markdownContent) {
  validateUser();

  return parseMDLocal(markdownContent);
}

/**
 * Set the site's home route
 *
 * @param { string }  - token used for identification
 * @param { string } route - route to set as home
 *
 */
/* @expose */
export async function setRouteAsHome(route) {
  validateUser();
  validateRoute(route, 'Cannot set undefined or null route as home');
  await update('homeRoute', () => route);
}

/**
 * Delete the post at the specified route
 *
 * @param { string } route - which post to delete
 */
/* @expose */
export async function deletePostByRoute(route) {
  validateUser();
  validateRoute(route, 'Cannot delete undefined or null route');
  await remove(`${contentPrefix}${route}`);
}

/**
 * Disable the post at the specified route
 *
 * @param { string } route - which post to disable/enable
 * @param { boolean } disabled - enable or disable this route
 */
/* @expose */
export async function setDisabledPostByRoute(route, disabled) {
  validateUser();
  validateRoute(route, 'Cannot disable undefined or null route');
  await update(`${contentPrefix}${cleanRoute(route)}`, prevContent => ({
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
 * @param { string } content - valid markdown content with fronmatter containing route
 * attribute
 */
/* @expose */
export async function updateContent(content) {
  validateUser();

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
      ...parsed,
      disabled: prevContent ? prevContent.disabled : true,
    }));
  } catch (err) {
    console.error(err);
    // "err" object is currently wrapped by backend,
    // this makes it very hard to use
    return {
      type: 'error',
      code: 'UNKNOWN_ERROR',
      message: err.message,
    };
  }
}

/**
 * Retrieves the content stored at a specified route. If
 * the request is authenticated, disabled content will be
 * returned, otherwise an error will be thrown.
 *
 * @param { string } route - identifier of content being requested
 * @param { boolean } authenticated - is this request authenticated
 *
 * @return { object } - content located at specified route
 */
async function contentByRoute(route, authenticated) {
  const content = await get(`${contentPrefix}${cleanRoute(route)}`);
  if (content === undefined) {
    throw new Error(`No content found for route: ${route}`);
  } else if (content.disabled && !authenticated) {
    throw new Error(`Content at route: ${route} is disabled`);
  }
  return content;
}

/**
 * Authenticated route which retrieves the raw markdown
 * representation of existing content.
 *
 * @param { string } route - route of raw markdown content to retrieve
 *
 * @return { string } - raw markdown for provided route
 */
/* @expose */
export async function getContentByRoute(route) {
  validateUser();

  return await contentByRoute(route, true);
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
  const { parsed } = await contentByRoute(route, false);
  return parsed;
}

/**
 * Retrieve all the content stored in the backend. Each
 * piece of content has the following structure.
 *
 * Content {
 *   parsed: string;
 *   frontmatter: string;
 *   body: string;
 *   raw: string;
 *   disabled?: boolean;
 *   attributes: object (can by anything included in frontmatter)
 * }
 *
 * @return { Content[] } - all of the content stored in the backend
 *
 */
async function getAllContent() {
  const contentQuery = await find(Q.filter(Q.key.startsWith(contentPrefix)));
  return contentQuery.map(({ value }) => value);
}

/**
 * Returns the homeRoute or undefined if no home is set.
 *
 * @return { string | undefined } - previously set homeRoute
 */
async function getHomeRoute() {
  return (await get('homeRoute'));
}

/**
 * Retrieve the metadata of all stored content. Metadata
 * includes all the frontmatter attributes, along with
 * the disabled/enabled state.
 *
 * Metadata {
 *   disabled: boolean;
 *   attributes: object;
 * }
 *
 * @return { object[] } - metadata of all content
 */
function getContentMetadata() {
  const allContent = getAllContent();
  return allContent.map(({ attributes, disabled }) => ({
    attributes,
    disabled,
  }));
}

/**
 * Returns the metadata representing all content on the
 * site (including disabled content), along with
 * optionally defined "homeRoute".
 *
 *
 * @return {object} - metadata of content
 */
/** @expose */
export function getSiteMetadata() {
  validateUser();

  return {
    contentMeta: getContentMetadata(),
    homeRoute: getHomeRoute(),
  };
}

/**
 * Returns the metadata of all public content on the site,
 * along with the optionally defined "homeRoute".
 *
 * @return {object} - metadata of public content
 */
/** @expose */
export function getSitePublicMeta() {
  const contentMeta = getContentMetadata();
  const onlyPublicMeta = contentMeta.filter(({ disabled }) => !disabled);
  return {
    contentMeta: onlyPublicMeta.map(({ attributes }) => attributes),
    homeRoute: getHomeRoute(),
  };
}


