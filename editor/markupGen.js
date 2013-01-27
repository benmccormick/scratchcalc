/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * 
 *
 * @author Ben McCormick
 **/

/*global BigDecimal:false tablePlaceHolder:true RoundingMode:false EQParser:false*/



var markupGen = (function () {
    "use strict";
    var mG = {};
    var currentVarFunc;
    mG.markup = function(expression,getVar){
        currentVarFunc = getVar;
        var output = expression.replace(/\s/g,"&nbsp;");
        //Removed & for now because it breaks &nbsp;  should add again later
        output = output.replace(/[\+\-\*\/!%\^|,\[\]!#\=]/g,
            "<span class=\"operator\">$&</span>");
        output = output.replace(/\b\d+/g,"<span class=\"number\">$&</span>");
        output = output.replace(/\w*\(/g,"<span class=\"function\">$&</span>");
        output = output.replace(/\)/g,"<span class=\"function\">$&</span>");
        output = output.replace(/[a-zA-Z]+\d*/g,returnTextValue);
        return output;
    };

    function returnTextValue(text){
        var vartext = "<span class=\"variable\">"+text+"</span>";
        if(currentVarFunc(text))
        {
            return vartext;
        }
        else
        {
            //don't try to style this because you catch all the previous span tags
            return text;
        }

    }

    return mG;
}());
