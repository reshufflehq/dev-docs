import unified from 'unified';
import parse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import stringify from 'rehype-stringify';
import slug from 'rehype-slug';
import link from 'rehype-autolink-headings';
import fm from 'front-matter';
import raw from 'rehype-raw';

const processor = unified()
  .use(parse)
  .use(remark2rehype, { allowDangerousHTML: true })
  .use(raw)
  .use(slug)
  .use(link)
  .use(stringify);

/**
 * Given raw markdown, this function does the following
 *
 * 1. Extract frontmatter from markdown body
 * 2. Parse remaining markdown into valid HTML
 * 3. Return all parsed data + initial raw repr
 *
 * The format of the returned object:
 *
 * {
 *   attributes: [key: string]: string; // K/V of extracted frontmatter attributes
 *   body: string; // everything but fronmatter from the original doc
 *   frontmatter: string; // unparsed frontmatter repr from doc
 *   parsed: string; // html repr of the input markdown content
 *   raw: string; // input markdown
 * }
 *
 * @param { string } markdownContent - content to parse
 *
 * @return { object } - the parsed markdown, frontmatter and raw
 */
export async function parseMDLocal(markdownContent) {
  const fmContent = fm(markdownContent);
  const { contents } = await processor.process(fmContent.body);
  return {
    ...fmContent,
    parsed: contents,
    raw: markdownContent
  };
}
