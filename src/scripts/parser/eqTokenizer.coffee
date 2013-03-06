###
 * EQTokenizer - An Equation Tokenizer for Javascript
 * The Tokenizer module takes a string and splits it up into individual tokens
 * @author Ben McCormick
 ###



root = exports ? this

root.EQTokenizer = do ->
  EQT = {}
  tokenlist = []
  units = {}

  EQT.init = (varMap, unitMap) -> units = unitMap ? {}

  #Takes the strings and splits it into tokens
  EQT.tokenize = (expression,getVar) -> 
    tokenlist = []
    #Regexs for each token type
    numx = /^(-?\d+\.?\d*|^-?\.\d+)/
    spacex = /^\s+/
    operx = /^[\+\-\*\/!%\^&|,)\[\]#=]/
    unopx = /^[!%]/
    funcx = /^\w*\(/
    varx = /^[a-zA-Z]+\d*[\:\-\'\?\.]?/
    assignnext = /^\s*=/
    ZERO = new NumberValue "0" 

        #Goes through the expression and splits it using the regexs
    while expression.length > 0
      last = null
      if tokenlist.length > 0
        last= tokenlist[tokenlist.length-1]
      numres = numx.exec(expression)
      if numres
        number = new NumberValue numres[0]
        expression = expression.substring numres[0].length
        if number.compareTo(ZERO)<= 0 and last? and (last is ")" or numx.exec(last)? or varx.exec(last)?)
          tokenlist.push "-"
          tokenlist.push (numres[0]+"").substring(1)+""
        else
          tokenlist.push numres[0]+""
        continue
      spaceres = spacex.exec expression 
      if spaceres 
        expression = expression.substring spaceres[0].length
        continue
      opres = operx.exec expression
      if opres
        tokenlist.push opres[0] 
        expression = expression.substring opres[0].length
        continue
      unopres = unopx.exec expression
      if unopres
        tokenlist.push(unopres[0])
        expression = expression.substring(unopres[0].length)
        continue
      funcres = funcx.exec(expression);
      if funcres
        tokenlist.push funcres[0]
        expression = expression.substring funcres[0].length 
        continue
      varres = varx.exec expression
      if varres
        #Only push text if its a valid variable or unit.  Else ignore
        newexpression = expression.substring varres[0].length
        if getVar(varres[0])? or units[varres[0]] or assignnext.exec(newexpression)
            tokenlist.push(varres[0])
        expression = newexpression
        continue
      return false
    
    addImplicitMultiplication()
    tokenlist

  #Return the token list
  EQT.getList = -> tokenlist 

  #Adds a * between implicitly multiplied items
  addImplicitMultiplication = ->
    opener = /^[)\d\w]+$/
    closer = /^[(\d\w]+$/
    for i in [tokenlist.length - 2..0] by -1
      if opener.exec(tokenlist[i]) and closer.exec(tokenlist[i+1])
        tokenlist.splice(i+1,0,"*")
  EQT

