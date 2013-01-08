/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * Uses knockout.js bindings to connect data to GUI
 *
 * @author Ben McCormick
 **/

/*global ko:false EQParser:false markupGen:false*/


var calcFramework = (function () {
    "use strict";


    var MAXWIDTH = 5,MAXOUTWIDTH=25;

     //Create Line type
    var Line = function (linenum) {
        var self = this;
        self.input = ko.observable("");
        self.formattedInput = ko.computed({
            read:function(){
               return formatted(self.input());
            },
            write:function(){},
            owner:self
        });
        self.linenum = ko.observable(linenum);
        self.errormessage = ko.observable();
        
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
                return (Math.ceil(Math.max(self.input().length/MAXWIDTH,
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
            var out = EQParser.parse(input,10);
            cF.outputs.splice(self.linenum(),1,out);
            EQParser.setVar("line"+self.adjlinenum(),out);
            return  out.toString().chunk(MAXOUTWIDTH).join("<br>");
        }
        catch(ex){
            self.errormessage(formatErrorMessage(ex,self.adjlinenum()));
            return "";
        }
    }

    function formatted(input) {
        var output = input.chunk(MAXWIDTH).join("<br>");
        return markupGen.markup(output);
    }

    function formatErrorMessage(exception,linenum){
        //Maybe add something to differentiate between warnings and errors later
        var message;
        message = "Line #" + linenum+":"+exception.message;
        return message;
    }


    Line.prototype.addPreviousAnswerHandling = function (){
        var ans = (this.linenum > 1) ? 
            EQParser.getVar("line"+(this.linenum-1)) : 
            new NumberValue(0);
        EQParser.setVar("ans",ans);
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


    var line1 = new Line(0);
    var idx = 0; //for loops


    //start calcFramework definition
    var cF = {};
    cF.outputs = ko.observableArray();
    cF.outputs.push(0);
    cF.lines = ko.observableArray();
    cF.lines.push(line1);
    EQParser.init();
    cF.type = "Total";




    

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

    cF.setLineWidth = function(width){
        MAXWIDTH = width;
    };

    cF.setOutWidth = function(width){
        MAXOUTWIDTH = width;
    };

    cF.getLineWidth = function(){
        return MAXWIDTH;
    };
    cF.getLineHeight = function(linenum){
        return cF.lines()[linenum].length/MAXWIDTH|0;
    };

    cF.getNumLines = function(){
        //get the number of lines in the calculator
        return cF.lines().length;
    };

    cF.getAggregate = ko.computed({ 

        read:function(){
        var self = cF; // Probably should find a better way to do this.  bind?
        switch(self.type){
            case "Total":
                return getArrayTotal(self.outputs());
            case "Average":
                return getArrayTotal(self.outputs())/self.outputs().length;
            default:
                return 0;
        }},
        write: function(){},
        owner:this
    });

    return cF;
}());