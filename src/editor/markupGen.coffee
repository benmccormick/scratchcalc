###
 * markupGen - generates the syntax highlighting for the calculator
 * 
 *
 * @author Ben McCormick
 ###


window.markupGen = do ->
  mG = {}
  currentVarFunc = -> null
  mG.markup = (expression,getVar) ->
    currentVarFunc = getVar
    output = expression.replace(/\s/g,"&nbsp;")
    #Removed & for now because it breaks &nbsp;  should add again later
    output = output.replace(/[\+\-\*\/!%\^|,\[\]!#\=]/g,"<span class=\"operator\">$&</span>")
      .replace(/\b\d+/g,"<span class=\"number\">$&</span>")
      .replace(/\w*\(/g,"<span class=\"function\">$&</span>")
      .replace(/\)/g,"<span class=\"function\">$&</span>")
      .replace(/[a-zA-Z]+\d*/g,returnTextValue)
    output;
    
  returnTextValue = (text) ->
    vartext = "<span class=\"variable\">"+text+"</span>";
    if currentVarFunc(text,false)
      vartext
    else
      #don't try to style this because you catch all the previous span tags
      return text
  mG
