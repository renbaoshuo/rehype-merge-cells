# rehype-merge-cells

A rehype plugin to merge adjacent cells with the same content.

It will first merge cells with the same content in every _column_, and then merge cells with the same content in every _row_. If cells were merged in the first step, row merging only happens when the cells also have the same height. This is by design because usually a column is a field and a row is a record — it is more reasonable for multiple records to have the same value in a field than for multiple fields in a record to have the same value.

It works on HAST nodes in a unified / rehype pipeline.

This package uses the same merging algorithm as `markdown-it-merge-cells`.

## Features

- Supports standard GFM Markdown tables.
- No custom table syntax or marker is required.
- Merges vertically adjacent cells with the same content using `rowspan`.
- Merges horizontally adjacent cells with the same content using `colspan`.
- Runs vertical merging before horizontal merging.
- Prevents invalid horizontal merges by requiring cells to have the same rowspan height.
- Does not merge the table header with the table body.
- Supports matching inline content structures, such as emphasis and links.

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

Returns a rehype transformer that visits all `table` elements and mutates their cell nodes in place.

```js
import { rehypeMergeCells } from 'rehype-merge-cells';
```

The package also provides a default export:

```js
import rehypeMergeCells from 'rehype-merge-cells';
```

## Merging rules

Given a table matrix, the plugin applies two passes:

1. **Vertical pass**: cells in the same column with identical content are merged upward and assigned `rowspan`.
2. **Horizontal pass**: cells in the same row with identical content are merged leftward and assigned `colspan`.

Horizontal merging only happens when the cells have the same rowspan height. This keeps the resulting HTML table layout valid.

Header cells are not merged vertically with body cells, but cells inside the same header row can still be merged horizontally.

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
