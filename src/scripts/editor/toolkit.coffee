

String.prototype.chunk = (n) ->  
  ret = [];
  for i in [0..this.length] by n
    ret.push(this.substr(i, n))
  ret

String.prototype.splice = (idx, rem, extras) ->
  extras = extras ? ""
  return (this.slice(0,idx) + extras + this.slice(idx + Math.abs(rem)))

#Should be on array prototype but this randomly blows up bigDecimal
window.getArrayTotal = (arr) ->
  total = 0;
  arr.forEach((num) -> total += parseFloat(num, 25) ? 0)
  total
