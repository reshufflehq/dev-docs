import { create, get, update, remove } from '@binaris/shift-db';

import { promisify } from 'util';
import { cwd } from 'process';
import { basename, join } from 'path';
import { readFile } from 'fs';

import unified from 'unified';
import parse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import stringify from 'rehype-stringify';
import slug from 'rehype-slug';
import link from 'rehype-autolink-headings';
import glob from 'glob';
import fm from 'front-matter';

import { validateJWT } from './authBackend';

const processor = unified()
  .use(parse)
  .use(remark2rehype)
  .use(slug)
  .use(link)
  .use(stringify);

const globAsync = promisify(glob);
const readAsync = promisify(readFile);
const postsDir = 'backend/posts';

/* @expose */
async function parseInternalMD(markdownContent) {
  const fmContent = fm(markdownContent);
  const { contents } = await processor.process(fmContent.body);
  fmContent.parsed = contents;
  return {
    ...fmContent,
    raw: markdownContent,
  };
}

function cleanRoute(someString) {
  return someString.replace(/\s+/g, '-').toLowerCase();
}

async function loadPostsFromFile(existingPosts = {}) {
  // match all markdown files inside the specified posts
  // directory, or any of its subdirectories
  const globPath = join(cwd(), postsDir, '**/*.md');
  const allFiles = await globAsync(globPath, {});
  const loadedPosts = { ...existingPosts };
  // attempt to load all matched paths from the filesystem
  await Promise.all(allFiles.map(async (filePath) => {
    // pure filename no extension
    const rawFileName = basename(filePath, '.md');
    try {
      const rawMD = await readAsync(filePath, 'utf8');
      const parsed = await parseInternalMD(rawMD);
      let resolvedRoute = cleanRoute(rawFileName);
      if (parsed.route !== undefined) {
        resolvedRoute = cleanRoute(parsed.attributes.route);
      }
      if (loadedPosts[resolvedRoute] !== undefined) {
        throw new Error(`Route ${resolvedRoute} already exists`);
      }

      parsed.route = resolvedRoute;
      loadedPosts[resolvedRoute] = parsed;
    } catch (err) {
      // make sure a broken post doesn't get returned
      console.error(err);
    }
  }));
  return loadedPosts;
}

async function getPosts() {
  const storedPosts = await get('posts');
  if (storedPosts !== undefined) {
    return storedPosts;
  } else {
    const loaded = await loadPostsFromFile();
    await remove('posts');
    await create('posts', loaded);
    return loaded;
  }
}

/* @expose */
export async function parseMDPost(jwt, markdownContent) {
  await validateJWT(jwt);
  return parseInternalMD(markdownContent);
}

/* @expose */
export async function updatePost(jwt, postContent, prevContent = null) {
  await validateJWT(jwt);
  const parsed = await parseInternalMD(postContent);
  const route = parsed.attributes.route;
  // for some reason returning errors out of the updater
  // seems to not work as expected
  let potentialError = undefined;
  try {
    await update('posts', (prevPosts) => {
      const copied = { ...prevPosts };
      if (route === undefined) {
        potentialError = {
          type: 'error',
          code: 'CONTENT_MISSING_FIELD',
          message: `Post: "${postId}" must contain "route:" field in frontmatter`,
        };
        throw new Error(potentialError.message);
      }
      const clean = cleanRoute(route);
      if (prevContent !== null && prevContent !== copied[clean].raw) {
        potentialError = {
          type: 'error',
          code: 'CONTENT_HAS_CHANGED',
          message: `Post at route: "${clean}" has been modified since reading`,
        };
        throw new Error(potentialError.message);
      }
      copied[clean] = parsed;
      return copied;
    });
  } catch (err) {
    return potentialError || {
      type: 'error',
      code: 'UNKNOWN_ERROR',
      message: err.message,
    };
  }
}

/* @expose */
export async function getRawByRoute(jwt, route) {
  await validateJWT(jwt);
  const loadedPosts = await getPosts();
  const postKeys = Object.keys(loadedPosts);
  for (let i = 0; i < postKeys.length; i += 1) {
    // extract the attributes which are derived from post frontmatter
    const { attributes } = loadedPosts[postKeys[i]];
    if (cleanRoute(attributes.route) === cleanRoute(route)) {
      return loadedPosts[postKeys[i]];
    }
  }
  throw new Error(`No post found with route: ${route}`);
}

/**
 * Load a post from the backend. Case of the title does
 * not matter, as all titles are compared with lowercase.
 *
 * @param { string } title - what the post is named
 *
 * @return { string } - html representation of the post
 */
// @expose
export async function loadPostByRoute(route) {
  const loadedPosts = await getPosts();
  const postKeys = Object.keys(loadedPosts);
  for (let i = 0; i < postKeys.length; i += 1) {
    // extract the attributes which are derived from post frontmatter
    const { attributes } = loadedPosts[postKeys[i]];
    if (cleanRoute(attributes.route) === cleanRoute(route)) {
      return loadedPosts[postKeys[i]].parsed;
    }
  }
  throw new Error(`No post found for route: ${route}`);
}

/**
 * Returns the metadata of all posts that currently
 * reside in the backend posts directory.
 *
 * @return {object} - metadata of posts
 */
// @expose
export async function getPostMeta() {
  const loadedPosts = await getPosts();
  const meta = Object.keys(loadedPosts).map((postKey) => {
    return {
      ...loadedPosts[postKey].attributes,
    };
  });
  return meta;
}
