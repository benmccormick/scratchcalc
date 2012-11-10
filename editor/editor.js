
/*jshint jquery:true*/
/*global calcFramework:false */



(function(){

    var FONTWIDTH = 11;
    var LINEHEIGHT = 25;
    var LINEWIDTH = 50;
    calcFramework.setLineWidth(LINEWIDTH);
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
        },
    false);
    window.addEventListener('keyup',
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
    $(".empty").bind("click",function(e){
        //Take care of this later... for when we click below currentline

    });

    $(".inln").bind("click",function(e){
        currentline = $(e.currentTarget).data("line");
        var linelength = e.currentTarget.innerHTML.length;
        var xpos = e.pageX;
        var diff = xpos-offset.left;
        var pos = Math.min(linelength, diff/FONTWIDTH|0);
        var output = pos ;
        $(".cursor").offset({ top:offset.top + (currentline-1)*LINEHEIGHT , 
            left: offset.left+(pos *FONTWIDTH) });
        currentindex=pos;
    });

    $(document).keydown(function(e){
        var linediv =  getLineDiv(currentline);
        var cline =  calcFramework.getLine(currentline);
        var input = cline.input;
        var cursorOffset = $(".cursor").offset();
        var newlinelength,prevDiv,prevline,remains,prevlength;

        switch(e.keyCode){
        case 8: //backspace
            if(currentindex > 0){
                cline.input = input.splice(currentindex-1,1);
                linediv.html(cline.formatted());
                cursorOffset.left -= FONTWIDTH; 
                $(".cursor").offset(cursorOffset);
                currentindex--;  
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
            break;
        case 32:  //space
            cline.input = input.splice(currentindex,0," ");
            linediv.html(cline.formatted());
            cursorOffset.left += FONTWIDTH; 
            $(".cursor").offset(cursorOffset);  
            currentindex++;
            break;
        case 37: //left arrow
            if(currentindex === 0){
                if(currentline > 1){
                    moveCursor(currentline-1); //move to end of previous line
                }
            }
            else{
                moveCursor(currentline,currentindex-1);  
            }
            break;
        case 38: //up arrow
            if(currentline > 1){
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
    });

    $(document).keypress(function(e){
        if(e.keyCode === 13){
            return;
        }
        var linediv =  getLineDiv(currentline);
        var cline =  calcFramework.getLine(currentline);
        var input = cline.input;
        var keyVal = String.fromCharCode(e.keyCode);
        if(!e.shiftKey)
        {
            keyVal = keyVal.toLowerCase();
        }
        cline.input = input.splice(currentindex,0,keyVal);
        linediv.html(cline.formatted());
        moveCursor(currentline,currentindex+1);
        updateOut(currentline);
    });

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
            return $(this).data("line") == linenum; 
        });
    }

     function getOutLineDiv(linenum){
       return $(".outln").filter( function() { 
            return $(this).data("line") == linenum; 
        });
    }


    function formatHTML(input){
        return input.replace(/\s/g,"&nbsp;");
    }

    function cleanHTML(input){
        return input.replace(/&nbsp;/g," ");
    }

    function removeLine(line){
        // Remove a line from the editor
        var lineDiv = getLineDiv(line);
        var outlineDiv = getOutLineDiv(line);
        lineDiv.remove();
        outlineDiv.remove();
        for(var idx = line+1;  idx<calcFramework.getNumLines(); idx++ ){
            getLineDiv(idx).data("line",(idx-1));
            getOutLineDiv(idx).data("line",(idx-1));
        }
        lineupLines();

    }

    function lineupLines(){
        var lineDiv,outlineDiv,outOffset;
        for( var idx = 1; idx<calcFramework.getNumLines(); idx++ ){
            lineDiv = getLineDiv(idx);
            outlineDiv =getOutLineDiv(idx);
            outOffset = outlineDiv.offset();
            if(outOffset)  
            {
                //sometimes can't find output div.  possibly harmless?
                //just ignoring for now, but may need to fix
                outOffset.top = lineDiv.offset().top;
                outlineDiv.offset(outOffset);
            }
        }
    }

    function addLine(line){
        // Add a new line to the editor
        calcFramework.addLine(line);
        for(var idx = line;  idx<calcFramework.getNumLines(); idx++ ){
           getLineDiv(idx).data("line",(idx+1));
           getOutLineDiv(idx).data("line",(idx+1));
        }
        if(line > 1)
        {
            getLineDiv(line-1).after(
                "<div class=\"inln\" data-line=\""+line+"\"></div>");
            getOutLineDiv(line-1).after(
                "<div class=\"outln\" data-line=\""+line+"\"></div>");
        }
        else
        {
             getLineDiv(1).before("<div class=\"inln\" data-line=\"1\"></div>");
             getOutLineDiv(1).before(
                "<div class=\"outln\" data-line=\"1\"></div>");
        }
        
        lineupLines();

    }


    function moveCursor(line, index){
        //Move the cursor to the specified line and index, and update
        //the line and index variables.  if index is undefined, move to end 
        //of the line
        var numlines = calcFramework.getNumLines();
        if(line > numlines)
        {
            line = numlines;
            index = null;  //we'll go to the end of the last line
        }
        var lineLength =getLineLength(line);
        if(index === null || typeof index === "undefined" || 
            index > lineLength){
            //If the index is undefined or longer than line, make line length
            index = lineLength;
        }

        currentline = line;
        currentindex = index;

        //if the line has to be folded, which fold is the cursor on
        var foldnum = index/calcFramework.getLineWidth()|0;

        var perceivedIndex = index % calcFramework.getLineWidth();

        var lineOffset = getLineDiv(line).offset();
        var cursorOffset = {
            top:lineOffset.top + LINEHEIGHT * foldnum,
            left:lineOffset.left + (FONTWIDTH * perceivedIndex)
        };    
        $(".cursor").offset(cursorOffset);
    }

    function updateOut(line){
        var outdiv = getOutLineDiv(line);
        outdiv.html(calcFramework.getLine(line).output());
    }

}());


