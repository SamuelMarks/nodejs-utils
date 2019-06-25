import { expect } from 'chai';
import { unlink, writeFileSync } from 'fs';

import { build_dep_graph } from '../index';
import { IDependencies } from '../interfaces.d';


export const dependencies_input: IDependencies[] = [
    { 'foo0': { _dependencies: ['foo2', 'foo3'] } },
    { 'foo1': { _dependencies: ['foo2', 'foo3'] } },
    { 'foo2': {} },
    { 'foo3': {} },
    { 'foo4': {} },
    { 'foo5': { _dependencies: ['foo2'] } }
];

describe('build dep graph', () => {
    after(done => {
        unlink('delme.json', done);
    });

    it('builds correctly', () => {
        const correct_outputs = [
            ['foo4', 'foo2', 'foo3', 'foo0', 'foo1', 'foo5'],
            ['foo2', 'foo3', 'foo0', 'foo1', 'foo4', 'foo5']
        ];
        const actual_output = build_dep_graph(dependencies_input);
        // TODO: Finish this test
        writeFileSync('delme.json', JSON.stringify(actual_output, null, 4));
        let errors = [];
        correct_outputs.forEach(output => {
            try {
                expect(actual_output).to.be.eql(output);
            } catch (e) {
                // @ts-ignore
                errors.push(e);
            }
        });
        if (errors.length === correct_outputs.length) throw errors[0];
    });
});
