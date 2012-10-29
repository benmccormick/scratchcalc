/**
 * EQScanner - An Equation Token Scanner for Javascript
 * 
 *
 * @author Ben McCormick
 **/

var EQScanner = (function() {
    var EQS ={};
    var tokens = [];
    var sym = [];
    var currenttok = "x";
    var currentref = null;
    var vars = {};

    // For now these are going to be in code.  Should be moved 
    // To a props file at some point
    var funcs, ops, bifuncs, puncs, unops;

    funcs = ["sqr(","sqrt(","log(","ln(","exp(","floor(","ceil(","neg(","rnd(",
            "sin(","cos(","tan(","asin(","acos(","atan(","abs(","("];
    ops = ["+","-","*","/","%","^","*","|","&"];
    bifuncs = ["min(","max(","perm(","comb("];
    puncs = [",",")","#"];
    unops = ["!"];

    var setReference = function(tok)
    {
        currentref = isInSym((tok+"").toLowerCase());
        var value = (currenttok === "d") ? BigDecimal(tok) : BigDecimal("0");
        if(currentref === null)
        {
            currentref = sym.length;
            sym.push({
                symbol:currenttok,
                text: (tok+"").toLowerCase(),
                value: value
            });
        }
    };

    var isInSym = function(tok)
    {
        /*Return the reference if the token is in the symbol table.
        returns null otherwise*/
        for (var i = sym.length - 1; i >= 0; i--) {
            if(sym[i].text === tok)
            {
                return i;
            }
        }
        return null;
    };

    EQS.newExpression = function(tokenarr){

        tokens = tokenarr.reverse();
    };

    EQS.scanNext = function(tokenarr){
        var tok = nextToken();
        if(!tok)
        {
            return null;
        }
        var numx = /^[\-+]?[0-9]*\.?[0-9]+$/;
        var varx = /^[A-Za-z]+[0-9]*$/;
        //Find the correct category for the current token
        currenttok =($.inArray(tok, funcs) !== -1)? "f" :
                    ($.inArray(tok,bifuncs) !== -1) ? "n" :
                    ($.inArray(tok,ops) !== -1) ? "b" :
                    ($.inArray(tok,unops) !== -1) ? "u" :
                    (numx.exec(tok)) ? "d" :
                    ($.inArray(tok,puncs) !== -1) ? tok :
                    (varx.exec(tok)) ? "v" : errorHandle(tok);

        if(currenttok.indexOf("Error:") === -1)
        {
            setReference(tok);
        }
        return currenttok;

    };

    var nextToken = function(){
        //if there are tokens, remove and return the next one
        return (tokens.length) ? tokens.pop() : null;   
    };

    var errorHandle = function(tok){
        return "Error: Invalid token - " +tok;
    }

    EQS.hasTokens = function(){

        return !tokens.length;
    };

    EQS.getRef = function(){

        return currentref;
    };

    EQS.getRefData = function(index){
        return sym[index];
    };

    EQS.getVar = function(varname){

        return vars[varname];
    };

    EQS.setVar = function(varname, val){
        vars[varname] = val;
    };
    return EQS;
}());

