//import {parseCode} from './code-analyzer';

let tableParse ;
let counter ;

const sendToTable1 = (parseCode) =>
{
    tableParse = [];
    counter =1;
    tableParse = sendToTable(parseCode);
    return tableParse;
};
const sendToTable = (parseCode)=> {
    parseCode.body.forEach(line=>{
        checkWich[line.type](line);
    });
    return tableParse;
};


const funcDec = (line)=>
{
    tableParse.push({ Line: counter, Type: line.type, Name: line.id.name ,Condition:'', Value: ''});
    for(let i=0; i<line.params.length; i++)
    {
        tableParse.push({ Line: counter, Type: 'variable declaration', Name: line.params[i].name ,Condition:'', Value: ''});
    }
    counter++;
    if(line.body)
        sendToTable(line.body);
};

const VariDec = (line)=>
{
    let value = null;
    for(let i=0; i<line.declarations.length; i++)
    {
        if(line.declarations[i].init != null )
            value = check(line.declarations[i].init);
        tableParse.push({ Line: counter, Type: 'variable declaration', Name: line.declarations[i].id.name ,Condition:'', Value: value});
    }
    counter++;
};

const expressState = (line)=>
{
    if(line.expression.operator==='=') {
        let name = check(line.expression.left);
        let value = check(line.expression.right);
        tableParse.push({Line: counter, Type: 'assignment expression', Name: name, Condition: '', Value: value});
        counter++;
    }
    else
        checkWich[line.expression.type](line.expression);
};

const forState= (line)=>{
    tableParse.push({Line: counter , Type: line.type, Name: '', Condition: check(line.test) , Value: ''});
    checkWich[line.init.type](line.init);
    counter--;
    checkWich[line.update.type](line.update);
    sendToTable(line.body);
};


const whileState = (line)=>
{
    let cond = check(line.test);
    tableParse.push({ Line: counter, Type: 'while statement', Name: '' ,Condition:cond, Value:'' });
    counter++;
    if(line.body)
        sendToTable(line.body);
};

const reState = (line)=>
{
    let value = check(line.argument);
    tableParse.push({Line: counter , Type: 'return statement', Name: '', Condition:'' , Value: value});
    counter++;
};

const updateExp = (line)=>
{
    let name = check(line.argument);
    let value = line.operator;
    tableParse.push({Line: counter , Type: 'Update Expression', Name: name, Condition:'' , Value: value});
    counter++;
};

const ifState = (line)=>
{
    if (line.type===undefined)
        line.type='If Statement';
    let cond = check(line.test);
    tableParse.push({ Line: counter, Type: 'if statement', Name: '' ,Condition:cond, Value:'' });
    counter++;
    //if(line.consequent.type === 'BlockStatement')
    line.consequent = line.consequent.body;
    for(let i=0; i<line.consequent.length; i++)
        checkWich[line.consequent[i].type](line.consequent[i]);
    if(line.alternate)
    {
        if(line.alternate.type==='IfStatement')
            elseSta('Else If Statement',line.alternate);
        else
            elseSta('Else Statemen',line.alternate);
    }
};

const elseSta = (type, line)=>
{
    if(type === 'Else If Statement') {
        let cond = check(line.test);
        tableParse.push({Line: counter, Type: type, Name: '', Condition: cond, Value: ''});
        counter++;
        line.consequent = line.consequent.body;
        for(let i=0; i<line.consequent.length; i++)
            checkWich[line.consequent[i].type](line.consequent[i]);
        if(line.alternate) {
            if(line.alternate.type==='IfStatement')
                elseSta('Else If Statement',line.alternate);
            else
                elseSta('Else Statemen',line.alternate);}
    }
    else{
        tableParse.push({Line: counter, Type: type, Name: '', Condition: '', Value: ''});
        counter++;
        checkWich[line.type](line);}
};

const check = (line)=>
{
    if(line.type === 'Identifier')
        return line.name;
    else if(line.type === 'Literal')
        return line.value;
    else if(line.type === 'MemberExpression')
        return check(line.object) + '[' + check(line.property) + ']';
    else
        return check2(line);
};

const check2 = (line) =>
{
    let exp;
    if(line.type === 'BinaryExpression')
    {   let left= check(line.left);
        let right= check(line.right);
        exp= left+line.operator+right;
        return exp;
    }
    else if(line.type === 'UnaryExpression')
    {
        exp=line.operator + line.argument.value;
        return exp;
    }
};

const checkWich = {

    'FunctionDeclaration': funcDec,
    'VariableDeclaration': VariDec,
    'ExpressionStatement': expressState,
    'WhileStatement': whileState,
    'IfStatement': ifState,
    'ReturnStatement' : reState,
    'ForStatement': forState,
    'UpdateExpression' : updateExp,
};

export {sendToTable1};
