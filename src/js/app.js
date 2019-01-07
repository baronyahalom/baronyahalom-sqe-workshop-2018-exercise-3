import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as symbolic from './symbolicSub';
import * as parse from './toTable';
let tableParse ;
//let counter = 1;

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        symbolic.parsInput($('#input').val());
        print(symbolic.symbolicSubstitution(codeToParse,parsedCode));
        parse.sendToTable1(parsedCode);
        drawGraph(parse.getDraw());

    });
});

function drawGraph(operands)
{
    let diagram = flowchart.parse(operands);
    diagram.drawSVG('diagram', {
        'x': 0, 'y': 0,
        'line-width': 2, 'line-length': 50, 'text-margin': 10, 'font-size': 14, 'font-color': 'black', 'line-color': 'black',
        'element-color': 'black', 'fill': 'white', 'yes-text': 'T', 'no-text': 'F', 'arrow-end': 'block', 'scale': 1,
        'symbols': {
            'start': {
                'font-color': 'black', 'element-color': 'green', 'fill': 'yellow' ,'start-text': '',
            },
            'end':{
                'class': 'end-element'
            }
        },
        'flowstate' : {
            'green' : { 'fill' : 'green'}, 'white': {'fill' : 'white'}
        }
    });
}


const print= (lines)=> {
    $('.red').remove();
    $('.green').remove();
    $('.white').remove();
    let colorsMap=symbolic.getColorsMap();
    let index=0;
    for(let i=0;i<lines.length;i++){
        let color=getColor(lines[i],index,colorsMap);
        if(color !='white'){
            index++;
        }
        $('#res').append($('<div>'+lines[i]+'</div>').addClass(color));
    }
};

const getColor=(line,index,colorsMap)=>{
    if(line.includes('if')|| line.includes('else'))
    {
        return colorsMap[index] ? 'green' : 'red';
    }
    return 'white';
};

const makeTable= ()=> {
    clear();
    let table = $('<table>');
    table.append($('<tr>').addClass('t_row'));
    table.append( $('<th>').addClass('t_header').text('Line'));
    table.append( $('<th>').addClass('t_header').text('Type'));
    table.append( $('<th>').addClass('t_header').text('Name'));
    table.append( $('<th>').addClass('t_header').text('Condition'));
    table.append( $('<th>').addClass('t_header').text('Value'));
    tableParse.forEach(row => {if(row!==undefined)
    {
        table.append($('<tr>').addClass('t_row'));
        table.append( $('<td>').addClass('t_data').text(row.Line));
        table.append( $('<td>').addClass('t_data').text(row.Type));
        table.append( $('<td>').addClass('t_data').text(row.Name));
        table.append( $('<td>').addClass('t_data').text(row.Condition));
        table.append( $('<td>').addClass('t_data').text(row.Value));}
    });
    return table;
};


const clear= ()=>{

    $('.t_row').remove();
    $('.t_header').remove();
    $('.t_data').remove();
};



