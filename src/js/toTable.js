import * as symbolic from './symbolicSub';

let tableParse ;
let counter =1;
let colorIndex;
let toDraw;
let counteri= 0;
let obj = [];

const sendToTable1 = (parseCode) =>
{
    init();
    let root = makeNode('squere',true,undefined);
    tableParse = [];
    counter =1;
    tableParse = sendToTable(parseCode,root);
    getObjects(root,obj);
    toDraw=getStringToFlowChart(obj);

    //obj = getObjects(nodeTrue);
    return tableParse;
};

export function getDraw()
{
    return toDraw;
}

export function getObjects(node,obj)
{

    if (node!=undefined)
    {
       // if(node.value[0]==='NULL')
        node.checki = true;
        node.index= counteri;
        counteri++;
        if (obj[node.index]==undefined) {
            node.next=checkEmptyLine(node.next);
            node.false=checkEmptyLine(node.false);
            node.true=checkEmptyLine(node.true);
            obj[node.index]=node;
            if(node.next) {
                if (node.next.value[0] != 'NULL' || !node.next.checki)
                    getObjects(node.next, obj);
            }
            if(node.true){
                if(!node.true.checki)
                    getObjects(node.true,obj);}
            if(node.false){
                if(!node.false.checki)
                    getObjects(node.false,obj);}
        }
    }
}

function checkEmptyLine(node)
{
    if (node!=undefined &&node.lines!=undefined && node.lines.length==0 && node.type!='circle')
        node=node.next;
    return node;
}

function getColorNode(node)
{
    if (node.isTrue==true)
        return 'green';
    else
        return 'white';
}

function getStringToFlowChart(root)
{
    var oprands='';
    for (let i=0;i<root.length;i++)
    {
        var node=root[i];
        if (node == undefined)
            continue;
        var color=getColorNode(node);
        if (node.type=='squere')
            oprands+= 'op'+node.index+'=>operation: '+getLinesContent(node.value)+'|'+color+'\n';
        else if (node.type=='diamond')
            oprands+= 'op'+node.index+'=>condition: '+getLinesContent(node.value)+'|'+color+'\n';
        else
            oprands+= 'op'+node.index+'=>start: continue |'+color+'\n';
    }
    return addKshatot(oprands,root);

}

function addKshatot2(node,nodeName,oprands,type)
{
    if (node!=undefined) {
        var nodeTrue='op'+node.index;
        if (node.isTrue)
            oprands+=nodeName+'('+type+')->'+nodeTrue+'\n';
        else
            oprands+=nodeName+'('+type+',right)->'+nodeTrue+'\n';
    }
    return oprands;
}
const addKshatot=(oprands,objects)=>
{
    for (let i=0;i<objects.length;i++) {
        let node=objects[i];
        if (node==undefined)
            continue;
        let nodeName='op'+node.index;
        if (node.type=='diamond') {
            oprands=addKshatot2(node.true,nodeName,oprands,'yes');
            oprands=addKshatot2(node.false,nodeName,oprands,'no');
        }
        if (node.next!=undefined) {
            let nodeNext = 'op' + node.next.index;
            oprands+=nodeName+'->'+nodeNext+'\n';
        }
    }
    return oprands;
}

function getLinesContent(lines)
{
    var ans='';
    for (let i=0;i<lines.length;i++)
        ans+=lines[i]+'\n';
    return ans;
}

export const init = ()=> {
    colorIndex = 0;
    toDraw = '';
    counteri = 0;
    obj = [];
};



const makeNode = (type, isTrue, next)=> {
    let node = {};
    node.type = type;
    node.isTrue = isTrue;
    node.next = next;
    node.value = [];
    return node;
};

const sendToTable = (parseCode,node)=> {
    try {
        parseCode.body.forEach(line => {
            node = checkWich[line.type](line, node);
        });
    }
    catch (e) {
        node = checkWich[parseCode.body.type](parseCode.body, node);
    }
};


const funcDec = (line , node)=>
{
    tableParse.push({ Line: counter, Type: line.type, Name: line.id.name ,Condition:'', Value: ''});
    for(let i=0; i<line.params.length; i++)
    {
        tableParse.push({ Line: counter, Type: 'variable declaration', Name: line.params[i].name ,Condition:'', Value: ''});
    }
    counter++;
    if(line.body)
        sendToTable(line.body , node);
};

export const VariDec = (line , node)=>
{
    let value = null;
    for(let i=0; i<line.declarations.length; i++)
    {
        if(line.declarations[i].init != null )
            value = check(line.declarations[i].init);
        //tableParse.push({ Line: counter, Type: 'variable declaration', Name: line.declarations[i].id.name ,Condition:'', Value: value});
        node.value.push (line.declarations[i].id.name + ' = ' + value);
    }
    counter++;
    return node;
};

export const expressState = (line,node)=>
{
    if(line.expression.operator==='=') {
        let name = check(line.expression.left);
        let value = check(line.expression.right);
        //tableParse.push({Line: counter, Type: 'assignment expression', Name: name, Condition: '', Value: value});
        node.value.push(name + '=' + value);
        counter++;
    }
    else
        checkWich[line.expression.type](line.expression);
    return node;
};

const forState= (line)=>{
    tableParse.push({Line: counter , Type: line.type, Name: '', Condition: check(line.test) , Value: ''});
    checkWich[line.init.type](line.init);
    counter--;
    checkWich[line.update.type](line.update);
    sendToTable(line.body);
};


const whileState = (line,node,prevNode,isFromConseq)=>
{
    if(node.fromConseq2)
        node=prevNode;
    let cond = check(line.test);
    let whileNode=makeNode('diamond',node.isTrue ,undefined);
    whileNode.value.push('While '+ cond );
    let nullNode = makeNode('squere',node.isTrue,whileNode);
    nullNode.value.push('NULL');
    if((node.next== undefined) && node.true == undefined && node.false == undefined  )
    {
        node.next = nullNode;
    }


    /*if(node.type!='diamond' && node.value.length!=0)
        node.next= nullNode;
    else {
        node = nullNode;
    }*/
    counter++;
    if(line.body ) {
        whileNode.true = conseq2(line.body, node.isTrue,node);
        if(whileNode.true.value[0]!='NULL' && whileNode.true.type!='diamond')
            whileNode.true.next = nullNode;
    }
    if(isFromConseq) {
        return nullNode;
    }
    else{
        whileNode.false = makeNode('squere',whileNode.isTrue,undefined);
        return whileNode.false;}
};


const conseq2 = ( line , isTrue,nodi)=>
{
    let node = makeNode('squere',isTrue,undefined);
    node.fromConseq2 = true;
    //let node;
    if(line.body != undefined) {
        for (let i = 0; i < line.body.length; i++) {
            node=checkWich[line.body[i].type](line.body[i],node,nodi,true);
        }
    }
    else
        checkWich[line.type](line.consequent, node);
    return node;
};

export const reState = (line,node)=>
{
    //var nodi = node;
   /* while(node.next!= undefined || node.true != undefined || node.false != undefined)
    {
        if(node.next != undefined)
            node = node.next;
        else if(node.true != undefined && node.true.isTrue)
            node = node.true;
        else if(node.false!=undefined && node.false.isTrue)
            node = node.false;
    }*/
    let value = check(line.argument);
    //var nodi = makeNode('squere',true,undefined);
    node.value.push('return ' + value );
    //node = nodi;
    //tableParse.push({Line: counter , Type: 'return statement', Name: '', Condition:'' , Value: value});
    counter++;
};

const updateExp = (line)=>
{
    let name = check(line.argument);
    let value = line.operator;
    tableParse.push({Line: counter , Type: 'Update Expression', Name: name, Condition:'' , Value: value});
    counter++;
};

export const ifState = (line , node, prevNode,fromConseq,circleOut)=>
{
    if(node.fromConseq2)
        node=prevNode;
    if (line.type===undefined)
        line.type='If Statement';
    /*if(node.next== undefined && node.true == undefined && node.false == undefined && node.value.length==0)
    {
        node=conSeq2Node;
    }*/

    let cond = check(line.test);
    let ifNode = makeNode('diamond',node.isTrue ,undefined);
    ifNode.value.push(cond);

    //tableParse.push({ Line: counter, Type: 'if statement', Name: '' ,Condition:cond, Value:'' });
    counter++;
    let isTrue = symbolic.getColorsMap();
    let nextForCon
    if(circleOut == undefined)
        nextForCon=makeNode('circle',isTrue[colorIndex],node.next);
    if((node.next== undefined) && node.true == undefined && node.false == undefined  )
    {
        node.next = ifNode;
    }
    if (line.consequent.body != undefined) {
        ifNode.true = conseq(line.consequent.body, line, isTrue,ifNode);
        if(ifNode.true.value[0]=='NULL')
            ifNode.true.next.false=nextForCon;
        else if(ifNode.true.next == undefined)
            ifNode.true.next=nextForCon;
    }
    else {
        ifNode.true= conseq(line.consequent, line , isTrue,ifNode);
    }
    /*if(node.type != 'diamond')
        node.next = ifNode;*/

    if(line.alternate)
    {
        if(line.alternate.type==='IfStatement') {
            ifNode.false = elseSta('Else If Statement', line.alternate, isTrue, ifNode, nextForCon);
            if(ifNode.false.false==undefined)
                ifNode.false.false=nextForCon;
        }
        else
            ifNode.false =elseSta('Else Statemen',line.alternate,isTrue, ifNode, nextForCon);
    }
    /* if(nextForCon.next==undefined && node.type!='diamond')
     {
         nextForCon.next = makeNode('squere',nextForCon.isTrue,undefined);
         return nextForCon.next;
     }
     else if(nextForCon.next==undefined && node.type=='diamond')
     {
         nextForCon.next = node;
         return nextNode;
     }*/
    if(fromConseq) {

        return ifNode;
    }
    else{
        nextForCon.next = makeNode('squere',ifNode.isTrue,undefined);
        return nextForCon.next;}

};

const conseq = (consequent , line , isTrue,ifNode)=>
{
    let node = makeNode('squere',isTrue[colorIndex],undefined);
    let nodeWhile;
    colorIndex++;
    if(line.consequent.body != undefined) {
        for (let i = 0; i < line.consequent.body.length; i++) {
            if(line.consequent.body[i].type=='WhileStatement')
                nodeWhile= checkWich[line.consequent.body[i].type](line.consequent.body[i], ifNode,undefined,true);
            else {
                checkWich[line.consequent.body[i].type](line.consequent.body[i], node,true);
                if(nodeWhile) {
                    nodeWhile.false= node;
                    return nodeWhile;
                }
            }
        }
    }
    else
        checkWich[line.consequent.type](line.consequent, node);
    if(nodeWhile)
        return nodeWhile;
    else
        return node;
};

const elseSta = (type, line,isTrue,node,nextForCon)=>
{
    //let nextNode;
    if(type === 'Else If Statement') {
        let cond = check(line.test);
        let elseIfNode = makeNode('diamond',isTrue[colorIndex] ,undefined);
        elseIfNode.value.push(cond);
        //tableParse.push({Line: counter, Type: type, Name: '', Condition: cond, Value: ''});
        counter++;
        if(nextForCon.isTrue==undefined) {
            nextForCon.isTrue = isTrue[colorIndex];
            colorIndex++;
        }
        if (line.consequent.body != undefined) {
            elseIfNode.true = conseq(line.consequent.body, line, isTrue,elseIfNode);
            if(elseIfNode.true.type=='diamond')
                elseIfNode.true.false=nextForCon;
            else
                elseIfNode.true.next=nextForCon;
        }
        else {
            elseIfNode.true= conseq(line.consequent, line , isTrue,elseIfNode);
        }
        if(line.alternate)
        {
            if(line.alternate.type==='IfStatement') {
                elseIfNode.false = elseSta('Else If Statement', line.alternate, isTrue, elseIfNode,nextForCon);
                if(elseIfNode.false.false==undefined)
                    elseIfNode.false.false=nextForCon;
            }else
                elseIfNode.false=elseSta('Else Statemen',line.alternate,isTrue,elseIfNode,nextForCon);
        }
        return elseIfNode;

    }
    else{
        tableParse.push({Line: counter, Type: type, Name: '', Condition: '', Value: ''});
        counter++;
        //let nextNextNode=makeNode('circle',isTrue[colorIndex],undefined);
        if(!nextForCon.isTrue)
            nextForCon.isTrue = isTrue[colorIndex];
        let elseNode = makeNode('squere',isTrue[colorIndex] ,nextForCon);
        colorIndex++;
        let nodeWhile;
        for (let i = 0; i < line.body.length; i++) {
            if(line.body[i].type=='WhileStatement') {
                nodeWhile = checkWich[line.body[i].type](line.body[i], elseNode, true);
                if(nodeWhile.value[0]=='NULL')
                    nodeWhile.next.false=nextForCon;
            }
            else {
                elseNode = checkWich[line.body[i].type](line.body[i], elseNode);
                if(nodeWhile) {
                    nodeWhile.false= elseNode;
                    return nodeWhile;
                }
            }
        }
        if(nodeWhile)
            return nodeWhile;
        else
            return elseNode;
    }

};

export const check = (line)=>
{
    if(line.type === 'Identifier')
        return line.name;
    else if(line.type === 'Literal')
        return isNaN(line.value) ? '\''+line.value+'\'' : line.value ;
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
