/**
 * EQParser - An Equation Parser for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global EQScanner:false EQTreeBuilder:false EQTokenizer:false EQParser:true*/

var EQParser = (function(){
    var EQP ={};
    var varMap = {};
    var result;
    EQP.init = function(){
        EQTokenizer.init(varMap);
        EQTreeBuilder.init();
        EQScanner.init(varMap);
    };

    EQP.parse = function(expression){
        var tokens = EQTokenizer.tokenize("#"+expression+"#");
        if(!tokens) //Invalid Token
        {
            return "#Invalid Token#";
        }
        EQScanner.newExpression(tokens);
        result = EQTreeBuilder.process(EQScanner);
        if(!result)
        {
            return "";//Invalid Expression
        }
        return result.value().toString();
    };

    EQP.getResult = function(){
        return result;
    };
    return EQP;
}());


