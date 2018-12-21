//import {parseCode} from './code-analyzer';


let lineCounter =1 ;
let varMap;
let linesDic;
let ifElaseMap;
let prevDic;
let dic;
let tableParse;


export const symbolicSubstitution = (codeToParse,parseCode) =>
{
    tableParse = [];
    lineCounter =1;
    ifElaseMap=[];
    linesDic=[];
    dic=[];
    prevDic = [];
    checkGlob(parseCode);
    dic= copyVarMapToDic();
    substitute(parseCode);
    //return tableParse;
    return create(codeToParse);
};

const checkGlob= (parsedCode)=>{
    parsedCode.body.forEach(item=>{
        switch (item.type) {
        case 'VariableDeclaration':
        {
            let dec = item.declarations;
            let val;
            dec.forEach((decl)=> {
                if(decl.init == null)
                    val=null;
                else
                    val = check(decl.init);
                setVarMap(check(decl.id),val);
            });
            break;}
        case 'ExpressionStatement': setVarMap(check(item.expression.left),check(item.expression.right)); break;
        }
    });
};

/*const parseDeclarations = (declarations) =>{
    declarations.forEach((decleration)=> {
        insertToMap(check(decleration.id),check(decleration.init));
    });
};*/

const setVarMap = (left,right) =>{
    if(right!=null && Array.isArray(right)) {

        return setVarMap2(left,right);
    }
    const varNum=checkIfNum(right);
    if(varNum.length>0)
        right= getFromVarMap(varNum,right);
    if(right===null)
        right= setVarMap3(left,right);
    varMap[left]=calcRight(right);
};

const setVarMap2 = (left,right) =>{
    if(right!=null && Array.isArray(right)) {
        let x = '[';
        for(let i=0;i<right.length;i++)
            x=x+right[i]+',';
        x = x.substring(0,x.length-1);
        x = x + ']';
        return toVarMap(left + '=' + x);
    }

};

const setVarMap3 = (left,right) =>{
    if(left in varMap)
        return varMap[left];
    else
        return right;
};


const getFromVarMap = (varNum,right)=> {
    for (let i=0;i<varNum.length;i++)
    {
        if(varNum[i] in varMap)
            right= right.replace(varNum[i],varMap[varNum[i]]);
    }
    return right;

};

const calcRight= (val)=>{
    if(!isNaN(val)){
        return val;
    }
    val=val.split(' ').join('');
    let right='';
    right = calcRight2(val);
    return right;
};

const calcRight2 = (val)=>{
    let right='';
    try {
        let caseTrue=eval(val);
        if(/^[a-zA-Z]+$/.test(caseTrue) && caseTrue!=true && caseTrue!=false)
            caseTrue='\''+caseTrue+'\'';
        right+= caseTrue;
    }catch(e){
        right = val;
    }
    return right;
};

const substitute = (parseCode,whatIsNext)=> {
    try {
        parseCode.body.forEach(line => {
            checkWich[line.type](line, whatIsNext);
        });
    }
    catch (e) {
        checkWich[parseCode.body.type](parseCode.body, whatIsNext);
    }

};


//functions for funcDec
const funcDec = (line,whatIsNext)=>
{
    //aaa
    //tableParse.push({ Line: lineCounter, Type: line.type, Name: line.id.name ,Condition:'', Value: ''});
    for(let i=0; i<line.params.length; i++)
    {
        //tableParse.push({ Line: lineCounter, Type: 'variable declaration', Name: line.params[i].name ,Condition:'', Value: ''});
        addToDic(line.params[i].name,line.params[i].name);
        //dic[line.params[i].name] = line.params[i].name;
    }
    lineCounter++;
    saveCurrentDic();
    if(line.body)
        substitute(line.body,whatIsNext);
};

// functions for varDec
const VariDec = (line,whatIsNext)=>
{
    let value = null;
    for(let i=0; i<line.declarations.length; i++)
    {
        if(line.declarations[i].init != null )
            value = check(line.declarations[i].init,whatIsNext);
        tableParse.push({ Line: lineCounter, Type: 'variable declaration', Name: line.declarations[i].id.name ,Condition:'', Value: value});
        addToDic(line.declarations[i].id.name,value);
    }
    lineCounter++;
    saveCurrentDic();
};

///function for assignmentExp
const expressState = (line,whatIsNext)=>
{
    if(line.expression.operator==='=') {
        let name = check(line.expression.left);
        let value = check(line.expression.right);
        tableParse.push({Line: lineCounter, Type: 'assignment expression', Name: name, Condition: '', Value: value});
        addToDic(name,value);
        lineCounter++;
        saveCurrentDic();
    }
    else
        checkWich[line.expression.type](line.expression,whatIsNext);
};


//function for whileState
const whileState = (line,whatIsNext)=>
{
    let cond = check(line.test,whatIsNext);
    tableParse.push({ Line: lineCounter, Type: 'while statement', Name: '' ,Condition:cond, Value:'' });
    lineCounter++;
    saveCurrentDic();
    if(line.body.body)
        substitute(line.body,whatIsNext);
    else if(line.body)
        substitute(line,whatIsNext);
};

//function for returnState
const reState = (line , whatIsNext)=>
{
    let value = check(line.argument,whatIsNext);
    tableParse.push({Line: lineCounter , Type: 'return statement', Name: '', Condition:'' , Value: value});
    lineCounter++;
    saveCurrentDic();
};

//functions for ifState
const ifState = (line , whatIsNext)=>
{
    if (line.type===undefined)
        line.type='If Statement';
    let cond = check(line.test);
    let isIfTrue=checkCond(cond,whatIsNext);
    ifElaseMap.push(isIfTrue);
    if(isIfTrue)
        whatIsNext=false;
    lineCounter++;
    saveCurrentDic();
    prevDic=dicToTemp();
    if (line.consequent.body != undefined)
        conseq(line.consequent.body,line , isIfTrue);
    else
        conseq(line.consequent,line , isIfTrue);
    if(line.alternate)
    {elseSta(line.alternate,whatIsNext);
    }};


const conseq = (consequent , line, isIfTrue)=>
{
    if(line.consequent.body != undefined) {
        for (let i = 0; i < line.consequent.body.length; i++)
            checkWich[line.consequent.body[i].type](line.consequent.body[i], isIfTrue);
    }
    else
        checkWich[line.consequent.type](line.consequent, isIfTrue);
};

const dicToTemp = ()=> {
    const prevdic=[];
    for(let item in dic)
        prevdic[item]=dic[item];
    return prevdic;
};

const elseSta = ( line , whatIsNext)=>
{
    dic = prevDic;
    if(line.type === 'IfStatement') {
        elseIf('Else If Statement', line , whatIsNext);

    } else{
        else2('Else Statemen',line,whatIsNext);}
};

const else2 = (type, line , whatIsNext)=> {
    dic = prevDic;
    tableParse.push({Line: lineCounter, Type: type, Name: '', Condition: '', Value: ''});
    if(whatIsNext === false)
        ifElaseMap.push(whatIsNext);
    else
        ifElaseMap.push(true);
    lineCounter++;
    saveCurrentDic();

    for(let i=0; i<line.body.length; i++)
        checkWich[line.body[i].type](line.body[i]);};

const elseIf = (type, line , whatIsNext)=> {
    let cond = check(line.test);
    tableParse.push({Line: lineCounter, Type: type, Name: '', Condition: cond, Value: ''});
    let isIfTrue=checkCond(cond,whatIsNext);
    ifElaseMap.push(isIfTrue);
    if(isIfTrue)
        whatIsNext=false;
    lineCounter++;
    saveCurrentDic();
    prevDic=dicToTemp();
    if (line.consequent.body != undefined)
        conseq(line.consequent.body,line , isIfTrue);
    else
        conseq(line.consequent,line , isIfTrue);
    if(line.alternate) {
        elseSta(line.alternate,whatIsNext);
    }
};

const checkCond = (condition ,whatIsNext)=> {
    let val = replaceValues(condition);
    val=calcRight(val);
    const arr = val.split(/[\s<>,=()*/;{}%+-]+/).filter(s => s !== ' ');
    arr.forEach((item) => {
        if (item in varMap)
            val = val.replace(item, varMap[item]);
    });
    let caseTrue= eval(val);
    if(whatIsNext != undefined){
        if(whatIsNext)
            return caseTrue;
        else
            return false;
    }
    else
        return caseTrue;

};

//helping functions

//1-function that saves line number + the dic in this line number
const saveCurrentDic= ()=>{
    const tempDic=[];
    for(let item in dic)
        tempDic[item]=dic[item];
    linesDic[lineCounter-1]=tempDic;
};

//2- two functions that insert to dic after raplacing vals
const addToDic= (key,val)=>{
    if(Array.isArray(val))
        return toMap(key,val);
    val=replaceValues(val);
    dic[key]=val;
};

const toMap = (key,val)=>{
    for(let i=0; i<val.length;i++)
        dic[key+'['+i+']']=val[i];

};

const replaceValues= (val)=>{
    let vars=[];
    if (isNaN(val)) {
        vars= val.split(/[\s<>,=()*/;{}%+-]+/).filter(s=>s!=='');
    }
    vars.forEach((item)=> {
        let varOrNum ='';
        if (dic[item] !== undefined) {
            varOrNum = item;
            if (!(varOrNum in varMap))
                varOrNum = dic[item];
            val = val.replace(item, varOrNum);
        }
    });
    return val;
};

//3- functions that help to find the type
const check = (line)=>
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
    {exp=line.operator + line.argument.value;
        return exp;}
    else if(line.type == 'ArrayExpression')
    {
        let res=[];
        (line.elements).forEach((line)=>{
            res.push(check(line));});
        return res;
    }
};

const checkWich = {
    'FunctionDeclaration': funcDec,
    'VariableDeclaration': VariDec,
    'ExpressionStatement': expressState,
    'WhileStatement': whileState,
    'IfStatement': ifState,
    'ReturnStatement' : reState
};


//## end of help functions

//this is for the input value

export const parsInput= sen =>{
    varMap=[];
    const res= sen.split(/,(?![^([]*[\])])/g).filter(s=>s!=='');
    res.forEach((varible)=> {
        toVarMap(varible);
    });
};


const toVarMap = (input)=>{
    const exp=input.split('=');
    let inputVar = exp[0].split(' ').join('');
    let inputVal = exp[1].split(' ').join('');
    if(inputVal[0]!=='['){
        varMap[inputVar]=inputVal;
    }
    else{
        inputVal=inputVal.substring(1,inputVal.length-1);
        const vals=inputVal.split(',');
        vals.forEach((val,index)=>toVarMap(inputVar+'['+index+']='+val));
    }
};

///now moving all the input values to dic
function copyVarMapToDic() {
    for(let vari in varMap) {
        dic[vari] =varMap[vari];
    }
    return dic;
}
// this for showing result
export const create=(code)=>{
    let lines=code.split(/\r?\n/);
    const res=[];
    let indx=0;
    for(let i=0;i<lines.length;i++){
        let sen=lines[i].replace('\t','');
        if(sen==='{' || sen==='' || sen==='}' || sen.split(' ').join('')===''|| sen.split(' ').join('')==='}'){
            indx++;
            res.push(sen);
        }
        else if(isToSave(sen))
            res.push(getValid(i-indx ,sen));}
    return res;
};

const getValid= (index,sen)=> {
    dic = [];
    let vars = linesDic[index+1];
    for(const k in vars)
        dic[k]=vars[k];
    return replaceValues(sen);
};



export const isToSave = (sen)=>{
    if(sen.includes('function'))
        return true;
    else if(getExp(sen) in varMap)
        return true;
    else if(sen.includes('else')||sen.includes('if'))
        return true;
    else
        return isToSave2(sen);
};

const isToSave2 = (sen)=>{
    if (sen.includes('return') || sen.includes('while'))
        return true;
};

export const getExp = (sen)=>{
    let val ='';
    if(sen.includes('=')){
        if (isNaN(sen)) {
            val= sen.split(/[\s<>,=()*/;{}%+-]+/).filter(s=>s!=='');
            val = val[0];
        }
        else
            val = '';
    }
    return val;
};

const checkIfNum = (val)=>{
    if (isNaN(val)) {
        return val.split(/[\s<>,=()*/;{}%+-]+/).filter(s=>s!=='');
    }
    return [];
};

/// function for the last part
export const getColorsMap= () => ifElaseMap;



