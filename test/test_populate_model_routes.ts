import { mkdir, mkdtemp, readFile, writeFile } from 'fs';
import { dirname, join as path_join } from 'path';
import { map, series, waterfall } from 'async';
import { expect } from 'chai';
import { default as rimraf } from 'rimraf';

import { populateModelRoutes } from '../index';
import { dependencies_input } from './test_build_dep_graph';


describe('populateModelRoutes', () => {
    let tmp_root: string;

    before(done => {
        series([
            callb => mkdtemp('nodejs-utils-popmodroutes', (err, folder) => {
                if (err != null) return callb(err);
                tmp_root = path_join(folder, 'api');
                return callb();
            }),
            callb => mkdir(tmp_root, callb),
            // @ts-ignore
            callb => map(dependencies_input.map(o => {
                const k: string = Object.keys(o)[0];
                return [path_join(tmp_root, k), o[k]]
            }), (dir_deps: [string, {_dependencies?: string[]}], c_b) => {
                const [dir, deps] = dir_deps;
                mkdir(dir, err => {
                    if (err != null) return c_b(err);
                    waterfall([
                        cb => readFile(path_join(__dirname, 'mock_route.js'), 'utf8', cb),
                        (route_as_s: string, cb) => writeFile(path_join(dir, 'route.js'), route_as_s, 'utf8',
                            e => cb(e != null ? e : void 0)),
                        cb => readFile(path_join(__dirname, 'mock_model.js'), 'utf8', cb),
                        (model_as_s: string, cb) =>
                            cb(void 0, deps == null ? model_as_s :
                                model_as_s.replace('null', JSON.stringify(deps._dependencies)).replace('null', JSON.stringify(deps._dependencies)))
                        ,
                        (model_as_s: string, cb) => writeFile(path_join(dir, 'models.js'), model_as_s,
                            e => cb(e != null ? e : void 0))
                    ], c_b)
                })
            }, callb)
        ], done)
    });

    it('populates correctly', () => {
        const results = populateModelRoutes(tmp_root);
        expect(Array.from(results.keys())).to.be.eql([
            'foo2/models.js', 'foo3/models.js', 'foo4/models.js', 'foo0/models.js', 'foo1/models.js', 'foo5/models.js',
            'foo0/route.js', 'foo1/route.js', 'foo2/route.js', 'foo3/route.js', 'foo4/route.js', 'foo5/route.js'
        ]);
    });

    after(done => {
        // @ts-ignore
        rimraf(dirname(tmp_root), done);
    });
});
