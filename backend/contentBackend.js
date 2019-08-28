import { create, get } from '@binaris/shift-db';

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

const processor = unified()
  .use(parse)
  .use(remark2rehype)
  .use(slug)
  .use(link)
  .use(stringify);

const globAsync = promisify(glob);
const readAsync = promisify(readFile);

const postsDir = 'backend/posts';

async function loadAllPosts() {
  // match all markdown files inside the specified posts
  // directory, or any of its subdirectories
  const globPath = join(cwd(), postsDir, '**/*.md');
  const allFiles = await globAsync(globPath, {});
  const loadedPosts = {};
  // attempt to load all matched paths from the filesystem
  await Promise.all(allFiles.map(async (filePath) => {
    // pure filename no extension
    const rawFileName = basename(filePath, '.md');
    try {
      const rawMD = await readAsync(filePath, 'utf8');
      // just add the frontmatter
      loadedPosts[rawFileName] = fm(rawMD);
      const { contents } = await processor.process(loadedPosts[rawFileName].body);
      loadedPosts[rawFileName].parsed = contents;
    } catch (err) {
      // make sure a broken post doesn't get returned
      delete loadedPosts[rawFileName];
      console.error(err);
    }
  }));
  return loadedPosts;
}

async function getPosts() {
  const loaded = await loadAllPosts();
  // once the DB is more flexible we can actually rely on
  // it for retrieving the post contents
  create('posts', loaded);
  return loaded;
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
export async function loadPostByTitle(title) {
  const loadedPosts = await getPosts();
  const postKeys = Object.keys(loadedPosts);
  for (let i = 0; i < postKeys.length; i += 1) {
    // extract the attributes which are derived from post frontmatter
    const { attributes } = loadedPosts[postKeys[i]];
    if (attributes.title.toLowerCase() === title.toLowerCase()) {
      return loadedPosts[postKeys[i]].parsed;
    }
  }
  throw new Error(`No post found with title: ${title}`);
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
      fileName: postKey,
    };
  });
  return meta;
}
