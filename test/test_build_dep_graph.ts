import { describe, after, it } from "node:test";
import { unlink, writeFileSync } from 'node:fs';
import assert from "node:assert/strict";

import { build_dep_graph } from '../index';
import { IDependencies } from '../interfaces.d';

const dependencies_input: IDependencies[] = [
    { 'foo0': { _dependencies: ['foo2', 'foo3'] } },
    { 'foo1': { _dependencies: ['foo2', 'foo3'] } },
    { 'foo2': {} },
    { 'foo3': {} },
    { 'foo4': {} },
    { 'foo5': { _dependencies: ['foo2'] } }
];

describe('build dep graph', (_t) => {
    after((__t, done) =>
        unlink('delme.json', done)
    );

    it('builds correctly', () => {
        const correct_outputs = [
            ['foo4', 'foo2', 'foo3', 'foo0', 'foo1', 'foo5'],
            ['foo2', 'foo3', 'foo0', 'foo1', 'foo4', 'foo5']
        ];
        const actual_output = build_dep_graph(dependencies_input);
        // TODO: Finish this test
        writeFileSync('delme.json', JSON.stringify(actual_output, null, 4));
        let errors: Error[] = [];
        correct_outputs.forEach(output => {
            try {
                assert.deepStrictEqual(actual_output, output);
            } catch (e) {
                errors.push(e as Error);
            }
        });
        if (errors.length === correct_outputs.length) throw errors[0];
    });
});

export { dependencies_input };
