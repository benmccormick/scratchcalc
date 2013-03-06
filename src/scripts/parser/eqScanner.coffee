###
 * EQScanner - An Equation Token Scanner for Javascript
 * The Scanner module goes through the tokens, identifies them by their class
 *and saves a reference for future lookup 
 * @author Ben McCormick
 ###

window.EQScanner = do ->
  EQS ={};            #the scanner object
  tokens = [];        #holds the tokens being processed
  sym = [];           #symbol table for saving references
  currenttok = "x";   #current token being processed
  currentref = null;  #reference to the current token
  vars ={};          #a map of variables
  units = {};
  # For now these are going to be in code.  Should be moved 
  # To a props file at some point

  funcs = ["sqr(","sqrt(","log(","ln(","exp(","floor(","ceil(","neg(","rnd(",
          "sin(","cos(","tan(","asin(","acos(","atan(","abs(","(","min(",
          "max(","perm(","comb("];
  ops = ["+","-","*","/","^","|","&"];
  puncs = [",",")","#","="];
  unops = ["!","%"];

  EQS.init = (varMap, unitMap) ->
    vars = varMap
    units = unitMap

  #Takes a new set of tokens to process
  EQS.newExpression = (tokenarr) ->
    tokens = tokenarr.reverse()
  
  #Scans the next token, adds it to the symbol table and returns a reference
  #if it is already in the symbol table, it returns the reference
  EQS.scanNext = ->
      tok = nextToken()
      if not tok?
        return null
      numx = /^[\-+]?[0-9]*\.?[0-9]+$/
      varx = /^[A-Za-z]+[0-9]*$/
      #Find the correct category for the current token
      currenttok = if $.inArray(tok,funcs) isnt -1 then "f" else
          if $.inArray(tok,ops) isnt -1 then "b" else
            if $.inArray(tok,unops) isnt -1 then "u" else
              if numx.exec tok then "d" else
                if $.inArray(tok,puncs) isnt -1 then tok else
                  if isUnit tok then  "n" else
                    if varx.exec tok then "v" else errorHandle tok

      if currenttok.indexOf "Error:"  is -1
        setReference(tok)
      # Return the tokensymbol and a reference to it
      {token:currenttok,ref: currentref}


  #Returns true if the scanner has tokens, false otherwise
  EQS.hasTokens = -> tokens.length

  #Gets token data from the reference
  EQS.getRefData = (index) -> sym[index]

  #Gets a variables value
  EQS.getVar = (varname) -> vars[varname];

  #Sets a variables value
  EQS.setVar = (varname, val) -> vars[varname] = val

  #Pops the next token from the token array
  nextToken = -> if tokens.length then tokens.pop() else null   

  #Builds the error string
  errorHandle = (tok) -> "Error: Invalid token - " +tokz

  #Sets the reference for a new token, using existing ref if possible
  setReference = (tok) ->
    currentref = isInSym (tok+"").toLowerCase()
    isDigit = currenttok is "d"
    isPunc = puncs.indexOf(currenttok) > -1 

    if not currentref?
      currentref = sym.length;
      sym.push(
        symbol: currenttok
        text: (tok+"").toLowerCase()
        value: if isDigit then  tok else if isPunc then null else "0"
      )
  
  #Check to see if a token is already in the symbol table
  isInSym = (tok) ->
    #Return the reference if the token is in the symbol table, returns null otherwise
      for symbol, i in sym
        if symbol.text is tok
          return i
      return null

  isUnit = (tok) -> tok in units

  EQS

