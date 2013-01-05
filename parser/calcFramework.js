/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * 
 *
 * @author Ben McCormick
 **/

/*global ko:false EQParser:false*/



var calcFramework = (function () {


     //Create Line type
    var Line = function (linenum) {
        var self = this;
        self.input = ko.observable("");
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
            self.errormessage("");
            var out = EQParser.parse(input,10);
            outputs[self.linenum()] = out;
            EQParser.setVar("line"+self.adjlinenum(),out);
            return  out.toString().chunk(MAXOUTWIDTH).join("<br>");
        }
        catch(ex){
            self.errormessage(ex.message);
            return "";
        }
    }

    Line.prototype.formatted = function () {
        //return the input string for now, add syntax highlighting/controls later
        var output = this.input().chunk(MAXWIDTH).join("<br>");
        return markupGen.markup(output);
    };


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
    var outputs = [0,0];
    var idx = 0; //for loops
    var cF = {};
    var MAXWIDTH = 5,MAXOUTWIDTH=25;
    cF.lines = ko.observableArray();
    cF.lines.push(line1);
    EQParser.init();

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
            for (idx = index; idx < cF.lines.length; idx++) {
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

    cF.getAggregate = function(type){
        switch(type){
            case "Total":
                return getArrayTotal(outputs)
            case "Average":
                return getArrayTotal(outputs)/outputs.length;
            default:
                return 0;
        }
    };

    return cF;
}());