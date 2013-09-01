###
 * EQTreeBuilder - An Equation TreeBuilder for Javascript
 * 
 *
 * @author Ben McCormick
 ###

window.EQTreeBuilder = do ->
  EQB ={}        #the internal treebuilder object
  myScan = {}    # the scanner
  eqStack = []   #the stack of equation tree objects
  stack = []     #the stack of tokens being processed
  terms = []     #the different tokentypes
  table = []     #the table describing the parsing technique
  prods = []     #a list of productions
  prodsteps =[]  #a list of the next stages after a reduce
  ctok = null           #the current token
  cstate = null        #the current state of the system  
  instr = null         # the instruction for the next step in the table
  root = null          # the tree root
  precision = 20 # The decimal precision for division
  errors = []    #the error messages for different states
  cline = null

  EQB.init = -> loadConfigs()

  EQB.process = (scanner,currline) ->
      cline = currline
      myScan = scanner
      cstate = 0
      stack = []
      eqStack = []
      index = -1
      stack.push("0")
      ctok = myScan.scanNext()
      while true
        # Get the index of token
        index = terms.indexOf ctok.token
        if index is -1
          if ctok.token.charAt ctok.token.length-1 is "("
            throw
              message:"Function not found",
              type:"E"
          else
            throw
              message: "Unknown Token"
              type: "E"

        instr = table[cstate][index]

        if (not instr?) or instr.charAt(0)  is "e" or instr is ""
          errorcode = instr ? "e00"
          errorinfo = errors[parseInt errorcode.substring(1)]
          calculationException =
            message: errorinfo.message
            type: errorinfo.type
            errorcode: errorcode
          throw calculationException
        if instr is "acc"
          #Valid equation completed
          return balanceTree(eqStack.pop())
        if instr.charAt(0) is "s"
          # We're doing a shift
          shifts(instr.substring(1),ctok.ref)
        else if instr.charAt(0) is "r"
          #we're doing a reduce
          reduce instr.substring(1)
        else
          #Shouldn"t hit this case
          #TODO: Add better error handling here!
          false
        
  EQB.setPrecision = (prec) -> precision = prec

  shifts = (level,ref) ->
    #performs a shift operation and updates the state
    stack.push ctok
    stack.push cstate+""
    if ref isnt -1 and myScan.getRefData(ref).value?
      eqStack.push createNode(ref)
    cstate = instr.substring(1)
    ctok = myScan.scanNext()
    if ctok is null
      ctok = {token:"$"}

  reduce = (level) ->
    #performs a reduce operation and updates the state
    cprod = prods[level]
    handleEqStack(level)
    start = stack.length-1
    finish = stack.length- (2 * cprod.components.length)
    idx
    for idx in [start..finish] by -1
      if idx is finish + 1
        cstate = stack[idx]
      stack.pop()
    stack.push(cprod.result)
    stack.push(cstate)
    column = terms.indexOf(cprod.result)
    cstate = table[cstate][column]

  balanceTree = (node) ->
    #handle order of operations
    if node.numChildren is 0
      return node
    else if node.type is "f"
      argnum = node.numChildren
      for child in node.arglist
        child = balanceTree child
    else if node.numChildren is 1
      child = node.child ? node.arglist[0]
      if node.child.priority < node.priority and node.priority isnt 10
        #trying to get both !,% and functions working right.
        newroot = node.child
        target = node.child.rchild
        newroot.rchild = node
        node.child = target
        return newroot
      else 
        node.setChild(balanceTree node.child)
    else
      node.setChildren(balanceTree(node.lchild),balanceTree(node.rchild))
      lchild = node.lchild
      rchild = node.rchild
      if lchild.priority < node.priority
        newlchild = lchild.rchild
        lchild.setChildren(lchild.lchild,node)
        node.lchild = newlchild
        return lchild
      if rchild.priority < node.priority
        newrchild = rchild.rchild
        rchild.setChildren(node,rchild.rchild)
        node.rchild = newrchild
        return rchild
    return node

  handleEqStack = (productionNum) ->
    lchild
    rchild
    child
    binOpNode
    func
    opNode
    arglist
    variable
    switch productionNum
      when "2"
        child = eqStack.pop()
        variable = eqStack.pop()
        variable.setValue child.value()
        cline.setVar(variable.name,child.value())
        eqStack.push variable
      when "3"
        rchild = eqStack.pop()
        binOpNode = eqStack.pop()
        lchild = eqStack.pop()
        binOpNode.setChildren(lchild,rchild)
        eqStack.push binOpNode
      when "11"
        arglist = []
        child = eqStack.pop()
        try
          while child.type isnt "f"
            arglist.push child
            child = eqStack.pop()
        catch err
          throw {message: "Function not found",type: "E"}
        func = child
        func.setArgList(arglist)
        eqStack.push(func)
      when "9"
        opNode = eqStack.pop()
        child = eqStack.pop()
        opNode.setChild child
        eqStack.push opNode

  createNode = (ref) ->
    #Builds a treeNode object from a reference
    refval = myScan.getRefData ref
    switch refval.symbol
        when "f" then new FuncNode refval
        when "d" then new DigitNode refval 
        when "v" 
          varVal = cline.getVar(refval.text,true)
          new VarNode(refval,varVal)
        when "u" then new UnOpNode refval
        when "n" 
          lastnum = eqStack.pop()
          lastnum.value().setUnits refval.text
          lastnum
        when "b" then new BinOpNode refval
        else ""

  loadConfigs = ->
      table = tablePlaceHolder.table
      terms = tablePlaceHolder.terms
      prods = tablePlaceHolder.productions
      errors = tablePlaceHolder.errors

  # Node Constructors
  class FuncNode
    #Unary Function Node
    constructor: (ref) ->
      that = this
      @type = "f"
      @name = ref.text
      @numChildren = 0
      @priority = 10
      @arglist = null
      @value = ->
        arg0 = that.arglist[0]
        arg1 = that.arglist[1]
        switch(that.name) 
          when "sin(" then new NumberValue(Math.sin(arg0.value()),arg0.units)
          when "cos(" then new NumberValue(Math.cos(arg0.value()),arg0.units)
          when "tan(" then new NumberValue(Math.tan(arg0.value()),arg0.units)
          when "(" then arg0.value()
          when "max(" 
            child1 = arg0.value()
            child2 = arg1.value()
            if (child1.compareTo(child2) > 0) then child1 else child2
          when "min(" 
            child1 = arg0.value()
            child2 = arg1.value()
            if (child1.compareTo(child2) < 0) then child1 else child2
          when "perm("
            numerator = arg0.value().factorial()
            difference = arg0.value().subtract arg1.value()
            denominator = difference.factorial()
            numerator.divide(denominator,precision, RoundingMode.DOWN())
          when "comb("
            numerator =  arg0.value().factorial()
            difference = arg0.value().subtract arg1.value()
            fact1 = arg1.value().factorial()
            fact2 = difference.factorial()
            numerator.divide(fact.multiply(fact2),precision,RoundingMode.DOWN())
          when "ceil(" then arg0.value().ceil()
          when "floor(" then arg0.value().floor()
          else 
            new NumberValue(0)

    toString: -> @name + @child.toString()+")"

    setArgList: (arglist) ->
      @arglist = arglist        
      @numChildren = arglist.length

  class DigitNode
    constructor: (ref)->
      #Digit Node
      @type = "d"
      @name = ref.value
      @numChildren = 0
      @val= new NumberValue(this.name)
      @priority = 100

    value: -> @val
    toString: -> @name
      
  
  class VarNode 
    varValue = null
    constructor: (ref,varVal) ->
      #Variable Node
      @.type = "v"
      @name =ref.text
      @numChildren = 0
      varValue = varVal
      @priority = 90
    value: -> varValue
    toString: -> ref.text
    setValue: (value) -> varValue = value
      
  class UnOpNode
    #Unary Operation Node
    constructor: (ref) ->
      @type = "u"
      @name = ref.text
      @numChildren = 1
      @priority = 6
      @child = null

    toString: -> @child.toString()+""+@name
    setChild: (cnode) -> @child = cnode
    value: ->
      switch @name
        when "!" then @child.value().factorial()
        when "%" 
          #Consider throwing an error if the child 
          #is not a var or digit
          node = this.child.value().divide(new NumberValue("100"))
          node.isPercentage = true
          node
        else null
  
  class BinOpNode 
    constructor: (ref) ->
      #Binary Operation Node
      @name =ref.text
      switch @name
        when "+","-" 
          @priority = 0
        # do division after mult to avoid precision issues
        when "*","/" 
          @priority = 5
        else 
          @priority = 5
      @type ="b"
      @numChildren = 2
      @lchild = null
      @rchild= null

    value: ->
      isPercent = @rchild.value().isPercentage
      lnum = @lchild.value()
      rnum = @rchild.value()
      secondnum = if isPercent then rnum.multiply(lnum) else rnum
      switch @name
        when "+" then lnum.add(secondnum)
        when "-" then lnum.subtract(secondnum)
        when "*" then lnum.multiply(rnum)
        when "/" then lnum.divide(rnum,@precision,RoundingMode.HALF_DOWN())
        when "^" then lnum.pow(rnum)
      
    toString: -> @lchild.toString() + @name + @rchild.toString()

    setChildren: (left,right) ->
      @lchild = left
      @rchild = right

  

  EQB