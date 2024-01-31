import { Response } from 'supertest';
import { IDependencies, IErrorResponse, IModelRoute, IncomingMessageError, TCallback } from './interfaces.d';
export declare const trivial_merge: (obj: any, ...objects: Array<{}>) => any;
export interface config {
    user: string;
    password?: string;
    pass?: string;
    host?: string;
    database?: string;
    identity: string;
}
export declare const isShallowSubset: (o0: {} | Array<any>, o1: {} | Array<any>) => boolean;
export declare const binarySearch: (a: any[], e: any, c?: (a: number, b: number) => boolean) => number;
export declare const trivialWalk: (dir: string, excludeDirs?: string[]) => string[];
export declare const populateModelRoutes: (dir: string, allowedFnames?: string[]) => Map<string, any>;
export declare const objListToObj: (objList: Array<{}>) => {};
export declare const groupBy: (array: Array<any>, f: Function) => any[];
export declare const getUTCDate: (now?: Date) => Date;
export declare const sanitiseSchema: (schema: {
    [key: string]: any[];
}, omit: Array<string>) => {};
export interface IConnectionConfig {
    host: string;
    user?: string;
    password?: string;
    database: string;
    port: number | string;
}
export declare const uri_to_config: (uri: string) => IConnectionConfig;
export declare const raise: (throwable: Error | any) => never;
export declare const getError: (err: null | IncomingMessageError | Error | {
    jse_shortmsg: string;
    text: string;
    message: string;
}) => IncomingMessageError | Error;
export declare const superEndCb: (callback: TCallback<Error | IncomingMessageError, Response>) => (e: IncomingMessageError | Error, r?: Response) => void | import("superagent/lib/node").Response;
export declare const supertestGetError: (e: IncomingMessageError | Error, r?: Response) => IncomingMessageError | Error;
export declare const debugCb: (name: string, callback: TCallback<any, any>) => (e: any, r: any) => any;
export declare const uniqIgnoreCb: (callback: TCallback<Error | {
    message: string;
}, any>) => (err: Error | {
    message: string;
}, res: Response | any) => any;
export declare function permute<T>(permutation: T[] | T | any): IterableIterator<T>;
export declare const build_dep_graph: (dependencies: IDependencies[]) => Map<string, any>;
export declare const groupByMap: <T>(list: Map<T, any>, keyGetter: (key: any) => any) => Map<T, any>;
export declare const get_models_routes: (models_routes: Map<string, any>) => IModelRoute;
export declare const model_route_to_map: (model_route: IModelRoute) => Map<string, any>;
export declare const toSentenceCase: (s: string) => string;
export declare const resolveIntFromObject: (obj: {
    [key: string]: any;
}) => {
    [key: string]: any;
};
export declare const format: (s: string, args: {
    [key: string]: string;
    mises: string;
    was: string;
}) => string;
export declare const removeNulls: (a: any[]) => any[];
export declare const unwrapIfOneElement: (a: any[]) => any;
export declare const exceptionToErrorResponse: (error: any) => IErrorResponse;
export declare const getFunctionParameters: (func?: Function) => string[];
