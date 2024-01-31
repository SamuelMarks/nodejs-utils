import { mkdir, mkdtemp, PathLike, readFile, writeFile, rm } from 'node:fs';
import { dirname, join as path_join } from 'node:path';
import { describe, after, before, it } from "node:test";
import assert from "node:assert/strict";

import { map, series, waterfall } from 'async';

import { populateModelRoutes } from '../index';
import { dependencies_input } from "./test_build_dep_graph";


describe('populateModelRoutes', (_t) => {
    let tmp_root: string;

    before((t, done) => {
        series([
            callb => mkdtemp('nodejs-utils-popmodroutes', (err, folder) => {
                if (err != null) return callb(err);
                tmp_root = path_join(folder, 'api');
                return callb();
            }),
            callb => mkdir(tmp_root, callb),
            // @ts-ignore
            callb => map(dependencies_input.map((o: IDependencies) => {
                const k: string = Object.keys(o)[0];
                return [path_join(tmp_root, k), o[k]]
            }), (dir_deps: [string, { _dependencies?: string[] }], c_b) => {
                const [dir, deps] = dir_deps;
                mkdir(dir, err => {
                    if (err != null) return c_b(err);
                    waterfall([
                        (cb: (err: NodeJS.ErrnoException | null, data: string | Buffer) => void) => readFile(path_join(__dirname, 'mock_route.js') as PathLike, 'utf8' as BufferEncoding, cb),
                        (route_as_s: string, cb: (err: NodeJS.ErrnoException | undefined) => void) => writeFile(path_join(dir, 'route.js'), route_as_s, 'utf8',
                            e => cb(e != null ? e : void 0)),
                        (cb: (err: NodeJS.ErrnoException | null, data: string | Buffer) => void) => readFile(path_join(__dirname, 'mock_model.js') as PathLike, 'utf8' as BufferEncoding, cb),
                        (model_as_s: string, cb: (err: Error | undefined, res: string) => void) =>
                            cb(void 0, deps == null ? model_as_s :
                                model_as_s.replace('null', JSON.stringify(deps._dependencies)).replace('null', JSON.stringify(deps._dependencies)))
                        ,
                        (model_as_s: string, cb: (err: Error | undefined) => void) => writeFile(path_join(dir, 'models.js'), model_as_s,
                            e => cb(e != null ? e : void 0))
                    ], c_b)
                })
            }, callb)
        ], done)
    });

    it('populates correctly', () => {
        const results = populateModelRoutes(tmp_root);
        assert.deepStrictEqual(Array.from(results.keys()), [
            'foo2/models.js', 'foo3/models.js', 'foo4/models.js', 'foo0/models.js', 'foo1/models.js', 'foo5/models.js',
            'foo0/route.js', 'foo1/route.js', 'foo2/route.js', 'foo3/route.js', 'foo4/route.js', 'foo5/route.js'
        ]);
    });

    after((__t, done) =>
        rm(dirname(tmp_root), { recursive: true, force: true }, done)
    );
});
