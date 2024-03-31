import { type TerrainI } from './terrain/types.ts';
import { type SaveTileJson } from './types-savedgame.ts';

export type SeedI = string | number;

/**
 * A simple function that destroys whatever timeout/listener/async operation was set using
 * the method that returned it.
 *
 * @remarks
 * This type is a generic description of the _role_ of a function more so than the shape. Not every
 * function with the same shape fulfills the same role!
 *
 * Sometimes a destroyer function returns some useful info -- such as the time left on a cancelled
 * timeout.
 */
export type DestroyerFn<P = void> = () => P;

/**
 * A simple function that is called whenever this timeout/listener/async operation triggers or
 * finishes.
 *
 * Callbacks sometimes receive arguments, but never have a return value.
 *
 * @remarks
 * This type is a generic description of the _role_ of a function more so than the shape. Not every
 * function with the same shape fulfills the same role!
 */
export type CallbackFn<Args extends unknown[] = never[]> = (...args: Args) => void;

export type SortFn<T> = (a: T, b: T) => number;

export type FilterFn<T> = (a: T) => boolean;
