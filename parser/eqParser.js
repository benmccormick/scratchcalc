/**
 * EQParser - An Equation Parser for Javascript
 * 
 *
 * @author Ben McCormick
 **/

var EQParser = (function(){
    var EQP ={};
    var result;
    EQP.init = function(){
        EQTreeBuilder.init();
    }

    EQP.parse = function(expression){
        var tokens = EQTokenizer.tokenize("#"+expression+"#");
        EQScanner.newExpression(tokens);
        result = EQTreeBuilder.process(EQScanner);
        return result;
    };

    EQP.getResult = function(){
        return result;
    }
    return EQP;
}());


