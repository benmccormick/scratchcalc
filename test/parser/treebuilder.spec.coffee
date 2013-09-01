#### A Suite of Tests for the TreeBuilder Module
# The treeBuilder module is where we run through the parse table 
#for each expression and produce a result or throw an error

describe "A TreeBuilder" , ->

  it "exists in the calculator" , ->
    expect(EQTreeBuilder).toBeDefined()

  it "can calculate expressions" , ->
    result = EQParser.parse "1+1"
    number = new NumberValue("2")
    comparison = result.compareTo number
    expect(comparison).toEqual(0)

  describe "specifically " , ->

    it "can add numbers" , ->
      #### Sanity Test
      result = EQParser.parse "1+1"
      number = new NumberValue("2")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Basic Multi-number test
      result = EQParser.parse "1+1+2+5+10+200"
      number = new NumberValue("219")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number Test
      result = EQParser.parse "10 + -5 + 2"
      number = new NumberValue("7")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number Test
      result = EQParser.parse "-10 + -5 + -2"
      number = new NumberValue("-17")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

    it "can subtract numbers" , ->

      #### Sanity Test
      result = EQParser.parse "3-1"
      number = new NumberValue("2")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Multiple Subtraction Test
      result = EQParser.parse "200-100-50"
      number = new NumberValue("50")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Parentheses Test
      result = EQParser.parse "200-(100 -50)"
      number = new NumberValue("150")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number Test Test
      result = EQParser.parse "10- -5 - 2"
      number = new NumberValue("13")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number Test Test
      result = EQParser.parse "-10- -5 - -2"
      number = new NumberValue("-3")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

    it "can multiply numbers" , ->

      #### Sanity Test
      result = EQParser.parse "3*2"
      number = new NumberValue("6")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Multiple Multiplication Test
      result = EQParser.parse "3*2*5"
      number = new NumberValue("30")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Decimal test
      result = EQParser.parse "200* 0.5"
      number = new NumberValue("100")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number Test 
      result = EQParser.parse "10* -5 * 2"
      number = new NumberValue("-100")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number cancellation test
      result = EQParser.parse "-10 * -5 * 2"
      number = new NumberValue("100")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)
  
    it "can divide numbers" , ->

      #### Sanity Test
      result = EQParser.parse "10/2"
      number = new NumberValue("5")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Multiple Division Test
      result = EQParser.parse "18/2/3"
      number = new NumberValue("3")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Decimal test
      result = EQParser.parse "200 / 0.5"
      number = new NumberValue("400")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number Test 
      result = EQParser.parse "10/ -2"
      number = new NumberValue("-5")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### Negative Number cancellation test
      result = EQParser.parse "-10 / -5"
      number = new NumberValue("2")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

    it "can handle factorials" , ->

      #### Sanity Test
      result = EQParser.parse "3!"
      number = new NumberValue("6")
      comparison = result.compareTo number
      console.log "sanity",number.toString(),result.toString()
      expect(comparison).toEqual(0)

      #### 1 Edge case
      result = EQParser.parse "1!"
      number = new NumberValue("1")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)

      #### 0 edge case
      result = EQParser.parse "1!"
      number = new NumberValue("1")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)
    
      #### Test with parens
      result = EQParser.parse "(6-2)!"
      number = new NumberValue("24")
      comparison = result.compareTo number
      expect(comparison).toEqual(0)
  

  
