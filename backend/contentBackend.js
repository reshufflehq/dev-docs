import { get, update, Q, find } from '@binaris/shift-db';

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
 * Authenticated route which attempts to update or create a
 * post, based on the provided content. The unique key of the
 * content is based on the route attribute defined in the
 * contents frontmatter. If the content does not define a route
 * attribute, this method will fail.
 *
 * @param { string } jwt - token used for identification
 * @param { string } content - valid markdown content with fronmatter containing route
 * attribute
 * @param { string } clientPrevContent - the content state the client currently believes exists in the
 * remote
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

  let potentialError = undefined;
  try {
    await update(`content__${route}`, (prevContent) => {
      return parsed;
    });
  } catch (err) {
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

/**
 * Returns the metadata of all content.
 *
 * @return {object} - metadata of content
 */
// @expose
export async function getContentMeta() {
  const found = await find(Q.filter(Q.key.startsWith(contentPrefix)));
  // even if this is empty it works
  return found.map(({ value }) => value.attributes);
}
