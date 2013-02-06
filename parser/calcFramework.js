/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * Uses knockout.js bindings to connect data to GUI
 *
 * @author Ben McCormick
 **/

/*global ko:false EQParser:false markupGen:false $:false*/


var calcFramework = (function () {
    "use strict";

    //start calcFramework definition
    var cF = {};
    cF.outputs = ko.observableArray();
    cF.outputs.push(0);
    cF.varMap = {};
    EQParser.init();
    cF.type = "Total";
    cF.lineWidth = ko.observable(50); 
    cF.outWidth = ko.observable(25);
    

     //Create Line type
    var Line = function (linenum,currline) {
        var self = this;
        self.varMap = {};
        self.input = ko.observable("");
        self.formattedInput = ko.computed({
            read:function(){
               return formatted(self);
            },
            write:function(){},
            owner:self
        });
        self.linenum = ko.observable(linenum);
        self.errormessage = ko.observable();
        //set currentline, if not specified make it false
        self.isCurrentLine = ko.observable(currline || false);
        self.adjlinenum = ko.computed({
            read:function(){
                return self.linenum()+1;
        } ,
            write:function(){},
            owner:self
        });
        self.lnOutput = ko.computed({
            read:function(){
               return outputFunction(self,self.input());
            },
            write:function(){},
            owner:self
        });
        self.lineheight = ko.computed({
            read:function(){
                //get integer output for max height
                return (Math.ceil(Math.max(self.input().length/cF.lineWidth(),
                    self.lnOutput().split("<br>").length))|0)*25+""; 
        } ,
            write:function(){},
            owner:self
        });
    };

    function  outputFunction(self,input) {
            try{
            self.addPreviousAnswerHandling();
            }
            catch(movecursor){
                return "movecursor";
               //throw movecursor; //try again with updated line
            }
        try{
            self.errormessage(null);
            var out = EQParser.parse(input,10,self);
            cF.outputs.splice(self.linenum(),1,out);
            cF.varMap["line"+self.adjlinenum()] = out;
            return  out.toString().chunk(cF.outWidth()).join("<br>");
        }
        catch(ex){
            cF.outputs.splice(self.linenum(),1,0);
            self.errormessage(formatErrorMessage(ex,self.adjlinenum()));
            return "";
        }
    }

    function formatted(line) {
        var getVar = line.getVar.bind(line);
        var output = line.input().chunk(cF.lineWidth()).join("<br>");
        return markupGen.markup(output,getVar);
    }

    function formatErrorMessage(exception,linenum){
        //Maybe add something to differentiate between warnings and errors later
        var message;
        message = "Line #" + linenum+":"+exception.message;
        return message;
    }


    Line.prototype.addPreviousAnswerHandling = function (){
        var ans = (this.linenum > 1) ? 
            cF.varMap["line"+(this.linenum-1)] : 
            new NumberValue(0);
        this.varMap["ans"] = ans;
        var opers = /^\s*[\+\-\*\/!%\^&|]/;
        var isoperator = opers.exec(this.input);
        if(isoperator && this.input.length && this.linenum > 1){
           this.input(this.input().splice(0,0,"ans "));
           var exc ={
                type:"movecursor",
                xdistance:4,
                ydistance:0
           };
           throw exc;
        }
    };

    Line.prototype.getVar = function (varName, notCurrentLine) {
        if(typeof varName === "undefined"){
            return null;
        }
        //Actually don't want ones set in the current varMap, only past lines
        if(varName in this.varMap && notCurrentLine){
            return this.varMap[varName];
        }
        
        if (this.linenum() > 0) {
            var nextLine = cF.lines()[this.linenum() - 1];
            if(!nextLine){
                return null;
            }
            return nextLine.getVar(varName,true);
        } else {
            //eventually go to global
            return cF.varMap[varName];
        }
    };

    Line.prototype.setVar = function(varName,value){
        this.varMap[varName] = value;
    };

    var line1 = new Line(0,true);
    var idx = 0; //for loops


    
    cF.lines = ko.observableArray();
    cF.lines.push(line1);
    cF.currentLine =cF.lines()[0];


    

    cF.getLine = function (index) {
        //returns the specified line
        return cF.lines()[index];
    };

    cF.addLine = function (index) {
        //adds a line to the calc
        var newLine = new Line(index);
        if (index === null || typeof index === "undefined" || 
            index >= cF.lines().length) {
            cF.lines.push(newLine);
        }
        else {
            cF.lines.splice(index, 0, newLine);
            var linenum;
            for (idx = index+1; idx < cF.lines().length; idx++) {
               linenum= cF.lines()[idx].linenum;
               linenum(linenum()+1); //linenum++ with observable
            }
        }
    };

    cF.removeLine = function (index) {
        //Removes a line from the calc
        if (index <= cF.lines().length) {
            cF.lines.splice(index, 1);
            var linenum;
            for (idx = index; idx < cF.lines().length; idx++) {
               linenum= cF.lines()[idx].linenum;
               linenum(linenum()-1); //linenum-- with observable
            }
        }
    };

    cF.appendNextLine = function (index){
        //Adds the next line into the current 1 and deletes the next line
        var line1 = cF.lines()[index];
        var line2 = cF.lines()[index+1];
        line1.input(line1.input()+line2.input());
        cF.removeLine(index+1);
    };

    cF.setLineWidth = function(width){
        cF.lineWidth(width);
    };

    cF.setOutWidth = function(width){
        cF.outWidth(width);
    };

    cF.getLineWidth = function(){
        return cF.lineWidth();
    };
    cF.getLineHeight = function(linenum){
        return cF.lines()[linenum].length/cF.lineWidth()|0;
    };

    cF.getNumLines = function(){
        //get the number of lines in the calculator
        return cF.lines().length;
    };

    cF.setCurrentLine = function(newCurrentLine){
        cF.currentLine.isCurrentLine(false);
        cF.currentLine=cF.lines()[newCurrentLine];
        cF.currentLine.isCurrentLine(true);
    };

    cF.saveToStorage = function(){
        var i =0, n=cF.getNumLines();
        var inputArray=[];
        for(i;i<n; i++){
            inputArray.push(cF.lines()[i].input());
        }
        var inputsString = JSON.stringify(inputArray);
        localStorage["calcInputs"] = inputsString;
    };

    cF.restoreFromStorage = function(){
        var storageString = localStorage["calcInputs"];
        if(!storageString){
            return;
        }
        var storageObj = JSON.parse(storageString);

        var i=0, n=cF.getNumLines(),m=storageObj.length;

        //go over existing lines first
        for(i; i<n; i++){
            cF.lines()[i].input(storageObj[i]);
        }
        //and then add new lines if necessary
        for(i; i<m; i++){
            cF.addLine (i);
            cF.lines()[i].input(storageObj[i]);
        }

    };

    cF.getAggregate = ko.computed({ 

        read:function(){
            switch(cF.type){
                case "Total":
                    return getArrayTotal(cF.outputs());
                case "Average":
                    return getArrayTotal(cF.outputs())/cF.outputs().length;
                default:
                    return 0;
            }},
        write: function(){},
        owner:this
    });

     // Animation callbacks for the planets list
    cF.showLine = function(element) { 
        $(element).filter("div").slideDown();
    };

    cF.hideLine = function(element) { 
        $(element).filter("div").slideUp();
    };

    return cF;
}());