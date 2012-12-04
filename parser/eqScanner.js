/**
 * EQScanner - An Equation Token Scanner for Javascript
 * 
 * @author Ben McCormick
 **/

 /*global BigDecimal:false $:true */

/*The Scanner module goes through the tokens, identifies them by their class
 *and saves a reference for future lookup */
var EQScanner = (function() {
    var EQS ={};            //the scanner object
    var tokens = [];        //holds the tokens being processed
    var sym = [];           //symbol table for saving references
    var currenttok = "x";   //current token being processed
    var currentref = null;  //reference to the current token
    var vars ={};          //a map of variables
    // For now these are going to be in code.  Should be moved 
    // To a props file at some point
    var funcs, ops, bifuncs, puncs, unops;

    funcs = ["sqr(","sqrt(","log(","ln(","exp(","floor(","ceil(","neg(","rnd(",
            "sin(","cos(","tan(","asin(","acos(","atan(","abs(","(","min(","max(","perm(","comb("];
    ops = ["+","-","*","/","^","|","&"];
    puncs = [",",")","#"];
    unops = ["!","%"];

    
    EQS.init = function(varMap){
        vars = varMap;
    };

    //Takes a new set of tokens to process
    EQS.newExpression = function(tokenarr){

        tokens = tokenarr.reverse();
    };

    //Scans the next token, adds it to the symbol table and returns a reference
    //if it is already in the symbol table, it returns the reference
    EQS.scanNext = function(){
        var tok = nextToken();
        if(!tok){
            return null;
        }
        var numx = /^[\-+]?[0-9]*\.?[0-9]+$/;
        var varx = /^[A-Za-z]+[0-9]*$/;
        //Find the correct category for the current token
        currenttok =($.inArray(tok, funcs) !== -1)? "f" :
                    ($.inArray(tok,ops) !== -1) ? "b" :
                    ($.inArray(tok,unops) !== -1) ? "u" :
                    (numx.exec(tok)) ? "d" :
                    ($.inArray(tok,puncs) !== -1) ? tok :
                    (varx.exec(tok)) ? "v" : errorHandle(tok);

        if(currenttok.indexOf("Error:") === -1){
            setReference(tok);
        }
        // Return the tokensymbol and a reference to it
        return {
            token:currenttok,
            ref: currentref
        };
    };

    //Gets the next token from the token array
    var nextToken = function(){
        //if there are tokens, remove and return the next one
        return (tokens.length) ? tokens.pop() : null;   
    };

    //Builds the error string
    var errorHandle = function(tok){
        return "Error: Invalid token - " +tok;
    };

    //Returns true if the scanner has tokens, false otherwise
    EQS.hasTokens = function(){
        return tokens.length;
    };

    //Gets token data from the reference
    EQS.getRefData = function(index){
        return sym[index];
    };

    //Gets a variables value
    EQS.getVar = function(varname){
        return vars[varname];
    };

    //Sets a variables value
    EQS.setVar = function(varname, val){
        vars[varname] = val;
    };

    //Sets the reference for a new token, using existing ref if possible
    function setReference(tok){
        var decimalValue;
        currentref = isInSym((tok+"").toLowerCase());
        var value = (currenttok === "d") ?  tok: 
            (puncs.indexOf(currenttok) > -1) ?  null : "0";

        if(currentref === null)
        {
            currentref = sym.length;
            sym.push({
                symbol:currenttok,
                text: (tok+"").toLowerCase(),
                value: value
            });
        }
    }

    //Check to see if a token is already in the symbol table
    function isInSym(tok){
        /*Return the reference if the token is in the symbol table.
        returns null otherwise*/
        for (var i = sym.length - 1; i >= 0; i--) {
            if(sym[i].text === tok)
            {
                return i;
            }
        }
        return null;
    }

    return EQS;
}());

