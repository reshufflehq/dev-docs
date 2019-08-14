import { create, get } from '@binaris/shift-db';

import { promisify } from 'util';
import { cwd } from 'process';
import { join } from 'path';
import { readFile, readdir } from 'fs';

import fm from 'front-matter';
import marked from 'marked';

const readAsync = promisify(readFile);
const readdirAsync = promisify(readdir);

const mdRegex = new RegExp(/^.*\.(md)$/);

const postsDir = 'backend/posts';

async function loadAllPosts() {
  const joinedPath = join(cwd(), postsDir);
  const allFiles = await readdirAsync(joinedPath);
  const loadedPosts = {};
  await Promise.all(allFiles.map(async (fileName) => {
    if (mdRegex.test(fileName)) {
      const rawMD = await readAsync(join(joinedPath, fileName), 'utf8');
      loadedPosts[fileName] = fm(rawMD);
      loadedPosts[fileName].parsed = marked(loadedPosts[fileName].body);
    }
  }));
  return loadedPosts;
}

async function getPosts() {
  const loaded = await loadAllPosts();
  create('posts', loaded);
  return loaded;

  // const postsLoaded = await get('posts');

  // if (postsLoaded) {
  //   return postsLoaded;
  // } else {
  // }
}

// @expose
export async function loadPostByTitle(title) {
  const loadedPosts = await getPosts();

  const postKeys = Object.keys(loadedPosts);
  for (let i = 0; i < postKeys.length; i += 1) {
    const { attributes } = loadedPosts[postKeys[i]];
    if (attributes.title === title) {
      return loadedPosts[postKeys[i]].parsed;
    }
  }
  throw new Error(`No post found with title: ${title}`);
}

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
