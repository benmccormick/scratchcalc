String.prototype.chunk = function(n) {
    var ret = [];
    for(var i=0, len=this.length; i < len; i += n) {
       ret.push(this.substr(i, n))
    }
    return ret
};

String.prototype.splice = function( idx, rem, extras ) {
        extras = (!extras) ? "":extras;
        return (this.slice(0,idx) + extras + this.slice(idx + Math.abs(rem)));
};