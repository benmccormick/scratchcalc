
/*jshint jquery:true*/
/*global calcFramework:false */

var FONTWIDTH = 11;
var LINEHEIGHT = 25;
// Prevent the backspace key from navigating back.
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

String.prototype.splice = function( idx, rem, extras ) {
    extras = (!extras) ? "":extras;
    return (this.slice(0,idx) + extras + this.slice(idx + Math.abs(rem)));
};


calcFramework.addLine();
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
    $(".cursor").offset({ top:offset.top + (currentline-1)*LINEHEIGHT , left: offset.left+(pos *FONTWIDTH) });
    currentindex=pos;
});

$(document).keyup(function(e){
    var cline =  $(".inln").filter( function() { 
        return $(this).data("line") == currentline; 
    });
    var input = cline.html()+"";
    var cursorOffset = $(".cursor").offset();

    switch(e.keyCode){
    case 8: //backspace
        //add handling for 0
        input = input.splice(currentindex-1,1);
        cline.html(input);
        cursorOffset.left -= FONTWIDTH; 
        $(".cursor").offset(cursorOffset);
        currentindex--;  
        break;
    case 37: //left arrow
        if(currentindex === 0)
        {
            if(currentline > 1){
                currentindex = getLineLength(currentline-1);
                cursorOffset.left = offset.left+currentindex*FONTWIDTH;
                cursorOffset.top -= LINEHEIGHT;
                $(".cursor").offset(cursorOffset);
                currentline--;
            }
        }
        else
        {
            cursorOffset.left -= FONTWIDTH; 
            $(".cursor").offset(cursorOffset);
            currentindex--;  
        }
        break;
    case 38: //up arrow
        input = input.splice(currentindex,1);
        cline.html(input);
        cursorOffset.left -= FONTWIDTH; 
        $(".cursor").offset(cursorOffset);
        currentindex--;  
        break;
    case 39: //right arrow
        cursorOffset.left += FONTWIDTH; 
        $(".cursor").offset(cursorOffset);
        currentindex++;  
        break;
    case 40: //down arrow
        input = input.splice(currentindex,1);
        cline.html(input);
        cursorOffset.left -= FONTWIDTH; 
        $(".cursor").offset(cursorOffset);
        currentindex--;  
        break;
    case 46: //delete
        input = input.splice(currentindex,1);
        cline.html(input);
        break;
    default:
        var keyVal = String.fromCharCode(e.keyCode);
        input = input.splice(currentindex,0,keyVal);
        cline.html(input);
        cursorOffset.left += FONTWIDTH; 
        $(".cursor").offset(cursorOffset);  
        currentindex++; 
    }         
});


function getLineLength(index){
    var line =  $(".inln").filter( function() { 
        return $(this).data("line") == index; 
    });
    return line.html().length;
}