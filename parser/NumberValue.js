    var NumberValue = function(value,units){
        this.num = value;
        this.units = units;

        this.setUnits = function(unit){
            this.units = unit;
        };

        this.setValue = function(val){
            this.num=value;
        };

        this.add = function(othernumber){
            return new NumberValue(
                this.num.add(othernumber.num),
                (this.units || othernumber.units)
                );
        };

        this.subtract = function(othernumber){
            return new NumberValue(
                this.num.subtract(othernumber.num),
                (this.units || othernumber.units)
                );
        };

        this.multiply = function(othernumber){
            return new NumberValue(
                this.num.multiply(othernumber.num),
                (this.units || othernumber.units)
                );
        };

        this.divide = function(othernumber,precision,roundingmode){
            return new NumberValue(
                this.num.divide(othernumber.num,precision,roundingmode),
                (this.units|othernumber.units)
                );
        };

        this.compareTo = function(othernumber){
            return this.num.compareTo(othernumber.num);
        };

        this.toString = function(){
            var unitstr = (this.units) ? " "+this.units : "";
            return this.num.toString() + unitstr;
        };
    }