import type { Root } from 'hast';

type Transformer = (tree: Root) => undefined;

export type RehypeMergeCells = () => Transformer;

export const rehypeMergeCells: RehypeMergeCells;

export default rehypeMergeCells;
