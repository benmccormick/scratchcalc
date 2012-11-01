/**
 * EQTreeBuilder - An Equation TreeBuilder for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global BigDecimal:false tablePlaceHolder:true */

var EQTreeBuilder = (function() {
    var EQB ={};        //the internal treebuilder object
    var myScan = {};    // the scanner
    var vars = [];      // the variables
    var eqStack = [];   //the stack of equation tree objects
    var stack = [];     //the stack of tokens being processed
    var terms = [];     //the different tokentypes
    var table = [];     //the table describing the parsing technique
    var prods = [];     //a list of productions
    var prodsteps =[];  //a list of the next stages after a reduce
    var steps = []      //the steps we go through (FOR DEBUG)
    var ctok;           //the current token
    var cstate;         //the current state of the system  
    var instr;          // the instruction for the next step in the table
    var root;           // the tree root

    //Eventually will load table from a file.  For now just defines it in code
    

    EQB.init = function(){
        loadConfigs();
    };

    EQB.process = function(scanner){
        myScan = scanner;
        cstate = 0;
        steps = [];
        stack = [];
        eqStack = [];
        var index = -1;
        stack.push("0");
        ctok = myScan.scanNext();
        while(true){

            //Get the index of token
            index = terms.indexOf(ctok.token);
            
            if(index === -1){
                //unknown token
                //TODO: ADD better error handling here!
                return false;
            }

            instr = table[cstate][index];

            if(instr === ("")){
                //invalid syntax
                //TODO: ADD better error handling here
                return false;
            }
            if(instr === ("acc")){
                //Valid equation completed
                root = balanceTree(eqStack.pop);
                return true;
            }
            if(instr.charAt(0) === "s"){
                //We"re doing a shift
                shifts(instr.substring(1),ctok.ref);
            }
            else if(instr.charAt(0) === "r"){
                //we"re doing a reduce
                reduce(instr.substring(1));
            }
            else
            {
                //Shouldn"t hit this case
                //TODO: Add better error handling here!
                return false;
            }
        }
    };

    function shifts(level,ref){
        //performs a shift operation and updates the state
        stack.push(ctok);
        stack.push(cstate+"");

        if(ref != -1 && myScan.getRefData(ref).value != null){
            eqStack.push(createNode(ref));
        }
        cstate = instr.substring(1);
        ctok = myScan.scanNext();
        if(ctok === null)
        {
            ctok = {token:"$"};
        }
    }

    function reduce(level){
        //performs a reduce operation and updates the state
        var cprod = prods[level];
        handleEqStack(cprod);
        var start = stack.length-1;
        var finish = stack.length- (2 * cprod.components.length);
        var idx;
        for (idx = start; idx >=finish; idx--){
            if(idx === finish + 1){
                cstate = stack[idx];
            }
            stack.pop();
        }
        stack.push(cprod.result);
        stack.push(cstate);
            /*if(terms[idx] === (cprod.result)){
                steps.push(cprod.text);
                cstate=table[idx][cstate];
                break;
            }*/
        
        cstate = prodsteps[cstate];
    }

    function balanceTree(treeroot){
        return treeroot;
    }

    function handleEqStack(ref){
        return "";
    }

    function createNode(ref){
        return "";
    }

    function  loadConfigs() {
        table = tablePlaceHolder.table;
        terms = tablePlaceHolder.terms;
        prods = tablePlaceHolder.productions;
        prodsteps = tablePlaceHolder.prodstep;
    }


    //Node Constructors

    var FuncNode = function(ref){
        var that = this;
        this.type = "f";
        this.name = ref.text;
        this.numChildren = 1;
        this.value = function(){
            switch(that.name) {
                case "sin(":
                    return BigDecimal(Math.sin(that.child.value()));
                case "cos(":
                    return BigDecimal(Math.cos(that.child.value()));
            default:
                return Math.sin(that.child.value());
            }
        };
        this.priority = 10;
        this.toString = function(){
            return this.name + this.child.toString();
        };
        this.child = null;
        this.setChild = function(child){
            this.child = child;
        };

    };

    var DigitNode = function(ref){
        this.type = "d";
        this.name = ref.value;
        this.numChildren = 0;
        this.value = function(){
            return BigDecimal(this.name);
        };
        this.priority = 100;
        this.toString = function(){
            return ref.value;
        };
        
    };

    var VarNode = function(ref){
        this.type = "v";
        this.name;
        this.numChildren;
        this.value
        this.priority;
        this.toString;
        
    };

    var UnOpNode = function(ref){
        this.type;
        this.name;
        this.numChildren;
        this.value
        this.priority;
        this.toString;
        
    };

    var BiFuncNode = function(ref){
        this.type;
        this.name;
        this.numChildren;
        this.value
        this.priority;
        this.toString;
        
    };

    var BinOpNode = function(ref){
        this.type;
        this.name;
        this.numChildren;
        this.value
        this.priority;
        this.toString;
        
    };






    return EQB;
}());

