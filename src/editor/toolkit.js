

String.prototype.chunk = function(n) {
    "use strict";
    var ret = [];
    for(var i=0, len=this.length; i < len; i += n) {
       ret.push(this.substr(i, n));
    }
    return ret;
};

String.prototype.splice = function( idx, rem, extras ) {
    "use strict";
        extras = (!extras) ? "":extras;
        return (this.slice(0,idx) + extras + this.slice(idx + Math.abs(rem)));
};

//Should be on array prototype but this randomly blows up bigDecimal
function getArrayTotal(arr){
    "use strict";
    var total = 0;
    arr.forEach(function(num) {
        total += parseFloat(num, 25) || 0;
    });
    return total;
}

/*
Array.prototype.totalSum = function() {
    
};
*/