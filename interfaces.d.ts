import { Stats } from 'node:fs';

import { Response } from 'supertest';
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

export interface IErrorResponse {
    code: string;
    error: string;
    error_message: string;
}

export type TCallback<E, R> = (err?: E, res?: R) => R | void;
export type TCallbackR<A, B, R> = (a?: A, b?: B) => R | void;
export type strCb = TCallback<Error, string>;
export type strCbV = TCallbackR<Error, string, void>;
export type numCb = TCallback<Error, number>;
export type HttpStrResp = (error: Error | IncomingMessageError, response?: Response) => string;
export type AccessTokenType = string;
export type SuperTestResp = TCallback<Error | IncomingMessageError, Response>;
