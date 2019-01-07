import assert from 'assert';
import {parsInput,symbolicSubstitution} from '../src/js/symbolicSub';
import {parseCode} from '../src/js/code-analyzer';
import {check,VariDec,expressState,reState,ifState,init}  from '../src/js/toTable';
describe('The javascript parser', () => {
    it('text 1', () => {
        var input='c= a + 1 ;';
        var parsedCode=parseCode(input);
        parsInput(input);
        //  symbol.symbolicSubstitution(codeToParse,parsedCode)
        var output = check(parsedCode.body[0].expression.right);
        assert.equal(output,'a+1');
    });
    it('test 2', () => {
        var input='function foo(x) {\n' +
            ' let c=7;\n' +
            '}';
        var parsedCode=parseCode(input);
        parsInput(input);
        var output = check(parsedCode.body[0].body.body[0].declarations[0].id);
        assert.equal(output,'c');
    });
    it('test 3', () => {
        var input='let x=-1;';
        var parsedCode=parseCode(input);
        parsInput(input);
        var output = check(parsedCode.body[0].declarations[0].init);
        assert.equal(output,'-1');
    });
    it('test 4', () => {
        var input='a[0]=8;';
        var parsedCode=parseCode(input);
        parsInput(input);
        var output = check(parsedCode.body[0].expression.left);
        assert.equal(output,'a[0]');
    });
    it('test 5', () => {
        var input='let x=-1;';
        var parsedCode=parseCode(input);
        parsInput(input);
        var curentNode={};
        curentNode.value =[];
        curentNode= VariDec(parsedCode.body[0],curentNode);
        assert.equal(curentNode.value.length,1);
        assert.equal(curentNode.value[0],'x = -1');
    });
    it('test 6', () => {
        var input='let c;\n' +
            'c=0;';
        var parsedCode=parseCode(input);
        parsInput(input);
        var curentNode={};
        curentNode.value =[];
        expressState(parsedCode.body[1],curentNode);
        assert.equal(curentNode.value.length,1);
        assert.equal(curentNode.value[0],'c=0');
    });
    it('test 7', () => {
        var input='function foo(){\n' +
            'let c=0;\n' +
            '  return c;\n' +
            '}';
        var parsedCode=parseCode(input);
        parsInput(input);
        var curentNode={};
        curentNode.value =[];
        reState(parsedCode.body[0].body.body[1],curentNode);
        assert.equal(curentNode.value.length,1);
        assert.equal(curentNode.value[0],'return c');
    });
    it('test 8', () => {
        var input='if (1 == 1 )\n' +
            '  a=7;';
        var parsedCode=parseCode(input);
        parsInput(input);
        symbolicSubstitution(input,parsedCode)
        var curentNode={};
        curentNode.isTrue = true;
        curentNode.next = undefined;
        curentNode.type = 'squere';
        curentNode.value =[];
        init();
        ifState(parsedCode.body[0],curentNode,undefined,undefined,undefined);
        assert.equal(curentNode.value.length,0);
        assert.equal(curentNode.type,'squere');
        //assert.equal(curentNode.next.true.lines.length,1);
    });


});