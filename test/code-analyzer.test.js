import assert from 'assert';
import {sendToTable1} from '../src/js/toTable';

import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        let parse = parseCode('');
        assert.equal(
            JSON.stringify(sendToTable1(parse)),
            '[]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        let parse = parseCode('let a = 1;');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'variable declaration', Name: 'a', Condition: '', Value: 1}]
        );
    });
});
describe('The javascript parser', () => {
    it('is parsing a simple function declaration correctly', () => {
        let parse = parseCode('function binarySearch(X){}');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'FunctionDeclaration', Name: 'binarySearch', Condition: '', Value: ''},
                {Line: 1, Type: 'variable declaration', Name: 'X', Condition: '', Value: ''}]
        );
    });
    it('is parsing a simple assignment expression correctly', () => {
        let parse = parseCode('low = 0;');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'assignment expression', Name: 'low', Condition: '', Value: 0}]
        );
    });
});
describe('The javascript parser', () => {
    it('is parsing a simple while statement correctly', () => {
        let parse = parseCode('while (low <= high){}');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'while statement', Name: '', Condition: 'low<=high', Value: ''}]
        );
    });
    it('is parsing a simple if statement correctly', () => {
        let parse = parseCode('if (X < V[mid]){x=1;}');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'if statement', Name: '', Condition: 'X<V[mid]', Value: ''},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: '', Value: 1}]
        );
    });
});
describe('The javascript parser', () => {
    it('is parsing update expression correctly', () => {
        let parse = parseCode('i++');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'Update Expression', Name: 'i', Condition: '', Value: '++'}]
        );
    });
    it('is parsing for statement correctly', () => {
        let parse = parseCode('for(let i=0;i<5;i++){let x=i+5;}');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'ForStatement', Name: '', Condition: 'i<5', Value: ''},
                {Line: 1, Type: 'variable declaration', Name: 'i', Condition: '', Value: 0},
                {Line: 1, Type: 'Update Expression', Name: 'i', Condition: '', Value: '++'},
                {Line: 2, Type: 'variable declaration', Name: 'x', Condition: '', Value: 'i+5'}]
        );
    });
});
describe('The javascript parser', () => {
    it('is parsing while statement correctly', () => {
        let parse = parseCode('while(i>5){i++}');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'while statement', Name: '', Condition: 'i>5', Value: ''},
                {Line: 2, Type: 'Update Expression', Name: 'i', Condition: '', Value: '++'}]
        );
    });
    it('is parsing if-else statement correctly', () => {
        let parse = parseCode('if (X < V[mid])\n' +
            ' x=1;\n' +
            'else\n' +
            ' x=10;');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'if statement', Name: '', Condition: 'X<V[mid]', Value: ''},
                {Line: 2, Type: 'assignment expression', Name: 'x', Condition: '', Value: 1},
                {Line: 3, Type: 'Else Statemen', Name: '', Condition: '', Value: ''},
                {Line: 4, Type: 'assignment expression', Name: 'x', Condition: '', Value: 10}] );});});
describe('The javascript parser', () => {
    it('is parsing if-else if statement correctly', () => {
        let parse = parseCode('        if (X < V[mid])\n' +
            '            high = mid - 1;\n' +
            '        else if (X > V[mid])\n' +
            '            low = mid + 1;\n' +
            '        else\n' +
            '            low=1;');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'if statement', Name: '', Condition: 'X<V[mid]', Value: ''},
                {Line: 2, Type: 'assignment expression', Name: 'high', Condition: '', Value: 'mid-1'},
                {Line: 3, Type: 'Else If Statement', Name: '', Condition: 'X>V[mid]', Value: ''},
                {Line: 4, Type: 'assignment expression', Name: 'low', Condition: '', Value: 'mid+1'},
                {Line: 5, Type: 'Else Statemen', Name: '', Condition: '', Value: ''},
                {Line: 6, Type: 'assignment expression', Name: 'low', Condition: '', Value: 1}]
        );
    });
});
describe('The javascript parser', () => {
    it('is parsing a  return statment  and unary expression corectly', () => {
        let parse = parseCode('function func(){return -1}');
        assert.deepEqual(
            sendToTable1(parse),
            [{Line: 1, Type: 'FunctionDeclaration', Name: 'func', Condition: '', Value: ''}
                ,{Line: 2, Type: 'return statement', Name: '', Condition: '', Value: '-1'}]
        );
    });



});

