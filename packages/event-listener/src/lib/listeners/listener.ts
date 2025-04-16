import { EventEmitter } from 'events';

import { onError, voidAsyncFunction } from '../types';

export interface ListenerParams {
  start?: voidAsyncFunction;
  stop?: voidAsyncFunction;
  onError?: onError;
}

/**
 * A Listener class that manages event listeners for state changes.
 * @template T The type of the value being listened to. Defaults to unknown.
 */
export class Listener<T = unknown> {
  private emitter = new EventEmitter();
  private currentCallback: ((value: T) => Promise<void>) | null = null;

  /**
   * The start function called when all listeners are started.
   */
  public start: voidAsyncFunction;

  /**
   * The stop function called when all listeners are stopped.
   */
  public stop: voidAsyncFunction;

  /**
   * The error handling function to call when an error occurs.
   */
  public onError?: onError;

  /**
   * Constructor for the Listener class.
   * @param params The parameters object containing start and stop functions.
   */
  constructor({
    start = async () => {},
    stop = async () => {},
    onError,
  }: ListenerParams = {}) {
    this.start = start;
    this.stop = stop;
    this.onError = onError;
  }

  /**
   * Removes all listeners from the emitter.
   */
  removeAllListeners() {
    this.emitter.removeAllListeners();
  }

  /**
   * Registers a callback to be called when the state changes.
   * If a callback was previously registered, it will be replaced with the new one.
   * @param callback The function to call with the new state value.
   */
  onStateChange(callback: (value: T) => Promise<void>) {
    if (this.currentCallback) {
      this.emitter.removeListener('stateChange', this.currentCallback);
    }
    this.currentCallback = callback;
    this.emitter.on('stateChange', callback);
  }

  /**
   * Emits a state change event with the given value.
   * @param value The state value to emit.
   */
  protected emit(value: T) {
    this.emitter.emit('stateChange', value);
  }
}
