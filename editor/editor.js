/**
* Editor Class: Contains the code for defining a custom text editor
* and calculator hybrid.  
**/


/*jshint jquery:true*/
/*global calcFramework:false */



(function(){

    var FONTWIDTH = 11;
    var LINEHEIGHT = 25;
    var LINEWIDTH = 50;
    var ERRORLIST = [];
    var UPDATEERRORS = false;
    var LINESCHANGED = false;
    var BOXTOP = $(".in").offset().top;
    var BOXHEIGHT = $(".in").height();
    var CONTENTHEIGHT = LINEHEIGHT;
    calcFramework.setLineWidth(LINEWIDTH);

    //Sync Scrolling
    $(".in").on("scroll", function () {
        $(".out").scrollTop($(this).scrollTop());
        $(".nums").scrollTop($(this).scrollTop());
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


    var offset = $(".in").offset();
    var currentline = 1;
    var currentindex=0;
    $(".cursor").offset(offset);

    $(".in").on("click",".inln",function(e){
        var newline = $(e.currentTarget).data("line");
        var linelength = getLineLength(newline);
        var xpos = e.pageX;
        var diff = xpos-offset.left;
        var pos = Math.min(linelength, Math.floor(diff/FONTWIDTH));
        moveCursor(newline,pos);
    });

    $(document).keydown(function(e){
        var linediv =  getLineDiv(currentline);
        var cline =  calcFramework.getLine(currentline);
        var input = cline.input;
        var prevline,remains,prevlength,moveLine;
        switch(e.keyCode){
        case 8: //backspace
            if(currentindex > 0){
                cline.input = input.splice(currentindex-1,1);
                linediv.html(cline.formatted());
                moveCursor(currentline,currentindex-1);
            }
            else if(currentline > 1){
                    prevline = calcFramework.getLine(currentline-1);
                    prevlength = prevline.input.length;
                    prevline.input += cline.input;
                    getLineDiv(currentline-1).html(prevline.formatted());
                    removeLine(currentline);
                    moveCursor(currentline-1,prevlength);
            }
            updateOut(currentline);
            LINESCHANGED = true;
            break;
        case 13:  //enter
            remains = input.substring(currentindex);
            cline.input = input.substring(0,currentindex);
            linediv.html(cline.formatted());
            addLine(currentline+1);
            cline = calcFramework.getLine(currentline+1);
            cline.input = remains;
            getLineDiv(currentline+1).html(cline.formatted());
            moveCursor(currentline+1,0);
            updateOut(currentline-1);
            updateOut(currentline);
            LINESCHANGED = true;
            break;
        case 32:  //space
            cline.input = input.splice(currentindex,0," ");
            linediv.html(cline.formatted());
            moveCursor(currentline, currentindex + 1);
            break;
       case 35: //end
            moveLine = (e.ctrlKey) ? calcFramework.getNumLines() : currentline;
            moveCursor(moveLine, calcFramework.getLine(moveLine).input.length);
            break;
       case 36: //home
            moveLine = (e.ctrlKey) ? 1 : currentline;
            moveCursor(moveLine, 0);
            break;
        case 37: //left arrow
            if(currentindex === 0){
                if(currentline > 1){
                    moveCursor(currentline-1); //move to end of previous line
                }
            }
            else {
                moveCursor(currentline,currentindex-1);  
            }
            break;
        case 38: //up arrow
            if(currentline > 1) {
                moveCursor(currentline -1, currentindex);
            }
            break;
        case 39: //right arrow
            if(currentindex === getLineLength(currentline)){
                moveCursor(currentline+1,0);
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
            cline.input = input.splice(currentindex,1);
            linediv.html(cline.formatted());
            break;
        default:
             
        }
        cleanUpMessages();
    });

    $(document).keypress(function(e){
        if(e.keyCode === 13){
            return;
        }
        var cline =  calcFramework.getLine(currentline);
        var input = cline.input;
        var keyVal = String.fromCharCode(e.keyCode);
        if(!e.shiftKey)
        {
            keyVal = keyVal.toLowerCase();
        }
        cline.input = input.splice(currentindex,0,keyVal);
        updateLineDisplay(cline);
        moveCursor(currentline,currentindex+1);
        LINESCHANGED = true;
        cleanUpMessages();
    });

    function updateLineDisplay(cline){

        var linediv =  getLineDiv(currentline);
        linediv.html(cline.formatted());
        updateOut(currentline);
    }

    function getLineLength(index){
        //get the length of a given line
        var line =  calcFramework.getLine(index);    
        return line.input.length;
    }

    function isLastLine(linenum){
        //obviously this will change
        return (linenum === calcFramework.getNumLines());
    }

    function getLineDiv(linenum){
       return $(".inln").filter( function() { 
            return $(this).data("line") === linenum; 
        });
    }

    function getOutLineDiv(linenum){
       return $(".outln").filter( function() { 
            return $(this).data("line") === linenum; 
        });
    }

    function getLineNumDiv(linenum){
       return $(".linenum").filter( function() { 
            return $(this).data("line") === linenum; 
        });
    }

    function removeLine(line){
        // Remove a line from the editor
        var lineDiv = getLineDiv(line);
        var outlineDiv = getOutLineDiv(line);
        var linenumDiv = getLineNumDiv(line);
        lineDiv.remove();
        outlineDiv.remove();
        linenumDiv.remove();
        for(var idx = line+1;  idx<=calcFramework.getNumLines(); idx++ ){
            getLineDiv(idx).data("line",(idx-1));
            getOutLineDiv(idx).data("line",(idx-1));
            getLineNumDiv(idx).data("line",(idx-1)).html(idx-1);
        }
        calcFramework.removeLine(line);
    }

    function lineupLines(){
        var lineDiv,outlineDiv,outOffset,
            inOffset,topheight,lineNumDiv,numOffset;
        for( var idx = 1; idx<=calcFramework.getNumLines(); idx++ ){
            lineDiv = getLineDiv(idx);
            inOffset = lineDiv.offset();
            outlineDiv =getOutLineDiv(idx);
            outOffset = outlineDiv.offset();
            lineNumDiv=getLineNumDiv(idx);
            numOffset = lineNumDiv.offset();
            if(outOffset && idx !== 1)  
            {
                //sometimes can't find output div.  possibly harmless?
                //just ignoring for now, but may need to fix
                topheight =  Math.max(inOffset.top, outOffset.top);
                outOffset.top = topheight;
                inOffset.top = topheight;
                numOffset.top = topheight;
                outlineDiv.offset(outOffset);
                lineDiv.offset(inOffset);
                lineNumDiv.offset(numOffset);
            }
            lineDiv.height("auto");
            var outheight = outlineDiv[0].scrollHeight;
            var lineheight = lineDiv[0].scrollHeight;
            lineDiv.height(Math.max(outheight,lineheight));
        }
        CONTENTHEIGHT = inOffset.top + lineDiv.height() - BOXTOP;
    }

    function addLine(line){
        // Add a new line to the editor
        calcFramework.addLine(line);
        for (var idx = calcFramework.getNumLines()-1; idx >=line; idx--) {
           getLineDiv(idx).data("line",(idx+1));
           getOutLineDiv(idx).data("line",(idx+1));
           getLineNumDiv(idx).data("line",(idx+1)).html(idx+1);
        }
        if(line > 1) {
            getLineDiv(line-1).after(
                "<div class=\"inln\" data-line=\""+line+"\"></div>");
            getOutLineDiv(line-1).after(
                "<div class=\"outln\" data-line=\""+line+"\"></div>");
             getLineNumDiv(line-1).after(
                "<div class=\"linenum\" data-line=\""+line+"\">"+line+"</div>");
        }
        else {
             getLineDiv(1).before("<div class=\"inln\" data-line=\"1\"></div>");
             getOutLineDiv(1).before(
                "<div class=\"outln\" data-line=\"1\"></div>");
             getLineNumDiv(1).before(
                "<div class=\"linenum\" data-line=\"1\">1</div>");
        }
        lineupLines();
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

        //if the line has to be folded, which fold is the cursor on
        var foldnum = Math.floor( index / calcFramework.getLineWidth() );

        var perceivedIndex = index % calcFramework.getLineWidth();

        var lineOffset = getLineDiv(line).offset();
        var cursorOffset = {
            top:lineOffset.top + LINEHEIGHT * foldnum,
            left:lineOffset.left + (FONTWIDTH * perceivedIndex)
        };    

        var inputBottom =$(".in").offset().top+$(".in").height();
        var inputTop =$(".in").offset().top;
        var extralength =1;
        
        //if we're out of the box, scroll to where we are and try again
        if(cursorOffset.top >= inputBottom) {
            extralength = cursorOffset.top - inputBottom;
            $(".in").scrollTop($(".in").scrollTop()+extralength+LINEHEIGHT);
            moveCursor(line,index);
            return;
        }

        if(cursorOffset.top < inputTop){
            extralength = inputTop-cursorOffset.top ;
            $(".in").scrollTop($(".in").scrollTop()-extralength-LINEHEIGHT);
            moveCursor(line,index);
            return;
        }

        $(".cursor").offset(cursorOffset);
    }

    function updateOut(line) {
        var outdiv = getOutLineDiv(line);
        try {
            outdiv.html(calcFramework.getLine(line).output());
            if(ERRORLIST[line]) {
                ERRORLIST[line] = null;
                UPDATEERRORS = true;
            }
        }
        catch(exc) {

            switch(exc.type){
                case "movecursor":
                    moveCursor(currentline+exc.xdistance, 
                        currentindex+exc.ydistance);
                    updateLineDisplay(calcFramework.getLine(line));
                break;
                default:
                    outdiv.html("");
                    if(ERRORLIST[line] !==exc) {
                        ERRORLIST[line] =exc;
                        UPDATEERRORS = true;
                    }
            }
        }
    }

    function updateMessages() {
        var messageDiv = $("#messagediv");
        messageDiv.html("");
        for(var iter=1; iter<=calcFramework.getNumLines(); iter++) {
            var exc = ERRORLIST[iter];
            if(exc){
                switch(exc.type) {
                case "E":
                    messageDiv.append("<span class=\"errorline\">Line #" +
                        iter+":"+exc.message+"</span><br>");
                    break;
                case "W":
                     messageDiv.append("<span class=\"warningline\">Line #" +
                        iter+":"+exc.message+"</span><br>");
                     break;
                default: //including N
                    //do Nothing
                }
            }
        }
    }

    function showAggregates() {
        $("#aggdiv").html(calcFramework.getAggregate("Total"));
    }

    function cleanUpMessages() {
        if(UPDATEERRORS){
            updateMessages();
            UPDATEERRORS = false;
        }
        if(LINESCHANGED) {
            lineupLines();
            showAggregates();
            LINESCHANGED = false;
        }     
    }

}());


