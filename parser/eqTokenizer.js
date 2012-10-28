/**
 * EQTokenizer - An Equation Tokenizer for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global BigDecimal:false */

var EQTokenizer = (function() {
    var EQT ={};
    var tokenlist = [];
    EQT.tokenize = function(expression){
        tokenlist = [];
        var numx = /^-?\d+\.?\d*/;
        var spacex = /^\s+/;
        var operx = /^[\+\-\*\/!%\^&|,)\[\]#]/;
        var unopx = /^!/;
        var funcx = /^\w*\(/;
        var varx = /^\w+\d*/;
        while(expression.length > 0)
        {
            var last = null;
            if(tokenlist.length > 0)
            {
                last=tokenlist[tokenlist.length-1];
            }
            var numres = numx.exec(expression);
            if(numres)
            {
                var number = BigDecimal(numres[0]);
                expression = expression.substring(numres[0].length);
                if(number.compareTo(BigDecimal("0"))< 0 &&// if  negative number
                    last !== null && //list isn't empty
                    (last === ")" || numx.exec(last) !== null ||
                    varx.exec(last) !== null)) //isn't a subtraction
                {
                    tokenlist.push("-");
                    tokenlist.push(number+"");
                }
                else
                {
                    tokenlist.push(number+"");
                }
                continue;
            }
            var spaceres = spacex.exec(expression);
            if(spaceres)
            {
                expression = expression.substring(spaceres[0].length);
                continue;
            }
            var opres = operx.exec(expression);
            if(opres)
            {
                tokenlist.push(opres[0]);
                expression = expression.substring(opres[0].length);
                continue;
            }
            var unopres = unopx.exec(expression);
            if(unopres)
            {
                tokenlist.push(unopres[0]);
                expression = expression.substring(unopres[0].length);
                continue;
            }
            var funcres = funcx.exec(expression);
            if(funcres)
            {
                tokenlist.push(funcres[0]);
                expression = expression.substring(funcres[0].length);
                continue;
            }
            var varres = varx.exec(expression);
            if(varres)
            {
                tokenlist.push(varres[0]);
                expression = expression.substring(varres[0].length);
                continue;
            }


        }


    };

    EQT.process = function(){

    };

    EQT.getList = function(){
        return tokenlist; 
    };

    return EQT;
}());

