import * as async from 'async';
import {mkdtemp, writeFile} from 'fs';
import {expect} from 'chai';
import {binarySearch, isShallowSubset, uri_to_config, trivialWalk, mkdirP} from '../index';
import {tmpdir} from 'os';
import {join as path_join} from 'path';
import * as rimraf from 'rimraf';


describe('utils::helpers', () => {
    describe('binarySearch', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const comparator = (a, b) => a > b;

        it('should find each element', () =>
            array.map(elem => expect(binarySearch(array, elem, comparator)).to.be.gt(-1))
        );

        it('should not find an element', () =>
            [50, -1, 0, null, 'hello', undefined, '', NaN, {}, []].map(
                elem => expect(binarySearch(array, elem, comparator)).to.be.lte(-1)
            )
        );

        it('should handle empty list', () =>
            expect(binarySearch([], 5, comparator)).to.be.lte(-1)
        );
    });

    describe('isShallowSubset', () => {
        describe('success', () => {
            describe('[number] [number]', () => {
                it('can be found with two empty lists', () =>
                    expect(isShallowSubset([], [])).to.be.true
                );

                it('can be found with two identical lists', () =>
                    expect(isShallowSubset([1, 2, 3], [1, 2, 3])).to.be.true
                );

                it('can be found with two identical, differently ordered lists', () =>
                    expect(isShallowSubset([1, 2, 3], [3, 2, 1])).to.be.true
                );

                it('can be found with array_0.length < array_1.length', () =>
                    expect(isShallowSubset([1, 2, 5], [1, 2, 5, 6])).to.be.true
                );
            });
            describe('Object Object', () => {
                it('can be found with two empty objects', () =>
                    expect(isShallowSubset({}, {})).to.be.true
                );

                it('can be found with two identical objects', () =>
                    expect(isShallowSubset({a: 1}, {a: 1})).to.be.true
                );

                it('can be found with two object_0.length < object_1.length', () =>
                    expect(isShallowSubset({a: 1}, {a: 1, b: 6})).to.be.true
                );
            });
        });

        describe('failure', () => {
            describe('[number] [number]', () => {
                it('experienced with array_1 empty', () =>
                    expect(isShallowSubset([5], [])).to.be.false
                );

                it('experienced with two different, same sized lists', () =>
                    expect(isShallowSubset([1, 2, 7], [2, 2, 5])).to.be.false
                );

                it('experienced with two different, different sized lists', () => {
                    it('list 0', () => expect(isShallowSubset([7, 1, 2, 5], [10, 35, 2, 2, 5])).to.be.false);
                    it('list 1', () => expect(isShallowSubset([1, 2, 5, 6], [2, 2, 5])).to.be.false);
                });

                it('experienced with array_0.length > array_1.length', () =>
                    expect(isShallowSubset([1, 2, 5, 6], [1, 2, 5])).to.be.false
                );
            });

            describe('Object Object', () => {
                it('experienced with object_1 empty', () =>
                    expect(isShallowSubset({a: 5}, {})).to.be.false
                );

                it('experienced with with two same length, different objects', () =>
                    expect(isShallowSubset({a: 1}, {b: 1})).to.be.false
                );

                it('experienced with with two different length, different objects', () =>
                    expect(isShallowSubset({a: 1, c: 7}, {b: 1, j: 10, l: null})).to.be.false
                );

                it('experienced with two object_0.length > object_1.length', () =>
                    expect(isShallowSubset({a: 1, b: 6}, {a: 1})).to.be.false
                );
            });
        });

        describe('irl', () => {
            const schema = {
                email: {type: 'string'},
                password: {type: 'string'},
                title: {type: 'string'},
                first_name: {type: 'string'},
                last_names: {type: 'string'}
            };

            it('should validate with good request-body', () => [
                {email: 'fff'},
                {title: 'sfsdf'},
                {title: 'sfsdf', email: 'sdf'}
            ].map(request => expect(isShallowSubset(request, schema)).to.be.true));

            it('should fail with bad request-body', () => [
                {foo: 'dsf'},
                {bar: 'can', haz: 'baz'},
                {title: 'foo', haz: 'baz'}
            ].map(request => expect(isShallowSubset(request, schema)).to.be.false));
        })
    });

    describe('uri_to_config', () => {
        it('should work with full', () =>
            expect(uri_to_config('postgresql://postgres:postgres@localhost/postgres')).to.deep.equal({
                "database": "postgres",
                "host": "localhost",
                "identity": "postgres",
                "password": "postgres",
                "user": "postgres",
            })
        );

        it('should work with minimal', () =>
            expect(uri_to_config('postgresql://localhost')).to.deep.equal({
                "host": "localhost",
                "identity": "postgres",
                "user": "postgres"
            })
        );

        /*
         it('should work with proto+host+user', () => {
         expect(uri_to_config('postgresql://postgres:localhost')).to.deep.equal({
         "database": "postgres",
         "host": "localhost",
         "user": "postgres"
         });
         });
         */
    });

    describe('trivialWalk', () => {
            before('set dir structure', callback =>
                mkdtemp(path_join(tmpdir(), 'nodejs-utils-test_'), (err, dir) => {
                        if (err) return callback(err);
                        this.dir = dir;
                        this.tree = [
                            [this.dir, 'foo.txt'],
                            [path_join(this.dir, 'bar'), 'haz.txt'],
                            [path_join(this.dir, 'can'), 'baz.ts'],
                            [path_join(this.dir, 'can'), 'baz.js']
                        ];

                        async.map(this.tree, (dir_file: string[], cb) =>
                            async.series([
                                    call_back => mkdirP(dir_file[0], call_back),
                                    call_back =>
                                        writeFile(path_join(...dir_file), '', 'utf8', call_back)
                                ], cb
                            ), callback);
                    }
                )
            );

            after('cleanup created tree', callback =>
                rimraf(this.dir, callback)
            );

            it('Returns simple list', () => {
                    expect(trivialWalk(this.dir)).to.have.members(
                        this.tree.map((dir_file: string[]) => path_join(...dir_file))
                    );
                }
            )
        }
    );
});
