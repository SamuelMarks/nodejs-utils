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
export declare const binarySearch: (a: any[], e: any, c?: (a: any, b: any) => boolean) => number;
export declare const trivialWalk: (dir: string, excludeDirs?: string[]) => any;
export declare const populateModelRoutes: (dir: string, allowedFnames?: string[]) => IModelRoute;
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
