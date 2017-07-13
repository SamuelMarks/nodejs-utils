import * as fs from 'fs';
import { readdirSync, statSync } from 'fs';
import * as URI from 'uri-js';
import { dirname, join, normalize, resolve, sep } from 'path';
import { ImkdirpCb, ImkdirpOpts, IModelRoute } from 'nodejs-utils';

export const trivial_merge = (obj, ...objects: Array<{}>) => {
    for (const key in objects)
        if (objects.hasOwnProperty(key)) {
            if (isNaN(parseInt(key))) obj[key] = objects[key];
            else for (const k in objects[key])
                if (objects[key].hasOwnProperty(k))
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

export const binarySearch = (a: any[], e: any, c = (a, b) => a > b) => {
    let u = a.length, m = 0;
    for (let l = 0; l <= u;)
        c(e, a[m = (l + u) >> 1]) ? l = m + 1 : u = e == a[m] ? -2 : m - 1;
    return u == -2 ? m : -1
};

export const trivialWalk = (dir: string, excludeDirs?: string[]) => {
    return readdirSync(dir).reduce((list, file) => {
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
export const populateModelRoutes = (dir: string,
                                    allowedFnames = ['models.js', 'route.js', 'routes.js', 'admin.js']): IModelRoute =>
    <IModelRoute>objListToObj(trivialWalk(dir).filter(
        p => allowedFnames.indexOf(p.slice(p.lastIndexOf(sep) + 1)) !== -1).map(p => {
            const lst = p.lastIndexOf(sep);
            return {
                [p.slice(p.lastIndexOf(sep, lst - 1) + 1, lst)]: {
                    [(lst !== -1 ? p.slice(lst + 1, p.lastIndexOf('.')) : sep)]: require(
                        p[0] === sep || p[1] === ':' ? p : resolve(`.${sep}${p}`)
                    )
                }
            }
        }
    ));

export const objListToObj = (objList: Array<{}>): {} => {
    /* Takes an objList without null/undefined */
    const obj = {};
    objList.forEach(o => ((key: string) => obj[key] = obj[key] != null ?
        trivial_merge(obj[key], o[key]) : o[key])(Object.keys(o) as string[] | any));
    return obj;
};

export const groupBy = (array: Array<any>, f: Function): typeof array => {
    const groups = {};
    array.forEach(o => {
        const group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(group => groups[group]);
};

export const getUTCDate = (now = new Date()): Date =>
    new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());


export const sanitiseSchema = (schema: {}, omit: Array<string>): {} =>
    objListToObj(Object.keys(schema).map(k => (
        { [k]: k === 'required' ? schema[k].filter(x => omit.indexOf(x) === -1) : schema[k] }
    )));

const _0777 = parseInt('0777', 8);


export const mkdirP = (dir: string, opts: ImkdirpOpts, cb?: ImkdirpCb, made?) => {
    // Refactored from https://github.com/substack/node-mkdirp
    dir = resolve(dir);
    if (typeof opts === 'function') {
        cb = <ImkdirpCb>opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object')
        opts = { mode: <number>opts };

    opts.mode = opts.mode || (_0777 & (~process.umask()));
    opts.fs = opts.fs || fs;

    if (!made) made = null;

    cb = cb || (() => undefined);

    opts.fs.mkdir(dir, opts.mode, (error) => {
        if (error != null) {
            made = made || dir;
            return cb(null, made);
        }
        switch (error.code) {
            case 'ENOENT':
                mkdirP(dirname(dir), opts, (err, made) => {
                    if (err) cb(err, made);
                    else mkdirP(dir, opts, cb, made);
                });
                break;

            default:
                opts.fs.stat(dir, (e, stat) => {
                    if (e || !stat.isDirectory()) cb(error || e, made);
                    else cb(null, made);
                });
        }
    });
};

export interface IConnectionConfig {
    host: string;
    user?: string;
    password?: string;
    database: string;
    port: number | string;
}

export const uri_to_config = (uri: string): IConnectionConfig => {
    const comps: URI.URIComponents = URI.parse(uri);
    const user_pass = comps.userinfo.split(':');
    const user_obj: {user?: string, password?: string} = {};

    if (user_pass.length === 2) {
        user_obj.user = user_pass[0];
        user_obj.password = user_pass[1];
    }
    else if (user_pass.length === 1 && typeof user_pass[0] === 'string' && user_pass[0].length > 0)
        user_obj.user = user_pass[0];

    return Object.assign({
        host: comps.host,
        database: comps.path.length > 2 ? comps.path.slice(1) : undefined,
        port: comps.port || 5432
    }, user_obj);
};

export const raise = (throwable: Error | any) => { throw throwable };


