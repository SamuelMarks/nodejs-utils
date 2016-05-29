import * as fs from 'fs';
import {readdirSync, statSync} from 'fs';
import {normalize, sep, join, dirname, resolve} from 'path';
import {IModelRoute, ImkdirpOpts, ImkdirpCb} from 'nodejs-utils';

export function trivial_merge(obj, ...objects: Array<{}>) {
    for (const key in objects)
        if (objects.hasOwnProperty(key)) {
            if (isNaN(parseInt(key))) obj[key] = objects[key];
            else for (const k in objects[key])
                if (objects[key].hasOwnProperty(k))
                    obj[k] = objects[key][k];
        }
    return obj
}

interface config {
    user: string;
    password?: string;
    host?: string;
    database?: string;
    identity: string;
}

export function uri_to_config(uri: string) {
    return (function (arr: string[]): config {
        switch (arr.length) {
            case 3: // User, [passwd@]host, [port@db]
                const user = arr[0]; // arr[0].substr(arr[0].search('//')+2);
                return <config>(trivial_merge(
                    {
                        user: user,
                        identity: user
                    }, function passwd_host(): { host: string, pass?: string } {
                        const at_at: number = arr[1].search('@');
                        if (at_at === -1) return {host: arr[1]};
                        return {
                            pass: arr[1].substr(0, at_at),
                            host: arr[1].substr(at_at + 1)
                        }
                    }(),
                    function port_db(): { database: string, port?: string } {
                        const slash_at: number = arr[2].search('/');
                        if (slash_at === -1) return {database: arr[2]};
                        return {
                            port: arr[2].substr(0, slash_at),
                            database: arr[2].substr(slash_at + 1)
                        }
                    }()
                ));
            case 2: // User, [password@]host[/database]
                const u = arr[0].substr(arr[0].search('//') + 2);
                return trivial_merge(
                    {
                        user: u,
                        identity: u
                    }, function passwd_host_db(): { host: string, password?: string } {
                        function host_db(s: string): { host: string, database?: string } {
                            const slash_at = s.search('/');
                            if (slash_at === -1) return {host: s};
                            return {
                                host: s.substr(0, slash_at),
                                database: s.substr(slash_at + 1)
                            }
                        }

                        const at_at: number = arr[1].search('@');
                        if (at_at === -1) return host_db(arr[1]);
                        return trivial_merge(
                            {password: arr[1].substr(0, at_at)},
                            host_db(arr[1].substr(at_at + 1))
                        );
                    }()
                );
            case 1:
                // host
                return {
                    user: 'postgres',
                    identity: 'postgres',
                    host: arr[0].substr(arr[0].search('//') + 2)
                };
            default:
                throw TypeError('Unable to acquire config from uri');
        }
    })(uri.slice('postgres'.length + 3).split(':'))
}

export function isShallowSubset(o0: {} | Array<any>, o1: {} | Array<any>): boolean {
    const
        l0_keys: Array<string> = (o0 instanceof Array ? o0 : Object.keys(o0)).sort(),
        l1_keys: Array<string> = (o1 instanceof Array ? o1 : Object.keys(o1)).sort();

    if (l0_keys.length > l1_keys.length) return false;
    for (const i in l0_keys)
        if (l0_keys.hasOwnProperty(i) && binarySearch(l1_keys, l0_keys[i]) < 0) return false;
    return true;
}

export function binarySearch(a: any[], e: any, c = (a, b) => a > b) {
    let u = a.length, m = 0;
    for (let l = 0; l <= u;)
        c(e, a[m = (l + u) >> 1]) ? l = m + 1 : u = e == a[m] ? -2 : m - 1;
    return u == -2 ? m : -1
}

export function trivialWalk(dir, excludeDirs?) {
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
}

const excludeDirs = ['node_modules', 'typings', 'bower_components', '.git', '.idea', 'test'];
export function populateModelRoutes(dir: string): IModelRoute {
    const allowedFnames = ['models.js', 'routes.js', 'admin.js'];
    return <IModelRoute>objListToObj(trivialWalk(dir).filter(p => allowedFnames.indexOf(p.slice(p.lastIndexOf(sep) + 1)) !== -1).map(p => {
            const lst = p.lastIndexOf(sep);
            return {[p.slice(p.lastIndexOf(sep, lst - 1) + 1, lst)]: {[(lst !== -1 ? p.slice(lst + 1, p.lastIndexOf('.')) : sep)]: require(p[0] === sep || p[1] === ':' ? p : resolve(`.${sep}${p}`))}}
        }
    ));
}

export function objListToObj(objList: Array<{}>): {} {
    /* Takes an objList without null/undefined */
    let obj = {};
    objList.forEach(o => (key => obj[key] = obj[key] ? trivial_merge(obj[key], o[key]) : o[key])(Object.keys(o)));
    return obj;
}

export function groupBy(array: Array<any>, f: Function) {
    var groups = {};
    array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}

export function getUTCDate(now = new Date()) {
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}

export function sanitiseSchema(schema: {}, omit: Array<string>): {} {
    return objListToObj(Object.keys(schema).map(k => {
        return {[k]: k === 'required' ? schema[k].filter(x => omit.indexOf(x) === -1) : schema[k]}
    }));
}

const _0777 = parseInt('0777', 8);


export function mkdirP(dir: string, opts: ImkdirpOpts, cb?: ImkdirpCb, made?) {
    // Refactored from https://github.com/substack/node-mkdirp
    dir = resolve(dir);
    if (typeof opts === 'function') {
        cb = <ImkdirpCb>opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object')
        opts = {mode: <number>opts};

    opts.mode = opts.mode || (_0777 & (~process.umask()));
    opts.fs = opts.fs || fs;

    if (!made) made = null;

    cb = cb || (() => undefined);

    opts.fs.mkdir(dir, opts.mode, function (error) {
        if (!error) {
            made = made || dir;
            return cb(null, made);
        }
        switch (error.code) {
            case 'ENOENT':
                mkdirP(dirname(dir), opts, function (err, made) {
                    if (err) cb(err, made);
                    else mkdirP(dir, opts, cb, made);
                });
                break;

            default:
                opts.fs.stat(dir, function (e, stat) {
                    if (e || !stat.isDirectory()) cb(error || e, made);
                    else cb(null, made);
                });
        }
    });
}
