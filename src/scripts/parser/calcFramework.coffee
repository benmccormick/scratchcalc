# An abstract representation of the scratch document as a whole
#
# Uses knockout.js bindings to connect data to GUI
#
# Author: Ben McCormick
#
#**TODOS:** 
#
#- Need to fix ans handling 
#- line variables don't get initialized when pulled from storage
#- line variables don't publish (use setVar)

#calcFramework is the global namespace for the view-model
window.calcFramework = do ->
  EQParser.init()
  cF = {}
  cF.outputs = ko.observableArray()
  cF.outputs.push(0)
  cF.varMap = {}
  cF.type = "Total"
  cF.lineWidth = ko.observable(50) 
  cF.outWidth = ko.observable(25)
  ##### The Line class represents a line in the calculator 
  # This includes linenum, input and output.  
  # These are included into an obserableArray and bound to the DOM using knockout
  class Line
    constructor: (linenum,currline)->
      self = this
      @varMap = {}
      @subscriptions = {}
      @input = ko.observable("")
      #subscription handler is unique so we can unbind by event
      @subscriptionHandler = (event,linenum) ->
        if self.linenum() > linenum 
          self.trigger(true)
      @formattedInput = ko.computed(->
          formatted(self)
      )
      @linenum = ko.observable(linenum)
      @errormessage = ko.observable()
      #set currentline, if not specified make it false
      @isCurrentLine = ko.observable(currline ? false)
      @trigger = ko.observable(false)
      @adjlinenum = ko.computed(->
          return self.linenum() + 1
      )
      @lnOutput = ko.computed(->
          self.unsubscribe()
          result = outputFunction(self,self.input(),self.trigger())
          self.trigger(false)
          result
        )
      @lineheight = ko.computed(->
          #get integer output for max height
          (Math.ceil(Math.max(self.input().length/cF.lineWidth(),self.lnOutput().split("<br>").length))|0)*25+"" 
        )

    ##### Adds handling for the previous variable
    addPreviousAnswerHandling: ->
      #`@linenum` starts at 0, the variables start at 1, so no need to -1 on linenums to get last
      ans = if @linenum() > 0 then cF.varMap["line"+(@linenum()-1)] else new NumberValue 0
      @varMap["ans"] = ans
      opers = /^\s*[\+\-\*\/!%\^&|]/
      isoperator = opers.exec(@input())
      if isoperator and @input().length and @linenum() > 1
        @input(@input().splice(0,0,"ans "))
        exc =
          type:"movecursor"
          xdistance:4
          ydistance:0 
        throw exc;
    ###### Gets the variable if its defined, moving recursively backwards through the lines
    getVar: (varName, subscribe, notCurrentLine) ->
      if not varName?
        return null

      if subscribe
        @subscribe(varName)

      #Actually don't want ones set in the current varMap, only past lines
      if varName of @varMap and notCurrentLine
          return @varMap[varName]
      
      if @linenum() > 0
        nextLine = cF.lines()[@linenum() - 1]
        nextLine?.getVar varName, false,true 
      else   
        cF.varMap[varName] #eventually go to global
    ##### Sets the var for the current line
    setVar: (varName,value) ->
      @varMap[varName] = value
      @publish varName 
    ##### Publish that this variable has changed for this line
    publish: (varName) ->
      that = this
      pub = -> $(window).trigger(varName+"event",that.linenum())
      setTimeout(pub,0)
    ##### Subscribe to a variable and listen to see if it has changed
    subscribe: (varName) ->
      if not (varName of @subscriptions)
        $(window).bind(varName+"event", @subscriptionHandler)
        @subscriptions[varName] = @subscriptionHandler;
    ##### Unsubscribe to a variable
    unsubscribe: ->
      for varName,handle of @subscriptions
            $(window).unbind varName+"event", handle
      @subscriptions = {}

  ##### Generates the output of the expression
  outputFunction = (self,input) ->
    try
      self.addPreviousAnswerHandling()
    catch movecursor
      throw movecursor
      #throw movecursor #try again with updated line         
    try
      self.errormessage(null);
      out = EQParser.parse input, 10, self 
      cF.outputs.splice self.linenum(), 1, out
      linenum = "line"+self.adjlinenum()
      cF.varMap[linenum] = out
      return  out.toString().chunk(cF.outWidth()).join("<br>")
    catch ex
      cF.outputs.splice(self.linenum(),1,0);
      self.errormessage(formatErrorMessage(ex,self.adjlinenum()));
      return ""
  ##### Gets the formatted version of the input with syntax highlighting and line breaks
  formatted = (line) ->
    getVar = line.getVar.bind line
    output = line.input().chunk(cF.lineWidth()).join("<br>");
    markupGen.markup output, getVar 

  ##### Formats the error message for a line
  formatErrorMessage = (exception, linenum) ->
    #Maybe add something to differentiate between warnings and errors later
    "Line #" + linenum+":"+exception.message
  
  # We create one line to start and add it to the array
  line1 = new Line 0, true 
  
  cF.lines = ko.observableArray()
  cF.lines.push line1
  cF.currentLine = cF.lines()[0]

  ##### Function to access the line at `index`
  cF.getLine = (index) -> cF.lines()[index];

  ##### Function to add a line at `index`
  cF.addLine = (index) ->
    newLine = new Line index
    if (not index?) or (index >= cF.lines().length)
      cF.lines.push newLine
    else 
      cF.lines.splice index, 0, newLine
      for line, i in cF.lines() when i >index
         line.linenum(line.linenum()+1)

  ##### Function to remove a line at `index`
  cF.removeLine = (index) ->
    newLine = new Line index
    if (index?) and (index <= cF.lines().length)
      cF.lines()[index].unsubscribe()
      cF.lines.splice index, 1
      for line, i in cF.lines() when i >=index
         line.linenum(line.linenum()-1)

  ###### Function to append the next line to the line at index
  cF.appendNextLine = (index) ->
    #Adds the next line into the current 1 and deletes the next line
    line1 = cF.lines()[index]
    line2 = cF.lines()[index+1]
    line1.input line1.input()+line2.input()
    cF.removeLine index+1
  
  cF.setLineWidth = (width) -> cF.lineWidth width

  cF.setOutWidth = (width) -> cF.outWidth width

  cF.getLineWidth = -> cF.lineWidth()
    
  cF.getLineHeight = (linenum) -> cF.lines()[linenum].length/cF.lineWidth() ? 0
    
  cF.getNumLines = -> cF.lines().length
 
  cF.setCurrentLine = (newCurrentLine) ->
    cF.currentLine.isCurrentLine false
    cF.currentLine= cF.lines()[newCurrentLine]
    cF.currentLine.isCurrentLine true
  
  ###### Saves the view-model to local storage
  cF.saveToStorage = ->
    inputArray=[];
    inputArray.push line.input() for line in cF.lines()
    localStorage["calcInputs"] = JSON.stringify inputArray
  
  ###### Recovers the view-model from local storage
  cF.restoreFromStorage = ->
    storageString = localStorage["calcInputs"]
    if not storageString?
      return
    storageObj = JSON.parse storageString 
    numlines = cF.getNumLines()
    for line, i in storageObj
      if i >= numlines
        cF.addLine i
      cF.lines()[i].input line
  
  ##### Gets the aggregate value of the outputs  
  cF.getAggregate = ko.computed( 
    read: ->
      switch cF.type
        when "Total" then getArrayTotal cF.outputs() 
        when "Average" then getArrayTotal(cF.outputs())/cF.outputs().length
        else 0
    write: ->
    owner:this
  )

  #Animation callbacks for the planets list
  cF.showLine = (element) ->
    $(element).filter("div").slideDown()
  
  cF.hideLine = (element) ->
    $(element).filter("div").slideUp()

  cF