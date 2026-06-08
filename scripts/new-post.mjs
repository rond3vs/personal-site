// Scaffold a new blog post with valid frontmatter, so you never have to
// remember the fields.
//
//   npm run new -- "My Post Title"
//
// Creates src/content/blog/<slug>.md as a draft (hidden until you flip it).
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new -- "My Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const dir = 'src/content/blog';
const file = `${dir}/${slug}.md`;
if (existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

// category options: Lessons | Hunches | Rants
const post = `---
title: ${title}
description:
date: ${today}
category: Rants
draft: true
---

Write your post here.
`;

mkdirSync(dir, { recursive: true });
writeFileSync(file, post);

console.log(`\n✅ Created ${file}`);
console.log(`   - fill in "description" and pick a category (Lessons | Hunches | Rants)`);
console.log(`   - it's a draft (hidden live, visible in npm run dev)`);
console.log(`   - set draft: false when ready, then optionally: npm run stamp -- ${slug}\n`);
