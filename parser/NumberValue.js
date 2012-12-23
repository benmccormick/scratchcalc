
 /*global BigDecimal:false RoundingMode:false EQParser:false*/


var NumberValue = function(value,units){
    this.num = new BigDecimal(value);
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
        (nums[0].units || nums[1].units));
};

NumberValue.prototype.subtract = function(othernumber){
    var nums = convertUnits(this,othernumber);
    var difference = nums[0].num.subtract(nums[1].num);
    return new NumberValue(difference.toString(), 
        (nums[0].units || nums[1].units));
};

NumberValue.prototype.multiply = function(othernumber){
    var product = this.num.multiply(othernumber.num);
    return new NumberValue(product.toString(),
        (this.units || othernumber.units)
        );
};

NumberValue.prototype.divide = function(othernumber){
    var quotient = this.num.divide(othernumber.num, 20,RoundingMode.HALF_UP());
    return new NumberValue(quotient.toString(),
        (this.units||othernumber.units)
        );
};

NumberValue.prototype.compareTo = function(othernumber){
    var nums = convertUnits(this,othernumber);
    return nums[0].num.compareTo(nums[1].num);
};

NumberValue.prototype.toString = function(){
    var unitstr = (this.units) ? " "+this.units : "";
    return trimZeros(this.num.toString()) + unitstr;
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
        var multiple = new BigDecimal((info1.multiple/info2.multiple)+"");
        num2.num = (num2.num.divide(multiple, 20, RoundingMode.HALF_DOWN()));
        num2.units = num1.units;
        return [num1, num2];
    }

};

function trimZeros(numString){
    numString = numString.replace(/(\.[0-9]*?)0+$/, "$1"); 
    numString = numString.replace(/\.$/, ""); 
    return numString;             
};

