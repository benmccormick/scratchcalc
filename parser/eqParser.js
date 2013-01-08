/**
 * EQParser - An Equation Parser for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global EQScanner:false EQTreeBuilder:false EQTokenizer:false EQParser:true
    tablePlaceHolder:false*/

var EQParser = (function(){
    "use strict";
    var EQP ={};
    var errorInfo = tablePlaceHolder.errors;
    var unitMap = tablePlaceHolder.units;
    var varMap = {
        "pi":new NumberValue("3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679")
    };

    

    var result;
    EQP.init = function(){
        EQTokenizer.init(varMap,unitMap);
        EQTreeBuilder.init(unitMap);
        EQScanner.init(varMap,unitMap);
    };

    EQP.parse = function(expression,precision){
        var tokens = EQTokenizer.tokenize("#"+expression+"#");
        if(!tokens) //Invalid Token
        {
            var tokenException ={
                    message: errorInfo[3].message,
                    type: errorInfo[3].type,
                    errorcode: "E03"
                };
            throw tokenException;
        }
        if(precision)
        {
            EQP.setPrecision(precision);
        }
        EQScanner.newExpression(tokens);
        try{
            result = EQTreeBuilder.process(EQScanner);
            if(!result)
            {
                return "";//Invalid Expression
            }
            //var finalval = result.value();
            //finalval.num = finalval.num.setScale(5,RoundingMode.HALF_DOWN());
            return  result.value();
        }
        catch(ex){
            throw ex;   //if there was an exception throw it for the GUI
        }
    };

    EQP.setPrecision = function(prec){
        EQTreeBuilder.setPrecision(prec);
    };

    EQP.getResult = function(){
        return result;
    };

    EQP.setVar = function(variable, value)
    {
        varMap[variable] = value;
    };

    EQP.getVar = function(variable)
    {
        return varMap[variable];
    };

    EQP.getUnitInfo = function(unit){
        return unitMap[unit];
    };


    return EQP;
}());


