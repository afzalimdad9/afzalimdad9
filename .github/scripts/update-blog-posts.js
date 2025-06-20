const fs = require('fs');
const axios = require('axios');

const DEVTO_USERNAME = 'afzalimdad9';
const MEDIUM_USERNAME = 'afzalimdad9';
const BLOG_SECTION_REGEX = /<!-- BLOG-POST-LIST:START -->([\s\S]*?)<!-- BLOG-POST-LIST:END -->/;

async function fetchDevToPosts(username, count = 3) {
  try {
    const url = `https://dev.to/api/articles?username=${username}&per_page=${count}`;
    const { data } = await axios.get(url);
    return data.slice(0, count).map(post =>
      `- [${post.title}](${post.url}) _(Published: ${new Date(post.published_at).toLocaleDateString()})_`
    );
  } catch (e) {
    return ['- Could not fetch dev.to posts'];
  }
}

async function fetchMediumPosts(username, count = 3) {
  try {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${username}`;
    const { data } = await axios.get(url);
    if (!data.items) return ['- Could not fetch Medium posts'];
    return data.items.slice(0, count).map(post =>
      `- [${post.title}](${post.link}) _(Published: ${new Date(post.pubDate).toLocaleDateString()})_`
    );
  } catch (e) {
    return ['- Could not fetch Medium posts'];
  }
}

async function updateReadmeWithPosts() {
  const readmePath = 'README.md';
  let readme = fs.readFileSync(readmePath, 'utf8');

  const devtoPosts = await fetchDevToPosts(DEVTO_USERNAME, 3);
  const mediumPosts = await fetchMediumPosts(MEDIUM_USERNAME, 3);

  const allPosts = [
    '**From dev.to:**',
    ...devtoPosts,
    '',
    '**From Medium:**',
    ...mediumPosts,
  ];

  const newSection = `<!-- BLOG-POST-LIST:START -->\n${allPosts.join('\n')}\n<!-- BLOG-POST-LIST:END -->`;
  readme = readme.replace(BLOG_SECTION_REGEX, newSection);
  fs.writeFileSync(readmePath, readme);
  console.log('✅ Blog posts updated!');
}

updateReadmeWithPosts();