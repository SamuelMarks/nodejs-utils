import { expect } from 'chai';

import { build_dep_graph } from '../index';
import { IDependencies } from '../nodejs-utils';
import { writeFileSync } from 'fs';


export const dependencies_input: IDependencies[] = [
    { 'foo0': { _dependencies: ['foo2', 'foo3'] } },
    { 'foo1': { _dependencies: ['foo2', 'foo3'] } },
    { 'foo2': {} },
    { 'foo3': {} },
    { 'foo4': {} },
    { 'foo5': { _dependencies: ['foo2'] } }
];

describe('build dep graph', () => {
    it('builds correctly', () => {

        const correct_outputs = [
            ['foo4', 'foo2', 'foo3', 'foo0', 'foo1', 'foo5'],
            ['foo2', 'foo3', 'foo0', 'foo1', 'foo4', 'foo5']
        ];
        const actual_output = build_dep_graph(dependencies_input);
        writeFileSync('delme.json', JSON.stringify(actual_output, null, 4));
        let errors = [];
        correct_outputs.forEach(output => {
            try {
                expect(actual_output).to.be.eql(output);
            } catch (e) {
                errors.push(e);
            }
        });
        if (errors.length === correct_outputs.length) throw errors[0];
    });
});