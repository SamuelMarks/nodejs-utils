import { readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, normalize, resolve, sep } from 'node:path';

import * as URI from 'uri-js';
import { Response } from 'supertest';

import * as restify from "restify";
import {
    IDependencies,
    IErrorResponse,
    IModelRoute,
    IncomingMessageError,
    TCallback
} from './interfaces.d';

// @ts-ignore
export const trivial_merge = (obj, ...objects: Array<{}>): typeof obj => {
    for (const key in objects)
        if (objects.hasOwnProperty(key)) {
            if (isNaN(parseInt(key))) obj[key] = objects[key];
            else for (const k in objects[key])
                if (objects[key].hasOwnProperty(k))
                    // @ts-ignore
                    obj[k] = objects[key][k];
        }
    return obj;
};

export interface config {
    user: string;
    password?: string;
    pass?: string;
    host?: string;
    database?: string;
    identity: string;
}

export const isShallowSubset = (o0: {} | Array<any>, o1: {} | Array<any>): boolean => {
    const
        l0_keys: Array<string> = (o0 instanceof Array ? o0 : Object.keys(o0)).sort(),
        l1_keys: Array<string> = (o1 instanceof Array ? o1 : Object.keys(o1)).sort();

    if (l0_keys.length > l1_keys.length) return false;
    for (const i in l0_keys)
        if (l0_keys.hasOwnProperty(i) && binarySearch(l1_keys, l0_keys[i]) < 0) return false;
    return true;
};

export const binarySearch = (a: any[], e: any, c = (a: number, b: number) => a > b) => {
    let u = a.length, m = 0;
    for (let l = 0; l <= u;)
        c(e, a[m = (l + u) >> 1]) ? l = m + 1 : u = e == a[m] ? -2 : m - 1;
    return u == -2 ? m : -1
};

export const trivialWalk = (dir: string, excludeDirs?: string[]): string[] => {
    return readdirSync(dir).reduce((list: string[], file: string) => {
        const name = join(dir, file);
        if (statSync(name).isDirectory()) {
            if (excludeDirs && excludeDirs.length) {
                excludeDirs = excludeDirs.map(d => normalize(d));
                const idx = name.indexOf(sep);
                const directory = name.slice(0, idx === -1 ? name.length : idx);
                if (excludeDirs.indexOf(directory) !== -1)
                    return list;
            }
            return list.concat(trivialWalk(name, excludeDirs));
        }
        return list.concat([name]);
    }, []);
};

const excludeDirs = ['node_modules', 'typings', 'bower_components', '.git', '.idea', 'test'];
export const populateModelRoutes =
    (dir: string, allowedFnames = ['models.js', 'route.js', 'routes.js', 'admin.js']): Map<string, any> =>
        build_dep_graph(trivialWalk(dir)
            .map(p => [basename(p), p])
            .filter(([base, p]) => allowedFnames.indexOf(base) > -1)
            .map(([base, p]) => ({ [join(basename(dirname(p)), base)]: require(resolve(p)) })));

export const objListToObj = (objList: Array<{}>): {} => {
    /* Takes an objList without null/undefined */
    const obj: { [key: string]: any } = {};
    objList.forEach(o => ((key: string) => obj[key] = obj[key] != null ?
        // @ts-ignore
        trivial_merge(obj[key], o[key]) : o[key])(Object.keys(o) as string[] | any));
    return obj;
};

export const groupBy = (array: Array<any>, f: Function): typeof array => {
    const groups: { [key: string]: typeof array } = {};
    array.forEach(o => {
        const group = JSON.stringify(f(o));
        // @ts-ignore
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(group => groups[group]);
};

export const getUTCDate = (now = new Date()): Date =>
    new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());


export const sanitiseSchema = (schema: { [key: string]: Array<any> }, omit: Array<string>): {} =>
    objListToObj(Object.keys(schema).map(k => (
        { [k]: k === 'required' ? schema[k].filter(x => omit.indexOf(x) === -1) : schema[k] }
    )));

export interface IConnectionConfig {
    host: string;
    user?: string;
    password?: string;
    database: string;
    port: number | string;
}

export const uri_to_config = (uri: string): IConnectionConfig => {
    const comps: URI.URIComponents = URI.parse(uri);
    if (comps == null) throw TypeError('Unable to parse URI');
    const user_pass = comps.userinfo && comps.userinfo.split(':') || [];
    const user_obj: { user?: string, password?: string } = {};

    if (user_pass.length === 2) {
        user_obj.user = user_pass[0];
        user_obj.password = user_pass[1];
    } else if (user_pass.length === 1 && typeof user_pass[0] === 'string' && user_pass[0].length > 0)
        user_obj.user = user_pass[0];

    return Object.assign({
        host: comps.host as string,
        database: comps.path && comps.path.length > 2 ? comps.path.slice(1) : '',
        port: comps.port || 5432
    }, user_obj);
};

export const raise = (throwable: Error | any) => {
    throw throwable
};

export const getError = (err: null | IncomingMessageError | Error | {
    jse_shortmsg: string,
    text: string,
    message: string
}): IncomingMessageError | Error => {
    if (err as any === false || err == null) {
        // @ts-ignore
        return null;
    }
    if (err!.hasOwnProperty("jse_shortmsg")) {
        const e: IncomingMessageError = err as IncomingMessageError;
        return e != null && e.body && e.body.error_message ? JSON.parse(e.body.error_message) : e;
    }
    if (err!.hasOwnProperty("text"))
        err.message += ' | ' + (err as { text: string }).text;

    return err as IncomingMessageError | Error;
};

export const superEndCb = (callback: TCallback<Error | IncomingMessageError, Response>) =>
    (e: IncomingMessageError | Error, r?: Response) => callback(supertestGetError(e, r), r);

export const supertestGetError = (e: IncomingMessageError | Error, r?: Response): IncomingMessageError | Error =>
    getError(r != null && r.hasOwnProperty('error') && r.error != null ? (r as { error: typeof e }).error : e);

export const debugCb = (name: string, callback: TCallback<any, any>) => /* tslint:disable:no-console */
    (e: any, r: any) => console.warn(`${name}::e =`, e, `;\n${name}::r =`, r, ';') as any || callback(e, r);

export const uniqIgnoreCb = (callback: TCallback<Error | { message: string }, any>) =>
    (err: Error | { message: string }, res: Response | any) =>
        callback(err != null && err.message != null && err.message.indexOf('E_UNIQUE') === -1 ? err : void 0, res);

export function* permute<T>(permutation: T[] | T | any): IterableIterator<T> {
    // Thanks: https://stackoverflow.com/a/37580979
    const length = permutation.length;
    const c = Array(length).fill(0);
    let i = 1;
    let k;
    let p;

    yield permutation.slice();
    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            yield permutation.slice();
        } else {
            c[i] = 0;
            ++i;
        }
    }
}

export const build_dep_graph = (dependencies: IDependencies[]): Map<string, any> => {
    // NP complete problem. Permute through all options then return first correct permutation.
    // No guarantee you'll get same permutation between runs, just that it'll be valid.
    const is_valid = (dep_free: string[],
                      models2deps: Map<string, [string, string[]]>,
                      folder_names: string[]): boolean => {
        const deps_existent = new Set<string>(dep_free);
        for (const folder_name of folder_names)
            if (models2deps.get(folder_name)![1].some(dep => !deps_existent.has(dep)))
                return false;
            else deps_existent.add(folder_name);
        deps_existent.clear();
        return true;
    };

    const models2deps: Map<string, [string, string[]]> = new Map<string, [string, string[]]>();
    const models_no_deps: Map<string, string> = new Map<string, string>();
    const routes: Set<string> = new Set<string>();
    const all_deps: Map<string, any> = new Map<string, any>();
    dependencies.forEach((dep: IDependencies) => {
        const k: string = Object.keys(dep)[0];
        all_deps.set(k, dep[k]);
        const d: string = dirname(k);
        const b: string = basename(k, '.js');
        if (['model', 'models'].indexOf(b) > -1) {
            const deps = dep[k]._dependencies || (dep[k] as { dependencies?: string[] })['dependencies'];
            if (deps == null) models_no_deps.set(d, k);
            else models2deps.set(d, [k, deps]);
        } else if (['admin', 'route', 'routes'].indexOf(b) > -1)
            routes.add(k);
    });

    for (const models2deps_perm of permute<string[]>(Array.from(models2deps).map(l => l[0])))
        if (is_valid(Array.from(models_no_deps.keys()), models2deps, models2deps_perm as any))
            return new Map<string, any>(
                Array
                    .from(models_no_deps.values())
                    .concat(models2deps_perm.map(folder_name => models2deps.get(folder_name)![0]))
                    .concat(Array.from(routes.values()))
                    .map(fname => [fname, all_deps.get(fname)]) as any);
    throw Error('Logic error: no permutation of your models is valid. Check your dependency lists.')
};

export const groupByMap = <T>(list: Map<T, any>, keyGetter: ((key: any) => any)): Map<T, any> => {
    const map = new Map();
    const l = Array.from(list);
    l.forEach(value => {
        const key: string = keyGetter(value);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [value]);
        } else {
            collection.push(value);
        }
    });
    return map;
};

export const get_models_routes = (models_routes: Map<string, any>): IModelRoute =>
    Array.from(groupByMap<string>(models_routes, k => k[0].slice(0, k[0].indexOf('/')))).reduce(
        (a: {}, b) => Object.assign(a, {
            [b[0]]: b[1].map(
                (fname_prog: string[]) => ({ [basename(fname_prog[0], '.js')]: fname_prog[1] })
            ).reduce((prev: {}, curr: {}) => Object.assign(prev, curr), {})
        }), {}
    );

export const model_route_to_map = (model_route: IModelRoute): Map<string, any> => new Map(
    Object.entries(Object.keys(model_route).map((entity: string) => Object.keys(model_route[entity]).map(
        (m_or_r: string) => ({ [join(entity, `${m_or_r}.js`)]: (model_route[entity] as {[key: string]: restify.RequestHandler})[m_or_r] }))
    ).reduce((a, b) => a.concat(b), []).reduce((a, b) => Object.assign(a, b), {})));

export const toSentenceCase = (s: string): string => `${s[0].toLocaleUpperCase()}${s.slice(1)}`;

export const resolveIntFromObject = (obj: { [key: string]: any }): typeof obj =>
    Object.keys(obj)
        .map(k => ({ [k]: isNaN(obj[k]) ? obj[k] : parseInt(obj[k]) }))
        .reduce((a, b) => Object.assign(a, b), {});

export const format = (s: string, args: { mises: string; was: string, [key: string]: string }): string => {
    for (let attr in args) if (args.hasOwnProperty(attr)) s = s.split('${' + attr + '}').join(args[attr]);
    return s || '';
};

export const removeNulls = (a: any[]): typeof a => a.filter(e => e != null);

export const unwrapIfOneElement = (a: any[]): typeof a | typeof a[0] => a.length === 1 ? a[0] : a;

export const exceptionToErrorResponse = (error: any): IErrorResponse => {
    const hasJseInfo = (e: { jse_info: IErrorResponse }) => ({
        code: e.jse_info.code,
        error: e.jse_info.error,
        error_message: e.jse_info.error_message
    });

    if (error.jse_info) return hasJseInfo(error);
    else if (error.text)
        try {
            return hasJseInfo({ jse_info: JSON.parse(error.text) });
        } catch (e) {
            return {
                code: 'UnknownError',
                error: 'UnknownError',
                error_message: error.text
            };
        }
    else throw TypeError(`Unable to parse out IError object from input: ${error}`);
};

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /(?:^|,)\s*([^\s,=]+)/g;

// Adapted from https://stackoverflow.com/a/29123804
export const getFunctionParameters = (func?: Function): string[] => {
    if (func == null) return [];
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    const argsList = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'));
    const result = argsList.match(ARGUMENT_NAMES);

    if (result === null)
        return [];

    const stripped: string[] = [];
    for (let i = 0; i < result.length; i++)
        stripped.push(result[i].replace(/[\s,]/g, ''));
    return stripped;
};
