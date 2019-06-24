/// <reference types="chai" />
/// <reference types="supertest" />
/// <reference types="restify" />
import { Response } from 'supertest';
import { Stats } from 'fs';
import * as restify from 'restify';

export interface ImkdirpOpts {
    fs?: {
        mkdir: (path: string | Buffer, mode: number,
                callback?: (err?: NodeJS.ErrnoException) => void) => void;
        stat: (path: string | Buffer,
               callback?: (err: NodeJS.ErrnoException, stats: Stats) => any) => void;
    }
    mode?: number;
}

export interface ImkdirpCb {
    (err: NodeJS.ErrnoException|null, made: string): void;
}

export interface IModelRoute {
    [key: string]: {
        route?: {
            create?: restify.RequestHandler, read?: restify.RequestHandler,
            update?: restify.RequestHandler, del?: restify.RequestHandler
        };
        routes?: {
            create?: restify.RequestHandler, read?: restify.RequestHandler,
            update?: restify.RequestHandler, del?: restify.RequestHandler
        };
        models?: any; // ^ Could have more than CRUD, but this is better than `any` or `{}`
    }
}

export interface IConfig {
    user: string;
    password?: string;
    pass?: string;
    host?: string;
    database?: string;
    identity: string;
}

export interface IncomingMessageError {
    name: string;
    jse_shortmsg: string;
    jse_info: {};
    message: string;
    statusCode: number;
    body: any | {} | {error: string, error_message: string};
    restCode: 'IncomingMessageError';
}

export interface IDependencies {
    [key: string]: {
        _dependencies?: string[]
    }
}

export type TCallback<E, R> = (err?: E, res?: R) => R | void;
export type TCallbackR<A, B, R> = (a?: A, b?: B) => R | void;
export type strCb = TCallback<Error, string>;
export type strCbV = TCallbackR<Error, string, void>;
export type numCb = TCallback<Error, number>;
export type HttpStrResp = (error: Error | IncomingMessageError, response?: Response) => string;
export type AccessTokenType = string;
export type SuperTestResp = TCallback<Error | IncomingMessageError, Response>;


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
export declare const mkdirP: (dir: string, opts?: any, cb?: any, made?: any) => void;
export interface IConnectionConfig {
    host: string;
    user?: string;
    password?: string;
    database: string;
    port: number | string;
}
export declare const uri_to_config: (uri: string) => IConnectionConfig;
export declare const raise: (throwable: any) => never;
export declare const getError: (err: any) => any;
export declare const superEndCb: (callback: any) => (e: any, r?: Response | undefined) => any;
export declare const debugCb: (name: string, callback: any) => (e: any, r: any) => any;
export declare const uniqIgnoreCb: (callback: any) => (err: Error | Chai.AssertionError | {
    message: string;
}, res: any) => any;
export declare function permute<T>(permutation: T[] | T | any): IterableIterator<T>;
export declare const build_dep_graph: (dependencies: any[]) => Map<string, any>;
export declare const groupByMap: <T>(list: Map<T, any>, keyGetter: (key: any) => any) => Map<T, any>;
export declare const get_models_routes: (models_routes: Map<string, any>) => any;
export declare const model_route_to_map: (model_route: any) => Map<string, any>;
export declare const toSentenceCase: (s: string) => string;
export declare const resolveIntFromObject: (obj: {}) => {};
export declare const format: (s: string, args: any) => string;
