import {Stats} from 'fs';

declare var nodejs_utils: nodejs_utils.nodejs_utils;

declare module nodejs_utils {
    export interface nodejs_utils {
        trivial_merge(obj, ...objects: Array<{}>);
        uri_to_config(uri: string);
        isShallowSubset(o0: {} | Array<any>, o1: {} | Array<any>);
        binarySearch(a: any[], e: any, c: (a, b) => boolean);
        groupBy(a: any[], f: Function): typeof a;
        objListToObj(objList: Array<{}>): {};
        populateModelRoutes(dir: string): IModelRoute;
        getUTCDate(now: Date): Date;
        sanitiseSchema(schema: {}, omit: Array<string>): {};
        mkdirP(dir: string, opts: ImkdirpOpts, f: Function, made?)
    }

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
            routes?: {create?: Function, read?: Function, update?: Function, del?: Function};
            models?: any; // ^ Could have more than CRUD, but this is better than `any` or `{}`
        }
    }
}

export = nodejs_utils;