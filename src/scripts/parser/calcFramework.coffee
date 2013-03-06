###
 * calcFramework - An abstract representation of the scratch document as a whole
 * Uses knockout.js bindings to connect data to GUI
 * @author Ben McCormick
 ###

window.calcFramework = do ->
  EQParser.init()
  cF = {}
  cF.outputs = ko.observableArray()
  cF.outputs.push(0)
  cF.varMap = {}
  cF.type = "Total"
  cF.lineWidth = ko.observable(50) 
  cF.outWidth = ko.observable(25)
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
      @formattedInput = ko.computed(
        read: ->
          formatted(self)
        write: ->
          #noop
        owner: self
      )
      @linenum = ko.observable(linenum)
      @errormessage = ko.observable()
      #set currentline, if not specified make it false
      @isCurrentLine = ko.observable(currline ? false)
      @trigger = ko.observable(false)
      @adjlinenum = ko.computed(
        read:->
          return self.linenum() + 1
        write: ->
          #noop
        owner:self
      )
      @lnOutput = ko.computed(
        read:->
          self.unsubscribe()
          result = outputFunction(self,self.input(),self.trigger())
          self.trigger(false)
          result
        write: ->
          #noop
        owner:self
      )
      @lineheight = ko.computed(
        read: ->
          #get integer output for max height
          (Math.ceil(Math.max(self.input().length/cF.lineWidth(),self.lnOutput().split("<br>").length))|0)*25+"" 
        write: ->
          #noop
        owner:self
      )

    addPreviousAnswerHandling: ->
      ans = if @linenum() > 1 then cF.varMap["line"+(this.linenum()-1)] else new NumberValue 0
      @varMap["ans"] = ans
      opers = /^\s*[\+\-\*\/!%\^&|]/
      isoperator = opers.exec(@input)
      if isoperator and @input().length and @linenum() > 1
        @input(@input().splice(0,0,"ans "))
        exc =
          type:"movecursor"
          xdistance:4
          ydistance:0 
        throw exc;
    
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

    setVar: (varName,value) ->
      @varMap[varName] = value
      @publish varName 

    publish: (varName) ->
      that = this
      pub = -> $(window).trigger(varName+"event",that.linenum())
      setTimeout(pub,0)

    subscribe: (varName) ->
      if not (varName of @subscriptions)
        $(window).bind(varName+"event", @subscriptionHandler)
        @subscriptions[varName] = @subscriptionHandler;
    
    unsubscribe: ->
      for varName,handle of @subscriptions
            $(window).unbind varName+"event", handle
      @subscriptions = {}

  outputFunction = (self,input) ->
    try
      self.addPreviousAnswerHandling()
    catch movecursor
      return "movecursor"
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

  formatted = (line) ->
    getVar = line.getVar.bind line
    output = line.input().chunk(cF.lineWidth()).join("<br>");
    markupGen.markup output, getVar 

  formatErrorMessage = (exception, linenum) ->
    #Maybe add something to differentiate between warnings and errors later
    "Line #" + linenum+":"+exception.message
  
  line1 = new Line 0, true 
  
  cF.lines = ko.observableArray()
  cF.lines.push line1
  cF.currentLine = cF.lines()[0]

  cF.getLine = (index) -> cF.lines()[index];

  cF.addLine = (index) ->
    newLine = new Line index
    if (not index?) or (index >= cF.lines().length)
      cF.lines.push newLine
    else 
      cF.lines.splice index, 0, newLine
      for line, i in cF.lines() when i >index
         line.linenum(line.linenum()+1)

  cF.removeLine = (index) ->
    newLine = new Line index
    if (index?) and (index <= cF.lines().length)
      cF.lines()[index].unsubscribe()
      cF.lines.splice index, 1
      for line, i in cF.lines() when i >=index
         line.linenum(line.linenum()-1)

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
  
  cF.saveToStorage = ->
    inputArray=[];
    inputArray.push line.input() for line in cF.lines()
    localStorage["calcInputs"] = JSON.stringify inputArray
  
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