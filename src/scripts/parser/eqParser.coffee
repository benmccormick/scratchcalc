###
 EQParser - An Equation Parser for Javascript
 @author Ben McCormick
 ###



root = exports ? this

root.EQParser = do ->
  EQP = {}
  errorInfo = tablePlaceHolder.errors
  unitMap = tablePlaceHolder.units
  varMap = 
    "pi":new NumberValue "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"
  result = {}

  EQP.init = ->
    EQTokenizer.init unitMap
    EQTreeBuilder.init unitMap
    EQScanner.init varMap, unitMap

  EQP.parse = (expression,precision,currentLine) ->
    getVar = if currentLine? then currentLine.getVar.bind(currentLine) else -> null
    tokens = EQTokenizer.tokenize("#"+expression+"#", getVar)
    if not tokens? 
      tokenException =
        message: errorInfo[3].message
        type: errorInfo[3].type
        errorcode: "E03"
      throw tokenException
    if precision?
      EQP.setPrecision precision
    EQScanner.newExpression(tokens)
    try
      result = EQTreeBuilder.process EQScanner, currentLine
      if not result?
        return "" #Invalid Expression
      result.value();
    catch ex
      throw ex;   #if there was an exception throw it for the GUI

  EQP.setPrecision = (prec) ->
    EQTreeBuilder.setPrecision prec 

  EQP.getResult = ->
    result;

  EQP.setVar = (variable, value) -> 
    varMap[variable] = value

  EQP.getVar = (variable) -> varMap[variable]

  EQP.getUnitInfo = (unit) -> return unitMap[unit]

  EQP


