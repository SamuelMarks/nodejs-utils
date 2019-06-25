/// <reference types="chai" />
import { Response } from 'supertest';
import { IDependencies, ImkdirpCb, ImkdirpOpts, IModelRoute, IncomingMessageError, TCallback } from './interfaces.d';
export declare const trivial_merge: (obj: any, ...objects: {}[]) => any;
export interface config {
    user: string;
    password?: string;
    pass?: string;
    host?: string;
    database?: string;
    identity: string;
}
export declare const isShallowSubset: (o0: {} | any[], o1: {} | any[]) => boolean;
export declare const binarySearch: (a: any[], e: any, c?: (a: number, b: number) => boolean) => number;
export declare const trivialWalk: (dir: string, excludeDirs?: string[] | undefined) => string[];
export declare const populateModelRoutes: (dir: string, allowedFnames?: string[]) => Map<string, any>;
export declare const objListToObj: (objList: {}[]) => {};
export declare const groupBy: (array: any[], f: Function) => any[];
export declare const getUTCDate: (now?: Date) => Date;
export declare const sanitiseSchema: (schema: {}, omit: string[]) => {};
export declare const mkdirP: (dir: string, opts?: ImkdirpOpts | undefined, cb?: ImkdirpCb | undefined, made?: any) => void;
export interface IConnectionConfig {
    host: string;
    user?: string;
    password?: string;
    database: string;
    port: number | string;
}
export declare const uri_to_config: (uri: string) => IConnectionConfig;
export declare const raise: (throwable: any) => never;
export declare const getError: (err: Error | IncomingMessageError) => Error | IncomingMessageError;
export declare const superEndCb: (callback: TCallback<Error | IncomingMessageError, Response>) => (e: Error | IncomingMessageError, r?: Response | undefined) => void | Response;
export declare const debugCb: (name: string, callback: TCallback<any, any>) => (e: any, r: any) => any;
export declare const uniqIgnoreCb: (callback: TCallback<Error | Chai.AssertionError | {
    message: string;
}, any>) => (err: Error | Chai.AssertionError | {
    message: string;
}, res: any) => any;
export declare function permute<T>(permutation: T[] | T | any): IterableIterator<T>;
export declare const build_dep_graph: (dependencies: IDependencies[]) => Map<string, any>;
export declare const groupByMap: <T>(list: Map<T, any>, keyGetter: (key: any) => any) => Map<T, any>;
export declare const get_models_routes: (models_routes: Map<string, any>) => IModelRoute;
export declare const model_route_to_map: (model_route: IModelRoute) => Map<string, any>;
export declare const toSentenceCase: (s: string) => string;
export declare const resolveIntFromObject: (obj: {}) => {};
export declare const format: (s: string, args: any) => string;
