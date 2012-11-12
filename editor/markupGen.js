/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * 
 *
 * @author Ben McCormick
 **/

/*global BigDecimal:false tablePlaceHolder:true RoundingMode:false EQParser:false*/



var markupGen = (function () {
    var mG = {};

    mG.markup = function(expression){

        var output = expression.replace(/\s/g,"&nbsp;");
        //Removed & for now because it breaks &nbsp;  should add again later
        output = output.replace(/[\+\-\*\/!%\^|,\[\]!#]/g,
            "<span class=\"operator\">$&</span>");
        output = output.replace(/\d+/g,"<span class=\"number\">$&</span>");
        output = output.replace(/\w+\(/g,"<span class=\"function\">$&</span>");
        output = output.replace(/\)/g,"<span class=\"function\">$&</span>");
        output = output.replace(/\w+\d*/g,returnTextValue);
        return output;
    };

    function returnTextValue(vartext){
        var spantext = "<span class=\"variable\">"+vartext+"</span>";
        if(EQScanner.getVar(vartext))
        {
            return spantext;
        }
        else
        {
            return vartext;
        }

    }

    return mG;
}());
