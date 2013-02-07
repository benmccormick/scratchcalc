/**
 * EQTokenizer - An Equation Tokenizer for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global NumberValue:false */

/** The Tokenizer module takes a string and splits it up into individual tokens
*/ 
var EQTokenizer = (function() {
    "use strict";
    var EQT ={};
    var tokenlist = [];
    var vars = {};
    var units = {};

    EQT.init = function(varMap, unitMap){
        vars = varMap;
        units = unitMap;
    };

    //Takes the strings and splits it into tokens
    EQT.tokenize = function(expression,getVar) {
        tokenlist = [];

        // Regexs for each token type
        var numx = /^(-?\d+\.?\d*|^-?\.\d+)/;
        var spacex = /^\s+/;
        var operx = /^[\+\-\*\/!%\^&|,)\[\]#=]/;
        var unopx = /^[!%]/;
        var funcx = /^\w*\(/;
        var varx = /^[a-zA-Z]+\d*[\:\-\'\?\.]?/;
        var assignnext = /^\s*=/;
        var ZERO = new NumberValue("0");
        //  Goes through the expression and splits it using the regexs
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
                var number = new NumberValue(numres[0]);
                expression = expression.substring(numres[0].length);
                if(number.compareTo(ZERO)<= 0 &&// if  negative number
                    last !== null && //list isn't empty
                    (last === ")" || numx.exec(last) !== null ||
                    varx.exec(last) !== null)) //isn't a subtraction
                {
                    tokenlist.push("-");
                    tokenlist.push((numres[0]+"").substring(1)+"");
                }
                else
                {
                    tokenlist.push(numres[0]+"");
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
                //Only push text if its a valid variable or unit.  Else ignore
                var newexpression =expression.substring(varres[0].length);
                if(typeof getVar(varres[0]) !== "undefined" ||
                    units[varres[0]]|| assignnext.exec(newexpression)){
                    tokenlist.push(varres[0]);
                }
                expression = newexpression;
                continue;
            }
            return false;
        }
        addImplicitMultiplication();
        return tokenlist;
    };

    //Return the token list
    EQT.getList = function(){
        return tokenlist; 
    };

    //Adds a * between implicitly multiplied items
    function addImplicitMultiplication(){

        var opener = /^[)\d\w]+$/;
        var closer = /^[(\d\w]+$/;
        var i=tokenlist.length-2;
        for(i; i>=0; i--){
            if(opener.exec(tokenlist[i])&& closer.exec(tokenlist[i+1])){
                tokenlist.splice(i+1,0,"*");
            }
        }
    }

   

    return EQT;
}());

