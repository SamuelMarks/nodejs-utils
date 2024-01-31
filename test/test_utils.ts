import { describe, after, before, it } from "node:test";
import { mkdir, mkdtemp, open as fs_open, rm, writeFile } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join as path_join } from 'node:path';
import assert from "node:assert/strict";

import * as async from 'async';

import { binarySearch, format, isShallowSubset, populateModelRoutes, trivialWalk } from '../index';


describe('utils::helpers', () => {
    describe('binarySearch', () => {
        const array: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const comparator = (a: number, b: typeof a): boolean => a > b;

        it('should find each element', {}, () =>
            array.forEach(elem =>
                assert.deepStrictEqual(binarySearch(array, elem, comparator) > -1, true)
            )
        );

        it('should not find an element', {}, () =>
            [50, -1, 0, null, 'hello', undefined, '', NaN, {}, []].forEach(
                elem =>
                    assert.deepStrictEqual(binarySearch(array, elem, comparator) <= -1, true)
            )
        );

        it('should handle empty list', () =>
            assert.deepStrictEqual(binarySearch([], 5, comparator) <= -1, true)
        );
    });

    describe('isShallowSubset', () => {
        describe('success', () => {
            describe('[number] [number]', () => {
                it('can be found with two empty lists', () =>
                    assert.deepStrictEqual(isShallowSubset([], []), true)
                );

                it('can be found with two identical lists', () =>
                    assert.deepStrictEqual(isShallowSubset([1, 2, 3], [1, 2, 3]), true)
                );

                it('can be found with two identical, differently ordered lists', () =>
                    assert.deepStrictEqual(isShallowSubset([1, 2, 3], [3, 2, 1]), true)
                );

                it('can be found with array_0.length < array_1.length', () =>
                    assert.deepStrictEqual(isShallowSubset([1, 2, 5], [1, 2, 5, 6]), true)
                );
            });
            describe('Object Object', () => {
                it('can be found with two empty objects', () =>
                    assert.deepStrictEqual(isShallowSubset({}, {}), true)
                );

                it('can be found with two identical objects', () =>
                    assert.deepStrictEqual(isShallowSubset({ a: 1 }, { a: 1 }), true)
                );

                it('can be found with two object_0.length < object_1.length', () =>
                    assert.deepStrictEqual(isShallowSubset({ a: 1 }, { a: 1, b: 6 }), true)
                );
            });
        });

        describe('failure', () => {
            describe('[number] [number]', () => {
                it('experienced with array_1 empty', () =>
                    assert.deepStrictEqual(isShallowSubset([5], []), false)
                );

                it('experienced with two different, same sized lists', () =>
                    assert.deepStrictEqual(isShallowSubset([1, 2, 7], [2, 2, 5]), false)
                );

                it('experienced with two different, different sized lists', () => {
                    it('list 0', () => assert.deepStrictEqual(isShallowSubset([7, 1, 2, 5], [10, 35, 2, 2, 5]), false));
                    it('list 1', () => assert.deepStrictEqual(isShallowSubset([1, 2, 5, 6], [2, 2, 5]), false));
                });

                it('experienced with array_0.length > array_1.length', () =>
                    assert.deepStrictEqual(isShallowSubset([1, 2, 5, 6], [1, 2, 5]), false)
                );
            });

            describe('Object Object', () => {
                it('experienced with object_1 empty', () =>
                    assert.deepStrictEqual(isShallowSubset({ a: 5 }, {}), false)
                );

                it('experienced with with two same length, different objects', () =>
                    assert.deepStrictEqual(isShallowSubset({ a: 1 }, { b: 1 }), false)
                );

                it('experienced with with two different length, different objects', () =>
                    assert.deepStrictEqual(isShallowSubset({ a: 1, c: 7 }, { b: 1, j: 10, l: null }), false)
                );

                it('experienced with two object_0.length > object_1.length', () =>
                    assert.deepStrictEqual(isShallowSubset({ a: 1, b: 6 }, { a: 1 }), false)
                );
            });
        });

        describe('irl', () => {
            const schema = {
                email: { type: 'string' },
                password: { type: 'string' },
                title: { type: 'string' },
                first_name: { type: 'string' },
                last_names: { type: 'string' }
            };

            it('should validate with good request-body', () => [
                { email: 'fff' },
                { title: 'sfsdf' },
                { title: 'sfsdf', email: 'sdf' }
            ].forEach(request => assert.deepStrictEqual(isShallowSubset(request, schema), true)));

            it('should fail with bad request-body', () => [
                { foo: 'dsf' },
                { bar: 'can', haz: 'baz' },
                { title: 'foo', haz: 'baz' }
            ].forEach(request => assert.deepStrictEqual(isShallowSubset(request, schema), false)));
        })
    });

    describe('trivialWalk and populateModelRoutes', () => {
        let directory: string;
        let tree: string[][];
        // create full tree
        before((t, callback) =>
            mkdtemp(path_join(tmpdir(), 'nodejs-utils-test_'), (err, dir) => {
                    if (err) return callback(err);
                    directory = dir;
                    tree = [
                        [directory, 'routes.js'],
                        [path_join(directory, 'api', 'jarring'), 'routes.js'],
                        [path_join(directory, 'api3', 'car'), 'models.js'],
                        [path_join(directory, 'can'), 'routes.js'],
                        [path_join(directory, 'jar', 'far', 'raw'), 'models.js'],
                        [path_join(directory, 'node_modules', 'far', 'raw'), 'admin.js'],
                    ];

                    async.map(tree, (dir_file: string[], cb) =>
                        async.series([
                                call_back => mkdir(dir_file[0], { recursive: true }, call_back),
                                call_back =>
                                    fs_open(path_join(...dir_file), 'w', call_back),
                                call_back =>
                                    writeFile(path_join(...dir_file), 'exports.bar = function(){}', 'utf8', call_back)
                            ], cb
                        ), callback);
                }
            )
        );

        // delete full tree
        after((__t, done) =>
            rm(directory, { recursive: true, force: true }, done)
        );

        let empty_dir: string;

        // create empty tree
        before((t, callback) =>
            mkdtemp(path_join(tmpdir(), 'nodejs-utils-test_'), (err, dir) => {
                    if (err) return callback(err);
                    empty_dir = dir;
                    return callback();
                }
            )
        );

        // delete empty tree
        after((__t, done) =>
            rm(empty_dir, { recursive: true, force: true }, done)
        );

        describe('trivialWalk', () => {
            it('should work on empty tree', () => {
                const res = trivialWalk(empty_dir);
                assert.deepStrictEqual(res instanceof Array, true);
                assert.deepStrictEqual(res.length, 0);
            });

            it('should work 3 levels deep', () =>
                assert.deepStrictEqual(trivialWalk(directory),
                    tree.map((dir_file: string[]) => path_join(...dir_file))
                )
            );

            it('should filter 3 levels deep', () =>
                assert.deepStrictEqual(trivialWalk(directory, ['node_modules']),
                    tree.map((dir_file: string[]) => path_join(...dir_file))
                )
            )
        });

        describe('populateModelRoutes', () => {
            it('should work on empty tree', () => {
                const res = populateModelRoutes(empty_dir);
                assert.deepStrictEqual(res instanceof Object, true);
                assert.deepStrictEqual(res.size, 0);
            });

            it('should work 3 levels deep', () => {
                const res: Map<string, any> = populateModelRoutes(directory);
                assert.deepStrictEqual(res instanceof Object, true);
                const keys = [
                    'jarring', 'car', 'can', 'raw', basename(directory)
                ];
                assert.deepStrictEqual(res.keys(), keys);
                ['models', 'admin', 'routes'].forEach(key => {
                    assert.deepStrictEqual(res.has(key), true, `${key} not found in ${res}`);
                });
            })
        });
    });

    describe('format', () => {
        it('works with basic object', () => {
            const json = { 'mises': 'was', 'was': 'right' };
            const text = 'Mises ${mises} ${was}';
            assert.deepStrictEqual(format(text, json), 'Mises was right');
        });
    });
});
