import {
  create,
  get,
  remove,
  update,
} from '@binaris/shift-db';

import { validateJWT } from './authBackend';
import { parseMDLocal } from './parseMD';

const contentKey = 'content';

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
 * Retrieves all content stored at the user-defined
 * "contentKey". If no content is found, an empty object
 * will be created at the "contentKey".
 */
async function getContent() {
  return await get(contentKey) || {};
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
export async function updateContent(jwt, content, clientPrevContent = null) {
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
  // for some reason returning errors out of the updater
  // seems to not work as expected
  let potentialError = undefined;
  try {
    await update(contentKey, (prevContent) => {
      // start with an empty object if no value
      // already exists at the key
      const copied = { ...(prevContent || {}) };
      // routes are forced into valid shape
      // this makes it hard to accidentally overwrite content
      if (clientPrevContent !== null &&
          clientPrevContent !== copied[route].raw) {
        potentialError = {
          type: 'error',
          code: 'CONTENT_HAS_CHANGED',
          message: `Content at route: "${route}" has been modified since reading`,
        };
        throw new Error(potentialError.message);
      }
      return {
        ...copied,
        route: parsed,
      };
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
  const loadedContent = await getContent();
  const contentKeys = Object.keys(loadedContent);
  for (let i = 0; i < contentKeys.length; i += 1) {
    // extract the attributes which are derived from content frontmatter
    const { attributes } = loadedContent[contentKeys[i]];
    if (cleanRoute(attributes.route) === cleanRoute(route)) {
      return loadedContent[contentKeys[i]];
    }
  }
  throw new Error(`No content found for route: "${route}"`);
}

/**
 * Load content from the backend. Case of the title does
 * not matter, as all titles are compared with lowercase.
 *
 * @param { string } title - what the content is named
 *
 * @return { string } - html representation of the content
 */
// @expose
export async function loadContentByRoute(route) {
  const loadedContent = await getContent();
  const contentKeys = Object.keys(loadedContent);
  for (let i = 0; i < contentKeys.length; i += 1) {
    // extract the attributes which are derived from content frontmatter
    const { attributes } = loadedContent[contentKeys[i]];
    if (cleanRoute(attributes.route) === cleanRoute(route)) {
      return loadedContent[contentKeys[i]].parsed;
    }
  }
  throw new Error(`No content found for route: ${route}`);
}

/**
 * Returns the metadata of all content.
 *
 * @return {object} - metadata of content
 */
// @expose
export async function getContentMeta() {
  const loaded = await getContent();
  return Object.keys(loaded).map((key) =>
    loaded[key].attributes);
}
