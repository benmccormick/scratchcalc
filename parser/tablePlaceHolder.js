//Hold"s the table for now.  Will be replaced when we move to working in windows


var tablePlaceHolder = (function(){
    
    var table =[
    ["s1" ,"" ,"" ,"" ,"" ,"" ,"" ,"" ,"" ,"" ,"" ],
    ["" ,"" ,"s8" ,"s11","s6" ,"s7" ,"" ,"" ,"" ,"" ,"" ],
    ["s3" ,"s4" ,"" ,"" ,"" ,"","s16" ,"" ,"" ,"" ,"" ],
    ["" ,"" ,"" ,"" ,"" ,"" ,"" ,"" ,"" ,"" ,"acc"],
    ["" ,"" ,"s8" ,"s11","s6" ,"s7" ,"" ,"" ,"" ,"" ,"" ],
    ["r1" ,"r1" ,"" ,"" ,"" ,"" ,"r1" ,"r1" ,"r1" ,"" ,"" ],
    ["r4" ,"r4" ,"" ,"" ,"" ,"" ,"r4" ,"r4" ,"r4" ,"" ,"" ],
    ["r5" ,"r5" ,"" ,"" ,"" ,"" ,"r5" ,"r5" ,"r5" ,"" ,"" ],
    ["" ,"" ,"s8" ,"s11","s6" ,"s7" ,"" ,"" ,"" ,"" ,"" ],
    ["" ,"s4" ,"" ,"" ,"" ,"" ,"s16" ,"" ,"s10","" ,"" ],
    ["r2" ,"r2" ,"" ,"" ,"" ,"" ,"r2" ,"r2" ,"r2" ,"" ,"" ],
    ["" ,"" ,"s8" ,"s11","s6" ,"s7" ,"" ,"" ,"" ,"" ,"" ],
    ["" ,"" ,"" ,"" ,"" ,"" ,"" ,"s13","" ,"" ,"" ],
    ["" ,"" ,"s8" ,"s11","s6" ,"s7" ,"" ,"" ,"" ,"" ,"" ],
    ["" ,"s4" ,"" ,"" ,"" ,"" ,"" ,"" ,"s15","" ,"" ],
    ["r3" ,"r3" ,"" ,"" ,"" ,"r3" ,"r3" ,"r3" ,"" ,"" ,"" ],
    ["r6" ,"r6" ,"" ,"" ,"" ,"" ,"r6" ,"r6" ,"r6" ,"" ,"" ]
    ];
    var terms = ["#","b","f","n","d","v","u",",",")","=","$"];
    var prodstep = ["",2,"","",5,"","","",9,"","",12,"",14,"","",""];
    var productions = [{result:null,components:null,text:null},
    {result:"S",components:["S","b","S"],
        text:"(1) <Segment> > <Segment> <binop> <Segment>"},
    {result:"S",components:["f","S",")"],
        text:"(2) <Segment> > function( <Segment> )"},
    {result:"S",components:["n","S",",","S",")"],
        text:"(3) <Segment> > bifunction( <Segment> , <Segment> )"},
    {result:"S",components:["d"],
        text:"(4) <Segment> > double"},
    {result:"S",components:["v"],
        text:"(5) <Segment> > variable"},
    {result:"S",components:["S","u"],
        text:"(6) <Segment> > <Segment> <unop>"},
    ];

    //Return the configurations
    return {
        table: table,
        terms: terms,
        productions:productions,
        prodstep:prodstep
    };

}());