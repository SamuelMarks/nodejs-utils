import { Stats } from 'fs';
import * as restify from 'restify';
import { Response } from 'supertest';

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
    (err: NodeJS.ErrnoException, made: string): void;
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

export declare const trivial_merge: (obj: any, ...objects: {}[]) => any;
export declare const isShallowSubset: (o0: {} | any[], o1: {} | any[]) => boolean;
export declare const binarySearch: (a: any[], e: any, c?: (a: any, b: any) => boolean) => number;
export declare const trivialWalk: (dir: string, excludeDirs?: string[]) => any;
export declare const populateModelRoutes: (dir: string, allowedFnames?: string[]) => Map<string, any>;
export declare const objListToObj: (objList: {}[]) => {};
export declare const groupBy: (array: any[], f: Function) => any[];
export declare const getUTCDate: (now?: Date) => Date;
export declare const sanitiseSchema: (schema: {}, omit: string[]) => {};
export declare const mkdirP: (dir: string, opts: ImkdirpOpts, cb?: ImkdirpCb, made?: any) => void;

export interface IConnectionConfig {
    host: string;
    user?: string;
    password?: string;
    database: string;
    port: number | string;
}

export declare const uri_to_config: (uri: string) => IConnectionConfig;
export declare const raise: (throwable: Error | any) => void;
export declare const getError: (err: Error | IncomingMessageError) => Error | IncomingMessageError;
export declare const superEndCb: (callback: TCallback<Error | IncomingMessageError, Response>) =>
    (e: Error | IncomingMessageError, r?: Response) => void | Response;
export declare const debugCb: (name: string, callback: TCallback<any, any>) => (e: any, r: any) => any;
export declare const uniqIgnoreCb: (callback: TCallback<Error | Chai.AssertionError | {message: string;}, any>) =>
    (err: Error | Chai.AssertionError | {message: string;}, res: any) => any;

export declare function permute<T>(permutation: T[] | T | any): IterableIterator<T>;
export declare const build_dep_graph: (dependencies: IDependencies[]) => Map<string, any>;
