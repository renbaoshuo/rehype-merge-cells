import type { Root } from 'hast';
import type { Plugin } from 'unified';

export type RehypeMergeCells = Plugin<[], Root>;

export const rehypeMergeCells: RehypeMergeCells;

export default rehypeMergeCells;
