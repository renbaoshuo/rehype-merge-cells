import { readFile } from 'node:fs/promises';

import test from 'ava';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import rehypeMergeCells from '../src/index.js';

async function renderFixture(name) {
  const input = await readFile(new URL(`fixtures/${name}`, import.meta.url), 'utf8');
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeMergeCells)
    .use(rehypeStringify)
    .process(input);

  return String(file);
}

const cases = [
  {
    name: 'mixed.md',
    includes: [
      '<th colspan="2">1</th>',
      '<td rowspan="3">1</td>',
      '<td rowspan="2">1</td>',
      '<td rowspan="2" colspan="2">2</td>',
      '<td colspan="2">5</td>',
    ],
  },
  {
    name: 'vertical.md',
    includes: ['<td rowspan="2">Alice</td>'],
  },
  {
    name: 'horizontal.md',
    includes: ['<th colspan="2">A</th>', '<td colspan="2">C</td>'],
  },
  {
    name: 'rowspan-gate.md',
    includes: ['<td rowspan="2">A</td>', '<td>A</td>', '<td rowspan="2">X</td>'],
    excludes: ['<td rowspan="2" colspan="2">A</td>'],
  },
  {
    name: 'no-merge.md',
    excludes: ['rowspan=', 'colspan='],
  },
  {
    name: 'boundary.md',
    includes: ['<th colspan="2">Same</th>', '<td rowspan="2">Same</td>'],
  },
  {
    name: 'inline.md',
    includes: ['<th colspan="2"><em>A</em></th>', '<td colspan="2"><a href="./x">x</a></td>'],
  },
];

for (const { name, includes = [], excludes = [] } of cases) {
  test(name, async (t) => {
    const output = await renderFixture(name);

    for (const expected of includes) {
      t.true(output.includes(expected), expected);
    }

    for (const unexpected of excludes) {
      t.false(output.includes(unexpected), unexpected);
    }

    t.snapshot(output);
  });
}
