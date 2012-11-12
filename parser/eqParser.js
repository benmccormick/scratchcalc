/**
 * EQParser - An Equation Parser for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global EQScanner:false EQTreeBuilder:false EQTokenizer:false EQParser:true*/

var EQParser = (function(){
    var EQP ={};
    var varMap = {
        "pi":new BigDecimal("3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679")
    };
    var result;
    EQP.init = function(){
        EQTokenizer.init(varMap);
        EQTreeBuilder.init();
        EQScanner.init(varMap);
    };

    EQP.parse = function(expression,precision){
        var tokens = EQTokenizer.tokenize("#"+expression+"#");
        if(!tokens) //Invalid Token
        {
            return "#Invalid Token#";
        }
        if(precision)
        {
            EQP.setPrecision(precision);
        }
        EQScanner.newExpression(tokens);
        result = EQTreeBuilder.process(EQScanner);
        if(!result)
        {
            return "";//Invalid Expression
        }
        return  result.value().toString();
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


    return EQP;
}());


