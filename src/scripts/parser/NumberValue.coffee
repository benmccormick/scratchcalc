# A general class for representing numbers

# TODOS: 
#- Be consistent about whether an operation transforms the current value or creates a new one
#- Add Permutation and combination here.  All the functions should be in this file I think
#- Remove the dependency on eqParser 

root = exports ? this

class root.NumberValue
    constructor: (value,@units,divisor) ->
        @num = new BigDecimal value
        @divisor = divisor ? new BigDecimal 1

    setUnits: (@units) ->
    
    setValue: (@num) ->

    add: (othernumber) ->
        nums = convertUnits(this,othernumber)
        sum = nums[0].num.add(nums[1].num)
        new NumberValue(sum.toString(), 
        (nums[0].units ? nums[1].units),nums[0].divisor)

    subtract: (othernumber) ->
        nums = convertUnits(this,othernumber)
        difference = nums[0].num.subtract(nums[1].num)
        new NumberValue(difference.toString(), 
        (nums[0].units ? nums[1].units),nums[0].divisor)

    multiply: (othernumber) ->
        numerator = this.num.multiply(othernumber.num)
        denominator = this.divisor.multiply(othernumber.divisor)
        new NumberValue(numerator.toString(),
        (this.units || othernumber.units),denominator)

    divide: (othernumber) ->
        numerator = this.num.multiply(othernumber.divisor)
        denominator = this.divisor.multiply othernumber.num
        new NumberValue(numerator.toString(),
        (this.units||othernumber.units),denominator)

    pow: (othernumber) ->
        newval = new NumberValue 1, @units
        othernum = othernumber.num.floatValue()
        otherdiv = othernumber.divisor.floatValue()
        if (othernum/otherdiv) % 1 is 0 
            (newval = newval.multiply this) for i in [0...othernum]
        else
            pow = Math.pow @num.floatValue(), othernum
            newval = new NumberValue(pow,@num.units)
        newval

    ceil: ->
        number = @num.floatValue()
        div = @divisor.floatValue()
        ceil = Math.ceil(number/div)
        num = new BigDecimal ceil
        divisor = new BigDecimal "1"
        new NumberValue num, @units, divisor

    floor: ->
        number = @num.floatValue()
        div = @divisor.floatValue()
        floor = Math.floor(number/div)
        num = new BigDecimal floor
        divisor = new BigDecimal "1"
        new NumberValue num, @units, divisor

    factorial: ->
        #gets the factorial of a number
        limit = @floor()
        num = new NumberValue 1
        for i in [1..limit] by 1
          num= num.multiply(new NumberValue i)
        num

    compareTo: (othernumber)->
        nums = convertUnits this, othernumber
        val1 = getDecimalVal nums[0]
        val2 = getDecimalVal nums[1]
        val1.compareTo(val2)

    toString: ->
        unitstr = if @units? then " "+@units else ""
        decVal = getDecimalVal(this)
        if decVal.floatValue() is 0  
            "0"+unitstr 
        else  
            trimZeros(decVal.toString()) + unitstr



###
* Converts units for when units need to be synced up
* If the units are the same type, but different value, it will work to convert 
* them into the first unit
* Also evens out the divisors
###

convertUnits = (num1,num2) ->
    info1 = EQParser.getUnitInfo num1.units
    info2 = EQParser.getUnitInfo num2.units
    sameunits = num1.units is num2.units
    differentTypes = (info1?.type isnt info2?.type)
    if num1.units? and num2.units? and not (sameunits or differentTypes)
        #convert num2 to num1 units
        multiple = new BigDecimal (info1.multiple/info2.multiple)+""
        num2.num = num2.num.divide multiple, 20, RoundingMode.HALF_DOWN()
        num2.units = num1.units;
    if num1.divisor.compareTo(num2.divisor) isnt 0
        div1 = num1.divisor
        num1.divisor = num1.divisor.multiply num2.divisor
        num1.num = num1.num.multiply num2.divisor
        num2.divisor = num1.divisor
        num2.num = num2.num.multiply div1
    [num1, num2]

trimZeros = (numString) ->
    numString = numString.replace /(\.[0-9]*?)0+$/, "$1"
    numString = numString.replace /\.$/, "" 
    numString

getDecimalVal = (number) ->
    number.num.divide(number.divisor,20, RoundingMode.HALF_DOWN())

