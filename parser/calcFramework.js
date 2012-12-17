/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * 
 *
 * @author Ben McCormick
 **/

/*global BigDecimal:false tablePlaceHolder:true RoundingMode:false EQParser:false*/



var calcFramework = (function () {
    var line1 = new Line(1);
    var lines = [null,line1];
    var outputs = [0,0];
    var idx = 0; //for loops
    var cF = {};
    var MAXWIDTH = 5,MAXOUTWIDTH=25;

    EQParser.init();

    cF.getLine = function (index) {
        //returns the specified line
        return lines[index];
    };

    cF.addLine = function (index) {
        //adds a line to the calc
        var newLine = new Line(index);
        if (index === null || typeof index === "undefined" || 
            index >= lines.length) {
            lines.push(newLine);
        }
        else {
            lines.splice(index, 0, newLine);
            for (idx = index + 1; idx < lines.length; idx++) {
                lines[idx].linenum++;
            }
        }
    };

    cF.removeLine = function (index) {
        //Removes a line from the calc
        if (index <= lines.length) {
            lines.splice(index, 1);
            for (idx = index; idx < lines.length; idx++) {
                lines[idx].linenum--;
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
        return lines[linenum].length/MAXWIDTH|0;
    };

    cF.getNumLines = function(){
        //get the number of lines in the calculator
        return lines.length-1;
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

    //Create Line type
    function Line(linenum) {
        this.input = "";
        this.linenum = linenum;
    }

    Line.prototype.output = function () {
        try{
            try{
            this.addPreviousAnswerHandling();
            }
            catch(movecursor){
               throw movecursor; //try again with updated line
            }
            var out = EQParser.parse(this.input,10);
            outputs[this.linenum] = out;
            EQParser.setVar("line"+this.linenum,out);
            return  out.toString().chunk(MAXOUTWIDTH).join("<br>");
        }
        catch(ex){
            outputs[this.linenum] = new NumberValue(0);
            throw ex; //keep passing exceptions on
        }
    };
    
    Line.prototype.formatted = function () {
        //return the input string for now, add syntax highlighting/controls later
        var output = this.input.chunk(MAXWIDTH).join("<br>");
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
           this.input =  this.input.splice(0,0,"ans ");
           var exc ={
                type:"movecursor",
                xdistance:4,
                ydistance:0
           };
           throw exc;
        }
    };

    return cF;
}());