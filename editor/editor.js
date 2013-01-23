/**
* Editor Class: Contains the code for defining a custom text editor
* and calculator hybrid.  
**/


/*jshint jquery:true browser:true*/
/*global calcFramework:false ko:false */



(function(){
    "use strict";
    var LINEWIDTH = 50;

    var FONTWIDTH = 11;
    var LINEHEIGHT = 25;
    var LINESCHANGED = false;
    var currentline = 0;
    var currentindex = 0;
    var highlightData = [];
    calcFramework.setLineWidth(LINEWIDTH);
    calcFramework.restoreFromStorage();
    //set up Knockout bindings
    ko.applyBindings(calcFramework);
    moveCursor(0,0);

    
    function fitToWindow(){
        var outwidth;
        LINEWIDTH = Math.floor($("#in").width()/FONTWIDTH);
        outwidth = Math.floor($("#out").width()/FONTWIDTH);

        calcFramework.setLineWidth(LINEWIDTH);
        calcFramework.setOutWidth(outwidth);
        moveCursor(currentline,currentindex);
    }

    //set up resizing page elements when the window size changes and do it on load
    $(window).resize(fitToWindow);
    fitToWindow();

    //Sync Scrolling
    $("#in").on("scroll", function () {
        $("#out").scrollTop($(this).scrollTop());
        $("#nums").scrollTop($(this).scrollTop());
    });


    // Prevent the backspace key from navigating back.

    var keys = [];
    window.addEventListener("keydown",
        function(e){
            keys[e.keyCode] = true;
            switch(e.keyCode){
                case 37: case 39: case 38:  case 40: // Arrow keys
                case 32: e.preventDefault(); break; // Space
                default: break; // do not block other keys
            }
        },false);

    window.addEventListener("keyup",
        function(e){
            keys[e.keyCode] = false;
        },
    false);

    $(document).unbind("keydown").bind("keydown", function (event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === "INPUT" && 
                (d.type.toUpperCase() === "TEXT" || 
                 d.type.toUpperCase() === "PASSWORD")) || 
                 d.tagName.toUpperCase() === "TEXTAREA") {
                
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        if (doPrevent) {
            event.preventDefault();
        }
    });


    var offset = $("#in").offset();
    $(".cursor").offset(offset);

    $("#in").on("mouseup",".inln",function(e){
        var loc = getMouseLoc(e);
        highlightData[2] = loc.line;
        highlightData[3] = loc.position;
        adjustHighlightIndices();

        moveCursor(highlightData[2], highlightData[3]);
    });

    $("#in").on("mousedown", ".inln", function (e) {
        var loc = getMouseLoc(e);
        highlightData[0] = loc.line;
        highlightData[1] = loc.position;
    });

    function getMouseLoc(e) {
        var newline = $(e.currentTarget).data("line");
        var lineoffset = $(e.currentTarget).offset();
        var linelength = getLineLength(newline);
        var xpos = e.pageX;
        var ypos = e.pageY;
        var xdiff = xpos - offset.left;
        var ydiff = ypos - lineoffset.top;
        var column = xdiff / FONTWIDTH +
            Math.floor(ydiff / LINEHEIGHT) * LINEWIDTH;
        var pos = Math.min(linelength, column);
        return {
            line: newline,
            position: pos
        };
    }

    function adjustHighlightIndices() {
        var bigStart = isHighlightStartGreater();
        var endhalfway = highlightData[3] % 1 < .5;
        //highlightData[1] = (bigStart && starthalfway) ? Math.ceil(highlightData[1]) : Math.floor(highlightData[1]);
        //at least in Chrome, Highlighting always floors on the start
        highlightData[1] = Math.floor(highlightData[1]);
        highlightData[3] = (bigStart || endhalfway) ? Math.floor(highlightData[3]) : Math.ceil(highlightData[3]);
    }


    $(document).keydown(function(e){
        var cline =  calcFramework.getLine(currentline);
        var input = cline.input();
        var prevline,remains,prevlength,moveLine;
        var registered = true;
        switch(e.keyCode){

            case 8: //backspace
            if (isHighlighted()) {
                removeHighlightedSection();
                break;
            }
            if(currentindex > 0){
                cline.input(input.splice(currentindex-1,1));
                moveCursor(currentline,currentindex-1);
            }
            else if(currentline > 0){
                    prevline = calcFramework.getLine(currentline-1);
                    prevlength = prevline.input().length;
                    prevline.input(prevline.input()+cline.input());
                    removeLine(currentline);
                    moveCursor(currentline-1,prevlength);
            }
            LINESCHANGED = true;
            break;
            case 13:  //enter

                if (isHighlighted()) {
                    removeHighlightedSection();
                    cline = calcFramework.getLine(currentline);
                    input = cline.input();
                }
                remains = input.substring(currentindex);
                cline.input(input.substring(0,currentindex));
                addLine(currentline+1);
                cline = calcFramework.getLine(currentline+1);
                cline.input(remains);
                moveCursor(currentline+1,0);
                LINESCHANGED = true;
                break;
            case 32:  //space
                cline.input (input.splice(currentindex,0," "));
                moveCursor(currentline, currentindex + 1);
                break;
           case 35: //end
                e.preventDefault();
                moveLine = (e.ctrlKey) ? calcFramework.getNumLines() : currentline;
                moveCursor(moveLine, 
                    calcFramework.getLine(moveLine).input().length);
                break;
           case 36: //home
                e.preventDefault();
                moveLine = (e.ctrlKey) ? 1 : currentline;
                moveCursor(moveLine, 0);
                break;
            case 37: //left arrow
                if(currentindex === 0){
                    if(currentline > 0){
                        moveCursor(currentline-1); //move to end of previous line
                    }
                }
                else {
                    moveCursor(currentline,currentindex-1);  
                }
                break;
            case 38: //up arrow
                if(currentline > 0) {
                    moveCursor(currentline -1, currentindex);
                }
                break;
            case 39: //right arrow
                if (currentindex === getLineLength(currentline)) {
                    if(!isLastLine){
                        moveCursor(currentline+1,0);
                    }
                }
                else
                {
                    moveCursor(currentline,currentindex+1);
                }
                break;
            case 40: //down arrow
                if(!isLastLine(currentline)){
                    moveCursor(currentline+1,currentindex);
                }
                break;
                case 46: //delete
                    if (isHighlighted()) {
                        removeHighlightedSection();
                        break;
                    }
                if (currentindex === getLineLength(currentline)) {
                    if(!isLastLine(currentline)){
                        calcFramework.appendNextLine(currentline);
                    }
                }else{

                    cline.input(cline.input().splice(currentindex,1));
                }
                break;
            default:
             registered = false;
        }
        if(registered){
            removeHighlight();
        }
        setTimeout(0,calcFramework.saveToStorage());
    });

    $(document).keypress(function(e){
        if(e.keyCode === 13){
            return;
        }
        var cline =  calcFramework.getLine(currentline);
        var input = cline.input();
        var keyVal = String.fromCharCode(e.keyCode);
        if(!e.shiftKey)
        {
            keyVal = keyVal.toLowerCase();
        }
        cline.input(input.splice(currentindex,0,keyVal));
        moveCursor(currentline,currentindex+1);
        LINESCHANGED = true;
        setTimeout(0,calcFramework.saveToStorage());
    });


    function getLineLength(index){
        //get the length of a given line
        var line =  calcFramework.getLine(index);    
        return line.input().length;
    }

    function isLastLine(linenum){
        //obviously this will change
        return (linenum === calcFramework.getNumLines()-1);
    }

    function getLineDiv(linenum){
       return $(".inln").filter( function() { 
            return this.getAttribute("data-line") === linenum+""; 
        });
    }

    function getOutLineDiv(linenum){
       return $(".outln").filter( function() { 
           return this.getAttribute("data-line") === linenum+"";
        });
    }

    function getLineNumDiv(linenum){
       return $(".linenum").filter( function() { 
           return this.getAttribute("data-line") === linenum+"";
        });
    }

    function removeLine(line){
        calcFramework.removeLine(line);
    }


    function addLine(line){
        // Add a new line to the editor
        calcFramework.addLine(line);
    }
    
    function isHighlighted() {
        return highlightData.length > 0 &&
            !(highlightData[0] === highlightData[2] &&
            highlightData[1] === highlightData[3]);
    }

    function removeHighlight() {
        highlightData = [];
        window.getSelection().collapse();

    }

    function removeHighlightedSection(replacement) {
        if (!replacement) {
            replacement = "";
        }
        var startGreater = isHighlightStartGreater();

        var lastline = startGreater ? highlightData[0]: highlightData[2];
        var lastindex = startGreater ? highlightData[1]: highlightData[3];
        var firstline = startGreater ? highlightData[2]: highlightData[0];
        var firstindex = startGreater ? highlightData[3]: highlightData[1];
        
        
        if (lastline > firstline) {
            var lastremainder = calcFramework.getLine(lastline).input().substring(lastindex);
            var firstremainder = calcFramework.getLine(firstline).input().substring(0,firstindex);
            for (var i = lastline; i > firstline; i--) {
                removeLine(i);
            }
            calcFramework.getLine(firstline).input(firstremainder +replacement+ lastremainder);
        }
        else {
            var line = calcFramework.getLine(lastline);
            var input = line.input();
            line.input(input.substring(0, firstindex) + replacement+ input.substring(lastindex));
        }
        moveCursor(firstline, firstindex + replacement.length);
        removeHighlight();
    }

    // Returns whether the starting point was after the end point for the current highlight
    function isHighlightStartGreater() {
        return (highlightData[0] > highlightData[2]) ||
            ((highlightData[0] === highlightData[2]) &&
            (highlightData[1] > highlightData[3]));
        
    }

    function moveCursor(line, index){
        //Move the cursor to the specified line and index, and update
        //the line and index variables.  if index is undefined, move to end 
        //of the line
        var numlines = calcFramework.getNumLines();
        if(line > numlines){
            line = numlines;
            index = null;  //we'll go to the end of the last line
        }
        var lineLength =getLineLength(line);
        if (index === null || typeof index === "undefined" || 
            index > lineLength) {
            //If the index is undefined or longer than line, make line length
            index = lineLength;
        }

        //update current line classes
        if(line !== currentline) {
            getLineDiv(currentline).removeClass("currentline");
            getLineNumDiv(currentline).removeClass("currentnum");
            getOutLineDiv(currentline).removeClass("currentout");
            getLineDiv(line).addClass("currentline");
            getLineNumDiv(line).addClass("currentnum");
            getOutLineDiv(line).addClass("currentout");
        }
        currentline = line;
        currentindex = index;
        calcFramework.setCurrentLine(line);
        //if the line has to be folded, which fold is the cursor on
        var foldnum = Math.floor( index / calcFramework.getLineWidth() );

        var perceivedIndex = index % calcFramework.getLineWidth();

        var lineOffset = getLineDiv(line).offset();
        var cursorOffset = {
            top:lineOffset.top + LINEHEIGHT * foldnum,
            left:lineOffset.left + (FONTWIDTH * perceivedIndex)
        };    

        var inputBottom =$("#in").offset().top+$("#in").height();
        var inputTop =$("#in").offset().top;
        var extralength =1;
        
        //if we're out of the box, scroll to where we are and try again
        if(cursorOffset.top >= inputBottom) {
            extralength = cursorOffset.top - inputBottom;
            $("#in").scrollTop($("#in").scrollTop()+extralength+LINEHEIGHT);
            moveCursor(line,index);
            return;
        }

        if(cursorOffset.top < inputTop){
            extralength = inputTop-cursorOffset.top ;
            $("#in").scrollTop($("#in").scrollTop()-extralength-LINEHEIGHT);
            moveCursor(line,index);
            return;
        }

        $(".cursor").offset(cursorOffset);
    }

}());


