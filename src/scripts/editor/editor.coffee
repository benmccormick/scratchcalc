#Contains the code for defining a custom text editor and calculator hybrid.  
#Author: Ben McCormick



# Initialize the editor variables
LINEWIDTH = 50
FONTWIDTH = 11
LINEHEIGHT = 25
currentline = 0
currentindex = 0
highlightData = []

calcFramework.setLineWidth LINEWIDTH

# If the user has work stored in local storage, get the work and display it.
calcFramework.restoreFromStorage()

#Set up Knockout bindings
ko.applyBindings calcFramework


# Prevent the backspace key from acting as a "back button"
$(document).unbind("keydown").bind "keydown", (event) =>
  doPrevent = false
  if event.keyCode is 8
    event.preventDefault()

# Listen on mouse events to adjust cursor and highlighting
$("#in").on "mouseup",".inln",(e) ->
  loc = getMouseLoc(e)
  highlightData[2] = loc.line
  highlightData[3] = loc.position
  adjustHighlightIndices()
  moveCursor(highlightData[2], highlightData[3])

$("#in").on "mousedown", ".inln", (e) ->
  loc = getMouseLoc(e)
  highlightData[0] = loc.line
  highlightData[1] = loc.position

##### Function to get the current location of the cursor based on an event
getMouseLoc = (e) -> 
  newline = $(e.currentTarget).data("line")
  lineoffset = $(e.currentTarget).offset()
  linelength = getLineLength(newline)
  xpos = e.pageX
  ypos = e.pageY
  xdiff = xpos - lineoffset.left
  ydiff = ypos - lineoffset.top
  column = xdiff / FONTWIDTH + Math.floor(ydiff / LINEHEIGHT) * LINEWIDTH
  pos = Math.min(linelength, column)
  return {
    line: newline
    position: pos
  }

##### Function to move the highlighting area
adjustHighlightIndices = ->
  bigStart = isHighlightStartGreater()
  endhalfway = highlightData[3] % 1 < 0.5
  #at least in Chrome, Highlighting always floors on the start
  highlightData[1] = Math.floor(highlightData[1])
  h3 = highlightData[3]
  highlightData[3] = if (bigStart or endhalfway) then Math.floor(h3) else Math.ceil(h3)

##### Add keybindings for command keys
$(document).keydown (e) ->
  cline =  calcFramework.getLine(currentline)
  input = cline.input()
  registered = true
  # Switches over the different keycodes to set default behaviors
  switch e.keyCode
    when 8 
      # - backspace 
      if isHighlighted()
        removeHighlightedSection()
        break
      if currentindex > 0
        cline.input(input.splice(currentindex-1,1))
        moveCursor(currentline,currentindex-1)
      else if currentline > 0
        prevline = calcFramework.getLine(currentline-1)
        prevlength = prevline.input().length
        prevline.input(prevline.input()+cline.input())
        removeLine(currentline)
        moveCursor(currentline-1,prevlength)
    when 13  
      #- enter
      if isHighlighted()
        removeHighlightedSection()
        cline = calcFramework.getLine(currentline)
        input = cline.input()
      remains = input.substring(currentindex)
      cline.input(input.substring(0,currentindex))
      addLine(currentline+1)
      cline = calcFramework.getLine(currentline+1)
      cline.input(remains)
      moveCursor(currentline+1,0)
    when 32  
      #- space
      cline.input(input.splice(currentindex,0," "))
      moveCursor(currentline, currentindex + 1)
    when 35 
      #- end
      e.preventDefault()
      moveLine = if e.ctrlKey then calcFramework.getNumLines() else currentline
      moveCursor(moveLine, calcFramework.getLine(moveLine).input().length)
    when 36 
      #- home
      e.preventDefault()
      moveLine = if e.ctrlKey then 1 else currentline
      moveCursor(moveLine, 0)
    when 37 
      #- left arrow
      if currentindex is 0
        if currentline > 0
          moveCursor(currentline-1) #move to end of prev line
      else 
        moveCursor(currentline,currentindex-1)
    when 38 
      #- up arrow
      if currentline > 0
        moveCursor(currentline-1, currentindex)
    when 39 
      #- right arrow
      if currentindex is getLineLength(currentline)
        if !isLastLine
          moveCursor(currentline+1,0)
      else
        moveCursor(currentline,currentindex+1)
    when 40 
      #- down arrow
      if !isLastLine(currentline)
        moveCursor(currentline+1,currentindex)
    when 46 
      #- delete
      if isHighlighted()
        removeHighlightedSection()
        break
      if currentindex is getLineLength(currentline)
        if !isLastLine(currentline)
          calcFramework.appendNextLine(currentline)
        else
          cline.input(cline.input().splice(currentindex,1))
    else
     registered = false
  if registered
    removeHighlight()
  #Save to Storage after the current function context has run to completion
  setTimeout(0,calcFramework.saveToStorage())

##### Handle key bindings for normal keys
$(document).keypress (e) ->
  if e.keyCode is 13
    return null
  cline =  calcFramework.getLine(currentline)
  input = cline.input()
  keyVal = String.fromCharCode(e.keyCode)
  if !e.shiftKey
    keyVal = keyVal.toLowerCase()
  if isHighlighted()
    removeHighlightedSection(keyVal)
  else
    cline.input(input.splice(currentindex,0,keyVal))
    moveCursor(currentline,currentindex+1)
  #Save to Storage after the current function context has run to completion
  setTimeout(0,calcFramework.saveToStorage())

##### Get the length of the line at `index`
getLineLength = (index) ->
  #get the length of a given line
  line =  calcFramework.getLine(index) 
  line.input().length

##### Determines whether the line at `index` is the last line
isLastLine = (linenum) ->
  linenum is calcFramework.getNumLines()-1

##### Gets the input div for the given line
getLineDiv = (linenum) ->
   $(".inln").filter ->
      @getAttribute("data-line") is linenum+ ""

##### Gets the output div for the given line
getOutLineDiv = (linenum) ->
   $(".outln").filter ->
      @getAttribute("data-line") is linenum+""

##### Gets the line number div for the given line
getLineNumDiv = (linenum) ->
   $(".linenum").filter ->
      @getAttribute("data-line") is linenum+""

##### Removes the line at `index`
removeLine = (index) ->
  calcFramework.removeLine index

##### Add a new line at `index` to the editor
addLine = (index) ->
  calcFramework.addLine index

##### Checks to see if there is a current highlight, or just a single cursor
isHighlighted = ->
  hd = highlightData
  samepoints = (hd[0] is hd[2] and hd[1] is hd[3])
  hd.length > 0 and not samepoints

##### Removes the highlight from the editor
removeHighlight = ->
  highlightData = []
  window.getSelection().collapse()

##### Deletes the content in the highlighted section
#**TODO:** This could probably stand to be cleaned up
removeHighlightedSection = (replacement) ->
  if !replacement
    replacement = ""
  startGreater = isHighlightStartGreater()
  lastline = if startGreater then highlightData[0] else highlightData[2]
  lastindex = if startGreater then highlightData[1] else highlightData[3]
  firstline = if startGreater then highlightData[2] else highlightData[0]
  firstindex = if startGreater then highlightData[3] else highlightData[1]
  
  if lastline > firstline
    lastremainder = calcFramework.getLine(lastline).input().substring(lastindex)
    firstremainder = calcFramework.getLine(firstline).input().substring(0,firstindex)
    for i in [lastline..firstline] by -1
      removeLine i
    firstline = calcFramework.getLine(firstline)
    firstline.input(firstremainder + replacement+ lastremainder)
  else 
    line = calcFramework.getLine(lastline)
    input = line.input()
    firstsub = input.substring(0, firstindex)
    secondsub =  input.substring(lastindex)
    line.input(firstsub + replacement+ secondsub)
  moveCursor(firstline, firstindex + replacement.length)
  removeHighlight()

##### Returns whether the starting point was after the end point for curr highlight
isHighlightStartGreater = ->
  [h0,h1,h2,h3] = highlightData
  (h0 > h2) or ((h0 is h2) and (h1 > h3))

##### Function to move the cursor
#Moves the cursor to the specified line and index, and update
#the line and index variables.  if index is undefined, move to end 
#of the line
moveCursor = (line, index) ->
  
  numlines = calcFramework.getNumLines()
  if line > numlines
    line = numlines
    index = null  #we'll go to the end of the last line
  lineLength = getLineLength line
  if (not index?) or index > lineLength
    #If the index is undefined or longer than line, make line length
    index = lineLength

  #update current line classes
  if line isnt currentline 
    getLineDiv(currentline).removeClass("currentline")
    getLineNumDiv(currentline).removeClass("currentnum")
    getOutLineDiv(currentline).removeClass("currentout")
    getLineDiv(line).addClass("currentline")
    getLineNumDiv(line).addClass("currentnum")
    getOutLineDiv(line).addClass("currentout")
  
  currentline = line
  currentindex = index
  calcFramework.setCurrentLine(line)
  #if the line has to be folded, which fold is the cursor on
  foldnum = Math.floor( index / calcFramework.getLineWidth() )
  perceivedIndex = index % calcFramework.getLineWidth()
  lineOffset = getLineDiv(line).offset()
  cursorOffset = {
    top:lineOffset.top + LINEHEIGHT * foldnum
    left:lineOffset.left + (FONTWIDTH * perceivedIndex)
  }    
  inputBottom =$("#in").offset().top+$("#in").height()
  inputTop =$("#in").offset().top
  extralength =1
  #if we're out of the box, scroll to where we are and try again
  if cursorOffset.top >= inputBottom
    extralength = cursorOffset.top - inputBottom
    $("#in").scrollTop($("#in").scrollTop()+ extralength+ LINEHEIGHT)
    moveCursor(line,index)
    return null
  if cursorOffset.top < inputTop
    extralength = inputTop-cursorOffset.top 
    $("#in").scrollTop($("#in").scrollTop()-extralength-LINEHEIGHT)
    moveCursor(line,index)
    return null
  $(".cursor").offset(cursorOffset)

moveCursor(0,0)

##### Fits the editor to the window
fitToWindow = ->
  inwidth = $(".snapped").width() - $("#out").width() - $("#nums").width()
  $(".inln").width(inwidth)
  LINEWIDTH = Math.floor(inwidth/FONTWIDTH)-2
  outwidth = Math.floor($("#out").width()/FONTWIDTH)

  calcFramework.setLineWidth LINEWIDTH
  calcFramework.setOutWidth outwidth
  moveCursor(currentline,currentindex)

#set up resizing page elements when the window size changes and onload
$(window).resize(fitToWindow)
fitToWindow()

#Sync Scrolling
$("#in").on "scroll", ->
  $("#out").scrollTop($(this).scrollTop())
  $("#nums").scrollTop($(this).scrollTop())

offset = $("#in").offset()
$(".cursor").offset(offset)


keys = []
keydownfunc = (e) ->
  keys[e.keyCode] = true
  switch e.keyCode
      when 8, 37, 39, 38, 40,32 # Arrow keys and Space
        e.preventDefault()
keyupfunc = (e) ->
  keys[e.keyCode] = false

# Binds listeners to the window
window.addEventListener("keydown",keydownfunc, false)
window.addEventListener("keyup",keyupfunc, false)