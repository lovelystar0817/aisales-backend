import { PopulatedDoc, Types } from 'mongoose';

export type Leanify<T> = {
  [K in keyof T]: T[K] extends (infer U)[]
    ? Leanify<U>[]
    : T[K] extends PopulatedDoc<infer U> // handle populated refs
      ? Types.ObjectId | Leanify<U>
      : T[K] extends object // recurse into nested objects
        ? Leanify<T[K]>
        : T[K]; // primitive stays the same
};
