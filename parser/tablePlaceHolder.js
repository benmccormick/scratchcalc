//Hold"s the table for now.  Will be replaced when we move to working in windows


var tablePlaceHolder = (function(){
    
    var table =
[["s1",,,,,,,,,,,,,2,,],
 ["e02",,,,,"s5","s6","s7",,,"s8",,,,3,4],
 [,,,,,,,,,,,"acc",,,,],
 ["r10","r10","r10",,"r10",,,,"s9","r10",,,,,,],
 ["s10",,,,"s11",,,,,"s12",,,,,,],
 [,,,,,,"s6",,,,"s14",,,,13,],
 ["r6","r6","r6",,"r6",,,,"r6","r6",,,,,,],
 [,,,,,"s5","s6","s7",,,"s14",,15,,3,16],
 ["r7","r7","r7","s17","r7",,,,"r7","r7",,,,,,],
 ["r12","r12","r12",,"r12",,,,,"r12",,,,,,],
 [,,,,,,,,,,,"r1",,,,],
 [,,,,,"s5","s6","s7",,,"s14",,,,3,18],
 ["r9","r9","r9",,"r9",,,,,"r9",,,,,,],
 ["r8","r8","r8",,"r8",,,,,"r8",,,,,,],
 ["r7","r7","r7",,"r7",,,,"r7","r7",,,,,,],
 [,"s19",,,,,,,,,,,,,,],
 ["e01","r4","s20",,"s11",,,,,"s12",,,,,,],
 [,,,,,"s5","s6","s7",,,"s14",,,,3,21],
 ["r3","r3","r3",,"r3",,,,,"r3",,,,,,],
 ["r11","r11","r11",,"r11",,,,,"r11",,,,,,],
 [,,,,,"s5","s6","s7",,,"s14",,,,3,22],
 ["s23",,,,"s11",,,,,"s12",,,,,,],
 ["e01","r5","e01",,"s11",,,,,"s12",,,,,,],
 [,,,,,,,,,,,"r2",,,,]];
    var terms = ["#",")",",","=","b","c","d","f","n","u","v","$","A","E","N","S"];
    var productions = [{result:null,components:null},
    {result:"E",components:["#","S","#"]},
    {result:"E",components:["#","v","=","S","#"]},
    {result:"S",components:["S","b","S"]},
    {result:"A",components:["S"]},
    {result:"A",components:["S",",","S"]},
    {result:"N",components:["d"]},
    {result:"N",components:["v"]},
    {result:"S",components:["c","N"]},
    {result:"S",components:["S","u"]},
    {result:"S",components:["N"]},
    {result:"S",components:["f","A",")"]},
    {result:"S",components:["N","n"]}];

    //Errors have types warning W, Error E, or Nothing N
    var errors =[
        {message:"Something went wrong", type:"W"},     //E00
        {message:"Unmatched Parentheses", type:"E"},    //E01
        {message:"No Input", type:"N"}                  //E02
    ];

    //Return the configurations
    return {
        table: table,
        terms: terms,
        productions:productions,
        errors:errors
    };

}());