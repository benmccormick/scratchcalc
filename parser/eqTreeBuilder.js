/**
 * EQTreeBuilder - An Equation TreeBuilder for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global BigDecimal:false tablePlaceHolder:true */

var EQTreeBuilder = (function() {
    var EQB ={};      //the internal treebuilder object
    var myScan = {};  // the scanner
    var vars = [];  // the variables
    var eqStack = []; //the stack of equation tree objects
    var stack = []; //the stack of tokens being processed
    var terms = []; //the different tokentypes
    var table = []; //the table describing the parsing technique
    var prods = [];    //a list of productions
    var ctok;           //the current token
    var index = -1;
    var cstate = 0;  //the current state of the system  
    var instr;  // the instruction for the next step in the table
    var root;   // the tree root

    //Eventually will load table from a file.  For now just defines it in code
    

    EQB.init = function(scanner){
        myScan = scanner;
        loadConfigs();
    };

    EQB.process = function(){
        stack.push("0");
        ctok = myScan.scanNext();
        while(myScan.hasNext()){

            //Get the index of token
            index = terms.indexOf(ctok.token);
            
            if(index === -1){
                //unknown token
                //TODO: ADD better error handling here!
                return false;
            }

            instr = table[index][cstate];

            if(instr.equals("")){
                //invalid syntax
                //TODO: ADD better error handling here
                return false;
            }
            if(instr.equals("acc")){
                //Valid equation completed
                root = balanceTree(eqStack.pop);
                return true;
            }
            if(instr.charAt(0) === "s"){
                //We're doing a shift
                shifts(instr.substring(1));
            }
            else if(instr.charAt(0) === "r"){
                //we're doing a reduce
                reduce(instr.substring(1));
            }
            else
            {
                //Shouldn't hit this case
                //TODO: Add better error handling here!
                return false;
            }
        }
    };

    function shifts(level){

    }

    function reduce(level){
        
    }

    function balanceTree(treeroot){
        
    }

    function  loadConfigs() {
        table = tablePlaceHolder.table;
        terms = tablePlaceHolder.terms;
        prods = tablePlaceHolder.productions;
    }



    return EQB;
}());

