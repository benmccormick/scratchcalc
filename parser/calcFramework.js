/**
 * calcFramework - An abstract representation of the scratch document as a whole
 * 
 *
 * @author Ben McCormick
 **/

/*global BigDecimal:false tablePlaceHolder:true RoundingMode:false EQParser:false*/



var calcFramework = (function () {
    var lines = [];
    var idx = 0; //for loops
    EQParser.init();
    var cF = {};

    cF.getLine = function (index) {
        //returns the specified line
        return lines[index];
    }


    cF.addLine = function (index) {
        //adds a line to the calc
        var newLine = new Line(index);
        if (index === null || typeof index === "undefined" ||index >= lines.length) {
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
        var newLine = new Line(index);
        if (index <= lines.length) {
            lines.splice(index, 1);
            for (idx = index; idx < lines.length; idx++) {
                lines[idx].linenum--;
            }

        }
    };


    //Create Line type
    var Line = function (linenum) {
        this.input = "";
        this.linenum = linenum;
    }

    Line.prototype.output = function () {
        return EQParser.parse(this.input);
    }
    Line.prototype.formatted = function () {
        //return the input string for now, add syntax highlighting/controls later
        return this.input;
    }



    return cF;
}());