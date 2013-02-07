/**
 * EQTreeBuilder - An Equation TreeBuilder for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global BigDecimal:false tablePlaceHolder:true RoundingMode:false*/



var EQTreeBuilder = (function() {
    "use strict";
    var EQB ={};        //the internal treebuilder object
    var myScan = {};    // the scanner
    var eqStack = [];   //the stack of equation tree objects
    var stack = [];     //the stack of tokens being processed
    var terms = [];     //the different tokentypes
    var table = [];     //the table describing the parsing technique
    var prods = [];     //a list of productions
    var prodsteps =[];  //a list of the next stages after a reduce
    var ctok;           //the current token
    var cstate;         //the current state of the system  
    var instr;          // the instruction for the next step in the table
    var root;           // the tree root
    var precision = 20;  // The decimal precision for division
    var errors = [];    //the error messages for different states
    var cline = null;
    //Eventually will load table from a file.  For now just defines it in code
    

    EQB.init = function(){
        loadConfigs();
    };

    EQB.process = function(scanner,currline){
        cline = currline;
        myScan = scanner;
        cstate = 0;
        stack = [];
        eqStack = [];
        var index = -1;
        stack.push("0");
        ctok = myScan.scanNext();
        while(true){

            //Get the index of token
            index = terms.indexOf(ctok.token);
            
            if(index === -1){
                var errormessage;
                if(ctok.token.charAt(ctok.token.length-1) === "("){
                    errormessage = {
                    message:"Function not found", 
                    type:"E"};
                    throw errormessage;  
                }
                else{
                    errormessage = {
                    message:"Unknown Token", 
                    type:"E"};
                    throw errormessage;  
                }
            }

            instr = table[cstate][index];

            if(typeof instr === "undefined"||instr.charAt(0)==="e"){
                var errorcode = (instr) ? instr : "e00";
                var errorinfo =errors[parseInt(errorcode.substring(1))];
                var calculationException ={
                    message: errorinfo.message,
                    type: errorinfo.type,
                    errorcode: errorcode
                };
                throw calculationException;
            }
            if(instr === ("acc")){
                //Valid equation completed
                root = balanceTree(eqStack.pop());
                return root;
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

    EQB.setPrecision = function(prec)
    {
        precision = prec;
    };

    function shifts(level,ref){
        //performs a shift operation and updates the state
        stack.push(ctok);
        stack.push(cstate+"");

        if(ref !== -1 && myScan.getRefData(ref).value !== null){
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
        handleEqStack(level);
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
        var column = terms.indexOf(cprod.result);
        cstate = table[cstate][column];
    }

    function balanceTree(node){
        //handle order of operations
        if(node.numChildren === 0){
            return node;
        }
        else if(node.type === "f"){
            var argnum = node.numChildren, iter;
            for(iter =0; iter<argnum; iter++){
                node.arglist[iter] = balanceTree(node.arglist[iter]);
            }
        }
        else if(node.numChildren === 1){
            var child = (node.child) ? node.child :node.arglist[0];
            if (node.child.priority < node.priority && node.priority !== 10) {
                //trying to get both !,% and functions working right.
                var newroot = node.child;
                var target = node.child.rchild;
                newroot.rchild = node;
                node.child = target;
                return newroot;
            }
            else {
                node.setChild(balanceTree(node.child));
            }
        }
        else{
            node.setChildren(balanceTree(node.lchild),balanceTree(node.rchild));
            var lchild = node.lchild;
            var rchild = node.rchild;
            if(lchild.priority <node.priority)
            {
                var newlchild = lchild.rchild;
                lchild.setChildren(lchild.lchild,node);
                node.lchild = newlchild;
                return lchild;
            }
            if(rchild.priority <node.priority)
            {
                var newrchild = rchild.rchild;
                rchild.setChildren(node,rchild.rchild);
                node.rchild = newrchild;
                return rchild;
            }
        }   
        return node;
    }

    function handleEqStack(productionNum){
        var lchild,rchild,child,binOpNode,func,opNode,arglist,
        variable;
        switch(productionNum){
            case "2":
                child = eqStack.pop();
                variable = eqStack.pop();
                variable.setValue(child.value());
                cline.setVar(variable.name,child.value());
                eqStack.push(variable);
                break;
            case "3":
                rchild = eqStack.pop();
                binOpNode = eqStack.pop();
                lchild = eqStack.pop();
                binOpNode.setChildren(lchild,rchild);
                eqStack.push(binOpNode);
            break;
            case "11":
                arglist = [];
                child = eqStack.pop();
                try{
                    while(child.type !== "f"){
                        arglist.push(child);
                        child = eqStack.pop();
                    }
                }
                catch(err){
                    var errormessage = {
                    message:"Function not found", 
                    type:"E"};
                    throw errormessage;       
                }
                func = child;
                func.setArgList(arglist);
                eqStack.push(func);
            break;
            case "9":
                opNode = eqStack.pop();
                child = eqStack.pop();
                opNode.setChild(child);
                eqStack.push(opNode);
            break;
            default:
                //Some Productions don't require action
        }
    }

    function createNode(ref){
        //Builds a treeNode object from a reference
        var refval = myScan.getRefData(ref);
        switch(refval.symbol){
            case "f":
                return (new FuncNode(refval));
            case "d":
                return (new DigitNode(refval));
            case "v":
                var varVal = cline.getVar(refval.text);
                return (new VarNode(refval,varVal));
            case "u":
                return (new UnOpNode(refval));
            case "n":
                var lastnum = eqStack.pop();
                lastnum.value().setUnits(refval.text);
                return lastnum;
            case "b":
                return (new BinOpNode(refval));
            default:


        }
        return "";
    }

    function  loadConfigs() {
        table = tablePlaceHolder.table;
        terms = tablePlaceHolder.terms;
        prods = tablePlaceHolder.productions;
        errors = tablePlaceHolder.errors;
    }

    //Node Constructors

    var FuncNode = function(ref){
        //Unary Function Node
        var that = this;
        this.type = "f";
        this.name = ref.text;
        this.numChildren = 0;
        var child1,child2;
        this.value = function(){
            switch(that.name) {
                case "sin(":
                    return new NumberValue(
                        Math.sin(that.arglist[0].value()) ,
                    that.arglist[0].units);
                case "cos(":
                    return new NumberValue(
                        Math.cos(that.arglist[0].value()) ,
                    that.arglist[0].units);
                case "tan(":
                    return new NumberValue(
                        Math.tan(that.arglist[0].value()) ,
                    that.arglist[0].units);
                case "(":
                    return that.arglist[0].value();
                case "max(": 
                    child1 =that.arglist[0].value();
                    child2 =that.arglist[1].value();
                    return(child1.compareTo(child2) > 0) ? child1 : child2;
                    
                case "min(": 
                    child1 =that.arglist[0].value();
                    child2 =that.arglist[1].value();
                    return(child1.compareTo(child2) < 0) ? child1 : child2;
                    
                case "perm(": 
                    var val = factorial(that.arglist[0].value()).divide(
                        factorial(that.arglist[0].value().subtract(
                        that.arglist[1].value())));
                    return val;
                
                case "comb(": 
                    var val = factorial(that.arglist[0].value()).divide(
                        factorial(that.arglist[1].value()).multiply(factorial(
                        that.arglist[0].value().subtract(that.arglist[1].value()))),
                        precision, RoundingMode.DOWN());
                    return val;

                case "ceil(":
                    var val = that.arglist[0].value().ceil();
                    return val;
                case "floor(":
                    var val = that.arglist[0].value().floor();
                    return val;
                default:
                    //Should throw error here:
                    return new NumberValue(0);
            }
        };
        this.priority = 10;
        this.toString = function(){
            return this.name + this.child.toString()+")";
        };
        this.arglist = null;
        this.setArgList = function(arglist){
            this.arglist = arglist;
            this.numChildren = arglist.length;
        };
    };

    var DigitNode = function(ref){
        //Digit Node
        this.type = "d";
        this.name = ref.value;
        this.numChildren = 0;
        var value = new NumberValue(this.name);
        //can make the value a constant since it won't change
        //this allows units to be set
        this.value = function(){
            return value;
        };
        this.priority = 100;
        this.toString = function(){
            return ref.value;
        };
        
    };

    var VarNode = function(ref,varVal){
        //Variable Node
        var varValue = varVal;
        this.type = "v";
        this.name =ref.text;
        this.numChildren = 0;
        this.value = function(){
            return varValue;
        };
        this.priority = 90;
        this.toString = function(){
            return ref.text;
        };
        this.setValue = function(value){
            varValue = value;
        };
        
    };

    var UnOpNode = function(ref){
        //Unary Operation Node
        this.type = "u";
        this.name = ref.text;
        this.numChildren = 1;
        this.value = function(){
            switch (this.name){
                case "!":
                    return factorial(this.child.value());
                case "%":
                    //Consider throwing an error if the child 
                    //is not a var or digit
                    var node = this.child.value().divide(new NumberValue("100"));
                    node.isPercentage = true;
                    return node;
                default:
                    //Add better error handling here
                    return null;

            }
            //Right now factorial is the only choice so we calculate that.  
            //Will add a switch statement later
        };
        this.priority = 6;
        this.toString = function(){
            return this.child.toString()+""+this.name;
        };
        this.child = null;
        this.setChild = function(cnode){
            this.child = cnode;
        };
    };
    
    var BinOpNode = function(ref){
        //Binary Operation Node
        var priority;
        this.name =ref.text;
        switch(this.name){
                case "+":
                    priority = 0;
                    break;
                case "-":
                    priority = 0;
                    break;
                case "*":
                    priority = 5;
                    break;
                case "/":
                    // do division after mult to avoid precision issues
                    priority = 5; 
                    break;
                default:
                    priority = 5;
            }


        this.type ="b";
        this.numChildren = 2;
        this.value = function(){
            switch(this.name){
                case "+":
                    var sum;
                    if(this.rchild.value().isPercentage)
                    {
                        sum =  this.lchild.value().add(
                            this.rchild.value().multiply(this.lchild.value()));
                    }
                    else
                    {
                        sum = this.lchild.value().add(this.rchild.value());
                    }
                    return sum;
                case "-":
                    var difference;
                    if(this.rchild.value().isPercentage)
                    {
                        difference =  this.lchild.value().subtract(
                            this.rchild.value().multiply(this.lchild.value()));
                    }
                    else
                    {
                        difference = this.lchild.value().subtract(
                            this.rchild.value());
                    }
                    return difference;
                case "*":
                    return this.lchild.value().multiply(this.rchild.value());
                case "/":
                    return this.lchild.value().divide(this.rchild.value(),
                        precision,RoundingMode.HALF_DOWN());
                case "^":
                    //There will  be some precision lost here.
                    //Not ideal.
                    return new this.lchild.value().pow(this.rchild.value());
            }
        };
        this.priority = priority;
        this.toString = function(){
            return this.lchild.toString() + this.name + this.rchild.toString();
        };
        this.lchild = null;
        this.rchild= null;
        this.setChildren = function(left,right){
            this.lchild = left;
            this.rchild = right;
        };
        
    };


    function factorial(val){
        //gets the factorial of a number
        var num = new NumberValue(1);
        for(var i=1; i<=val; i++)
        {
            num=num.multiply(new NumberValue(i));
        }
        return num;
    }



    return EQB;
}());
