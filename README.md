# rehype-merge-cells

A [rehype](https://github.com/rehypejs/rehype) plugin that merges adjacent table cells with identical content.

It operates on HAST nodes in a [unified](https://github.com/unifiedjs/unified) / rehype pipeline. It works with standard GFM Markdown tables and needs no custom table syntax or markers. Vertically adjacent cells are merged using `rowspan`, horizontally adjacent cells using `colspan`.

This package implements the same merging algorithm as `markdown-it-merge-cells`.

## Features

- Supports standard GFM Markdown tables.
- No custom table syntax or marker is required.
- Merges vertically adjacent cells with the same content using `rowspan`.
- Merges horizontally adjacent cells with the same content using `colspan`.
- Runs vertical merging before horizontal merging.
- Prevents invalid horizontal merges by requiring the matched cells to share the same rowspan height.
- Never merges header cells with body cells.
- Recognizes matching inline structures such as emphasis and links.

## Install

```sh
npm install rehype-merge-cells
```

```sh
yarn add rehype-merge-cells
```

```sh
pnpm add rehype-merge-cells
```

## Usage

```js
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import rehypeMergeCells from 'rehype-merge-cells';

const markdown = `
|1|1|3|4|5|
|-|-|-|-|-|
|1|1|2|2|6|
|1|1|2|2|7|
|1|4|3|5|5|
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeMergeCells)
  .use(rehypeStringify)
  .process(markdown);

console.log(String(file));
```

Output:

<table>
<thead>
<tr>
<th colspan="2">1</th>
<th>3</th>
<th>4</th>
<th>5</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="3">1</td>
<td rowspan="2">1</td>
<td rowspan="2" colspan="2">2</td>
<td>6</td>
</tr>
<tr>
<td>7</td>
</tr>
<tr>
<td>4</td>
<td>3</td>
<td colspan="2">5</td>
</tr>
</tbody>
</table>

```html
<table>
<thead>
<tr>
<th colspan="2">1</th>
<th>3</th>
<th>4</th>
<th>5</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="3">1</td>
<td rowspan="2">1</td>
<td rowspan="2" colspan="2">2</td>
<td>6</td>
</tr>
<tr>
<td>7</td>
</tr>
<tr>
<td>4</td>
<td>3</td>
<td colspan="2">5</td>
</tr>
</tbody>
</table>
```

## API

### `rehypeMergeCells()`

Returns a rehype transformer that visits every `table` element and merges its cells in place.

The plugin is available as both a default and a named export:

```js
import rehypeMergeCells from 'rehype-merge-cells';
// or
import { rehypeMergeCells } from 'rehype-merge-cells';
```

## Merging rules

Given a table matrix, the plugin applies two passes, in order:

1. **Vertical pass** — cells in the same column with identical content are merged upward and assigned `rowspan`.
2. **Horizontal pass** — cells in the same row with identical content are merged leftward and assigned `colspan`.

The horizontal pass only proceeds when the candidate cells also share the same rowspan height, which keeps the resulting HTML table layout valid.

Header cells are never merged vertically with body cells, although cells within the same header row can still be merged horizontally.

> **Why vertical first?** A column usually represents a field and a row a record. It is far more common for several records to repeat the same value in one field than for one record to repeat the same value across several fields — so vertical merging is allowed to run freely, while horizontal merging is constrained to cells that already line up in height.

## Development

Install dependencies:

```sh
yarn install
```

Run tests:

```sh
yarn test
```

Update AVA snapshots:

```sh
yarn test:snapshot
```

AVA stores snapshots next to the tests in `test/snapshots/`, including the binary `.snap` file and the readable `.md` report.

## Author

**rehype-merge-cells** © [Baoshuo](https://github.com/renbaoshuo), Released under the [MIT](https://github.com/renbaoshuo/rehype-merge-cells/blob/master/LICENSE) License.

> [Personal Website](https://baoshuo.ren) · [Blog](https://blog.baoshuo.ren) · GitHub [@renbaoshuo](https://github.com/renbaoshuo)
