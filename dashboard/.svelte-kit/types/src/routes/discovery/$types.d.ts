import type * as Kit from '@sveltejs/kit';

export type PageData = Expand<PageParentData>;
export type PageProps = { data: PageData }
export type PageServerData = null;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
export type Snapshot<T = any> = Kit.Snapshot<T>;
type EnsureDefined<T> = T extends null | undefined ? {} : T;
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
// @ts-ignore
type MatcherParam<M> = M extends (param : string) => param is infer U ? U extends string ? U : string : string;
type MaybeWithVoid<T> = {} extends T ? T | void : T;
type OptionalUnion<U extends Record<string, any>, A extends keyof U = U extends U ? keyof U : never> = U extends unknown ? { [P in Exclude<A, keyof U>]?: never } & U : never;
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof App.PageData & keyof T>> & Record<string, any>>

type PageParentData = EnsureDefined<import('../$types.js').LayoutData>;
type RouteId = '/discovery';
type RouteParams = {  };