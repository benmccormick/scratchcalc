
 /*global BigDecimal:false RoundingMode:false EQParser:false*/


var NumberValue = function(value,units){
    this.num = value;
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
    return new NumberValue(
        nums[0].num.add(nums[1].num),
        (nums[0].units || nums[1].units)
        );
};

NumberValue.prototype.subtract = function(othernumber){
    var nums = convertUnits(this,othernumber);
    return new NumberValue(
        nums[0].num.subtract(nums[1].num),
        (nums[0].units || nums[1].units)
        );
};

NumberValue.prototype.multiply = function(othernumber){
    return new NumberValue(
        this.num.multiply(othernumber.num),
        (this.units || othernumber.units)
        );
};

NumberValue.prototype.divide = function(othernumber,precision,roundingmode){
    return new NumberValue(
        this.num.divide(othernumber.num,precision,roundingmode),
        (this.units||othernumber.units)
        );
};

NumberValue.prototype.compareTo = function(othernumber){
    return this.num.compareTo(othernumber.num);
};

NumberValue.prototype.toString = function(){
    var unitstr = (this.units) ? " "+this.units : "";
    return this.num.toString() + unitstr;
};

/**
* Converts units for when units need to be synced up
* If the units are the same type, but different value, it will work to convert 
* them into the first unit
**/
function convertUnits(num1,num2){
    var info1 = EQParser.getUnitInfo(num1.units);
    var info2 = EQParser.getUnitInfo(num2.units);
    if((!num1.units ||  !num2.units) ||  
        (num1.units === num2.units) ||(info1.type !== info2.type)){
        //if one of the units doesn't exist, they're the same units,
        //or type is not the same, move on
        return [num1,num2];
    }
    else{
        //convert num2 to num1 units
        num2.num = num2.num.divide(new BigDecimal(
            info1.multiple),20,RoundingMode.HALF_DOWN()).multiply(
            new BigDecimal(info2.multiple));
        num2.units = num1.units;
        return [num1, num2];
    }

}

