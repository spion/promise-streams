import { Stream, TransformOptions, Transform } from 'stream';

export interface Options extends TransformOptions {
  /**
   * The maximum number of concurrent promises that are allowed.
   * When this limit is reached, the stream will stop processing data and will
   * start buffering incoming objects. Defaults to `1`
   */
  concurrent: number;
}

export interface PromiseStream<T> extends Transform {
  /**
   * Like `this.push` in  [through2](//github.com/rvagg/through2), but takes promise
   * arguments. It returns a promise that resolves when the pushed promise resolves,
   * to make it possible to use `return this.push(data)`
   */
  push(val: T | Promise<T>): void;

  push(chunk: any, encoding?: string): boolean;

  /**
   * Creates a new mapping promise stream and pipes this promise stream to it.
   */
  map(
    opts: Options,
    fn: (data: T, enc?: string) => T | Promise<T>,
    end?: () => void | Promise<void>
  ): PromiseStream<T>;

  /**
   * Creates a new mapping promise stream and pipes this promise stream to it.
   */
  map(
    fn: (data: T, enc?: string) => T | Promise<T>,
    end?: () => void | Promise<void>
  ): PromiseStream<T>;

  /**
   * Creates a filtering promise stream
   * @param opts - the Options for the promise stream. Transform options are passed to the node
   *               Transform constructor
   * @param fn - function should return a boolean to indicate whether the data value should pass to
   *             the next stream
   * @param end callback to be called when the source stream completes
   */
  filter(
    opts: Options,
    fn: (data: T, enc?: string) => boolean | Promise<boolean>,
    end?: () => void | Promise<void>
  ): PromiseStream<T>;
  filter(
    fn: (data: T, enc?: string) => boolean | Promise<boolean>,
    end?: () => void | Promise<void>
  ): PromiseStream<T>;

  /**
   * Reduces the objects in this promise stream. The function takes the resolved
   * current accumulator and data object and should return the next accumulator
   * or a promise for the next accumulator.
   *
   * Example:
   *
   * ```js
   * process.stdin.pipe(split()).pipe(es.reduce(function(acc, el) {
   *     return acc + el;
   * })).promise().then(function(sum) {
   *
   * });
   * ```
   *
   * @param opts - the Options for the promise stream. Transform options are passed to the node
   *               Transform constructor
   * @param fn - A function that takes the resolved current accumulator
   *             and data object and should return the next accumulator
   *             or a promise for the next accumulator
   * @param end
   */
  reduce<U>(
    opts: Options,
    fn: (acc: U, data: T, enc?: string) => U | Promise<U>,
    end?: () => void | Promise<void>
  ): ReducePromiseStream<U>;

  reduce<U>(
    fn: (acc: U, data: T, enc?: string) => U | Promise<U>,
    end?: () => void | Promise<void>
  ): ReducePromiseStream<U>;

  /**
   *
   * Returns a promise fulfilled at the end of the stream, rejected if any errors
   * events are emitted by the stream.
   *
   * For ReducePromiseStreams, the promise is for the final reduction result. Any
   * stream errors or exceptions encountered while reducing will result with a
   * rejection of the promise.
   */
  promise(): Promise<any>;
}

export interface ReducePromiseStream<T> extends PromiseStream<T> {
  /**
   * The final accumulator value. Any
   * stream errors or exceptions encountered while reducing will result with a
   * rejection of the promise.
   */
  promise(): Promise<T>;
}

/**
 * Create a through-promise stream. Pass it a function that takes data and
 * encoding and uses `this.push` to push values or promises. This function should
 * return a promise that indicates when the object/chunk are fully processed.
 * @param opts - the Options for the promise stream. Transform options are passed to the node
 *               Transform constructor
 * @param fn - callback that takes data and encoding and uses this.push to push values/promises.
 *             Returns a promise indicating when the processing of that chunk has fully completed
 * @param end - callback to be called when the source stream completes.
 * @return A promise stream.
 */

export function through<T>(
  opts: Options,
  fn: (this: PromiseStream<T>, data: T, enc?: string) => Promise<any>,
  end?: () => Promise<any>
): PromiseStream<T>;

export function through<T>(
  fn: (this: PromiseStream<T>, data: T, enc?: string) => Promise<any>,
  end?: () => Promise<any>
): PromiseStream<T>;

/**
 * Create a new MapPromiseStream. The function
 * @param opts - the Options for the promise stream. Transform options are passed to the node
 *               Transform constructor
 * @param fn - function that returns a promise for the next object that will be pushed to the stream.
 * @param end - callback to be called when the source stream completes
 */
export function map<T>(
  opts: Options,
  fn: (data: T, enc?: string) => T | Promise<T>,
  end?: () => void | Promise<void>
): PromiseStream<T>;

export function map<T>(
  fn: (data: T, enc?: string) => T | Promise<T>,
  end?: () => void | Promise<void>
): PromiseStream<T>;

/**
 * Creates a filtering promise stream
 * @param opts - the Options for the promise stream. Transform options are passed to the node
 *               Transform constructor
 * @param fn - function should return a boolean to indicate whether the data value should pass to the
 *             next stream
 * @param end - callback to be called when the source stream completes
 */
export function filter<T>(
  opts: Options,
  fn: (data: T, enc?: string) => boolean | Promise<boolean>,
  end?: () => void | Promise<void>
): PromiseStream<T>;

export function filter<T>(
  fn: (data: T, enc?: string) => boolean | Promise<boolean>,
  end?: () => void | Promise<void>
): PromiseStream<T>;

/**
 * Reduces the objects in this promise stream. The function takes the resolved
 * current accumulator and data object and should return the next accumulator
 * or a promise for the next accumulator.
 *
 * Example:
 *
 * ```js
 * process.stdin.pipe(split()).pipe(es.reduce(function(acc, el) {
 *     return acc + el;
 * })).promise().then(function(sum) {
 *
 * });
 * ```
 *
 * @param opts - the Options for the promise stream. Transform options are passed to the node
 *               Transform constructor
 * @param fn - A function that takes the resolved current accumulator
 *             and data object and should return the next accumulator
 *             or a promise for the next accumulator
 * @param end
 */
export function reduce<T, U>(
  opts: Options,
  fn: (acc: U, data: T, enc?: string) => U | Promise<U>,
  end?: () => void | Promise<void>
): ReducePromiseStream<U>;

export function reduce<T, U>(
  fn: (acc: U, data: T, enc?: string) => U | Promise<U>,
  end?: () => void | Promise<void>
): ReducePromiseStream<U>;

/**
 * Waits for a stream to end, capturing any errors
 * @param s - the stream to wait for
 */
export function wait(s: Stream): Promise<void>;

/**
 * Collects all data from a stream into a single buffer or string, depending on the encoding of
 * the passed stream.
 * @param s - the stream to collect
 */
export function collect(s: Stream): Promise<Buffer | string>;

/**
 * Pipes the source stream to the destination stream and forwards all errors to the resulting
 * promise. The promise is fulfilled when the source stream ends.
 *
 * @param source - the source stream
 * @param destination - the destination stream
 */
export function pipe(source: Stream, destination: Stream): Promise<void>;

/**
 * Creates a pipeline by piping the source stream through multiple trasnform streams. Forwards all
 * errors to the resulting promise, which is resolved when all the transform streams complete.
 * @param source - stream that emits the source of data
 * @param destinations - series of transform streams ending with a sink through which the data
 *                       should be piped.
 */
export function pipeline(source: Stream, ...destinations: Stream[]): Promise<void>;
