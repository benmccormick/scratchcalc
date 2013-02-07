
 /*global BigDecimal:false RoundingMode:false EQParser:false*/


var NumberValue = function(value,units,divisor){
    "use strict";
    this.num = new BigDecimal(value);
    this.divisor = divisor || new BigDecimal("1");
    this.units = units;
};

NumberValue.prototype.setUnits = function(unit){
        this.units = unit;
    };

NumberValue.prototype.setValue = function(val){
    this.num=val;
};

NumberValue.prototype.add = function(othernumber){
    var nums = convertUnits(this,othernumber);
    var sum = nums[0].num.add(nums[1].num);
    return new NumberValue(sum.toString(), 
        (nums[0].units || nums[1].units),nums[0].divisor);
};

NumberValue.prototype.subtract = function(othernumber){
    var nums = convertUnits(this,othernumber);
    var difference = nums[0].num.subtract(nums[1].num);
    return new NumberValue(difference.toString(), 
        (nums[0].units || nums[1].units),nums[0].divisor);
};

NumberValue.prototype.multiply = function(othernumber){
    var numerator = this.num.multiply(othernumber.num);
    var denominator = this.divisor.multiply(othernumber.divisor);
    return new NumberValue(numerator.toString(),
        (this.units || othernumber.units),denominator);
};

NumberValue.prototype.divide = function(othernumber){
    var numerator = this.num.multiply(othernumber.divisor);
    var denominator = this.divisor.multiply(othernumber.num);
    return new NumberValue(numerator.toString(),
        (this.units||othernumber.units),denominator);
};

NumberValue.prototype.pow = function(othernumber){
    var i,n;
    var newval = new NumberValue(1,this.units);
    if((othernumber.num.floatValue()/ 
        othernumber.divisor.floatValue()) % 1 === 0){
        i=0,n=othernumber.num.floatValue();
        for(i; i<n; i++){
            newval = newval.multiply(this);
        }
    }
    else{
        newval = new NumberValue(Math.pow(
            this.num.floatValue(),othernumber.num.floatValue()),this.num.units);
    }
    return newval;
};

NumberValue.prototype.ceil = function(othernumber){
    this.num = new BigDecimal(Math.ceil(this.num.floatValue()/ 
        this.divisor.floatValue()));
    this.divisor = new BigDecimal("1");
    return this;
}

NumberValue.prototype.floor = function(othernumber){
    this.num = new BigDecimal(Math.floor(this.num.floatValue()/ 
        this.divisor.floatValue()));
    this.divisor = new BigDecimal("1");
    return this;
}

NumberValue.prototype.compareTo = function(othernumber){
    var nums = convertUnits(this,othernumber);

    return getDecimalVal(nums[0]).compareTo(getDecimalVal(nums[1]));
};

NumberValue.prototype.toString = function(){
    var unitstr = (this.units) ? " "+this.units : "";
    return trimZeros(getDecimalVal(this).toString()) + unitstr;
};

/**
* Converts units for when units need to be synced up
* If the units are the same type, but different value, it will work to convert 
* them into the first unit
* Also evens out the divisors
**/
function convertUnits(num1,num2){
    var info1 = EQParser.getUnitInfo(num1.units);
    var info2 = EQParser.getUnitInfo(num2.units);
    if((!num1.units ||  !num2.units) ||  
        (num1.units === num2.units) ||(info1.type !== info2.type)){
        //if one of the units doesn't exist, they're the same units,
        //or type is not the same, move on
    }
    else{
        //convert num2 to num1 units
        var multiple = new BigDecimal((info1.multiple/info2.multiple)+"");
        num2.num = (num2.num.divide(multiple, 20, RoundingMode.HALF_DOWN()));
        num2.units = num1.units;
    }
    if(num1.divisor.compareTo(num2.divisor) !== 0){
        var div1 = num1.divisor;
        num1.divisor = num1.divisor.multiply(num2.divisor);
        num1.num = num1.num.multiply(num2.divisor);
        num2.divisor = num1.divisor;
        num2.num = num2.num.multiply(div1);
    }
    return [num1, num2];
};

function trimZeros(numString){
    numString = numString.replace(/(\.[0-9]*?)0+$/, "$1"); 
    numString = numString.replace(/\.$/, ""); 
    return numString;             
};

function getDecimalVal(number){
    return number.num.divide(number.divisor,20, RoundingMode.HALF_DOWN());
}