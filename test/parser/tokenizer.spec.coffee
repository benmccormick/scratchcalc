
describe "A Tokenizer", ->
  getVar = (variable) ->
      if variable is "x" then 5 else null

  it "exists in the calculator", ->
    expect(EQTokenizer).toBeDefined()

  it "can split a statement into its component parts", ->
    EQTokenizer.tokenize("1 + 1", getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["1","+","1"]

    EQTokenizer.tokenize("2 - 2",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["2","-","2"]

    EQTokenizer.tokenize("3 * 4",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["3","*","4"]


    EQTokenizer.tokenize("10 / 2",getVar)
    list = EQTokenizer.getList()
    
    expect(list).toEqual ["10","/","2"]

    EQTokenizer.tokenize("sin(x)",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["sin(","x",")"]

  it "can handle negative numbers", ->
    EQTokenizer.tokenize("-1 + 2",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["-1","+","2"]

    EQTokenizer.tokenize("2 - 2",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["2","-","2"]

    EQTokenizer.tokenize("3 * -4",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["3","*","-4"]

    EQTokenizer.tokenize("300+7-2",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["300","+","7","-","2"]

    EQTokenizer.tokenize("(10) - 2",getVar)
    list = EQTokenizer.getList()
    expect(list).toEqual ["(","10", ")","-","2"]
