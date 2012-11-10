/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * 
 *
 * @author Ben McCormick
 **/

/*global BigDecimal:false tablePlaceHolder:true RoundingMode:false EQParser:false*/



var markupGen = (function () {
    var mG = {}

    mG.markup = function(expression){
        return expression.replace(/\s/g,"&nbsp;");
    };

    function generateMarkup(scanner){


    }

    return mG;
}());
