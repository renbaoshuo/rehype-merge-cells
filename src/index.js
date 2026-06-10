import { visit } from 'unist-util-visit';

const ROW_GROUPS = new Set(['thead', 'tbody', 'tfoot']);
const CELL_TAGS = new Set(['td', 'th']);

function isElement(node, tagName) {
  return node?.type === 'element' && (tagName === undefined || node.tagName === tagName);
}

function isCell(node) {
  return isElement(node) && CELL_TAGS.has(node.tagName);
}

function toComparable(value) {
  if (Array.isArray(value)) {
    return value.map(toComparable);
  }

  if (value && typeof value === 'object') {
    const result = {};

    for (const key of Object.keys(value).sort()) {
      if (key !== 'position') {
        result[key] = toComparable(value[key]);
      }
    }

    return result;
  }

  return value;
}

function getContentKey(cell) {
  return JSON.stringify(toComparable(cell.children ?? []));
}

function getRows(table) {
  const rows = [];

  for (const child of table.children ?? []) {
    if (isElement(child, 'tr')) {
      rows.push(child);
    } else if (isElement(child) && ROW_GROUPS.has(child.tagName)) {
      for (const row of child.children ?? []) {
        if (isElement(row, 'tr')) {
          rows.push(row);
        }
      }
    }
  }

  return rows.map((node) => ({
    node,
    cells: (node.children ?? []).filter(isCell),
  }));
}

function createMatrix(rows) {
  const columnCount = rows[0]?.cells.length ?? 0;

  if (columnCount === 0) {
    return null;
  }

  if (rows.some((row) => row.cells.length !== columnCount)) {
    return null;
  }

  return rows.map((row, rowIndex) =>
    row.cells.map((node, columnIndex) => ({
      node,
      row: rowIndex,
      column: columnIndex,
      contentKey: getContentKey(node),
      rowspan: 1,
      colspan: 1,
      mergedTo: null,
    })),
  );
}

function mergeColumns(matrix) {
  const rowCount = matrix.length;
  const columnCount = matrix[0].length;

  for (let column = 0; column < columnCount; column += 1) {
    for (let row = 2; row < rowCount; row += 1) {
      const cell = matrix[row][column];
      const above = matrix[row - 1][column];

      if (cell.contentKey === above.contentKey) {
        const target = above.mergedTo ?? above;

        cell.mergedTo = target;
        target.rowspan += cell.rowspan;
        cell.rowspan = 0;
      }
    }
  }
}

function mergeRows(matrix) {
  const rowCount = matrix.length;
  const columnCount = matrix[0].length;

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 1; column < columnCount; column += 1) {
      const cell = matrix[row][column];
      const left = matrix[row][column - 1];

      if (cell.rowspan === 0 || left.rowspan === 0) {
        continue;
      }

      if (cell.contentKey !== left.contentKey) {
        continue;
      }

      const target = left.mergedTo ?? left;

      if (cell.rowspan !== target.rowspan) {
        continue;
      }

      cell.mergedTo = target;
      target.colspan += cell.colspan;
      cell.colspan = 0;
    }
  }
}

function applyMatrix(rows, matrix) {
  const removed = new WeakSet();

  for (const row of matrix) {
    for (const cell of row) {
      if (cell.mergedTo) {
        removed.add(cell.node);
        continue;
      }

      if (cell.rowspan > 1 || cell.colspan > 1) {
        cell.node.properties ??= {};

        if (cell.rowspan > 1) {
          cell.node.properties.rowSpan = cell.rowspan;
        }

        if (cell.colspan > 1) {
          cell.node.properties.colSpan = cell.colspan;
        }
      }
    }
  }

  for (const row of rows) {
    row.node.children = (row.node.children ?? []).filter((child) => !removed.has(child));
  }
}

function mergeTable(table) {
  const rows = getRows(table);
  const matrix = createMatrix(rows);

  if (!matrix || matrix.length < 1) {
    return;
  }

  mergeColumns(matrix);
  mergeRows(matrix);
  applyMatrix(rows, matrix);
}

export function rehypeMergeCells() {
  return (tree) => {
    visit(tree, (node) => isElement(node, 'table'), mergeTable);
  };
}

export default rehypeMergeCells;
