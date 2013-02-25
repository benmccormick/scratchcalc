/*global ok:false EQTokenizer:false test:false equal:false
    deepEqual:false*/

EQParser.init();
EQParser.setVar("x",5);

var getVar = function(variable){
    if(variable === "x"){
        return 5;
    }
    else{
        return null;
    }

}


test( "Tokenizer Exists", function() {
    ok( (EQTokenizer), "Tokenizer Exists" );
});

test( "Basic Tokenize", function() {
    EQTokenizer.tokenize("1 + 1",getVar);
    var list = EQTokenizer.getList();
    deepEqual( list,["1","+","1"], "1+1 Test" );

    EQTokenizer.tokenize("2 - 2",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["2","-","2"], "2-2 Test" );

    EQTokenizer.tokenize("3 * 4",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["3","*","4"], "3*4 Test" );


    EQTokenizer.tokenize("10 / 2",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["10","/","2"], "10/2 Test" );


    EQTokenizer.tokenize("sin(x)",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["sin(","x",")"], "sin Test" );

});

test( "Negative Numbers", function() {
    EQTokenizer.tokenize("-1 + 2",getVar);
    var list = EQTokenizer.getList();
    deepEqual( list,["-1","+","2"], "-1 + 2 Test" );

    EQTokenizer.tokenize("2 - 2",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["2","-","2"], "2-2 Test" );

    EQTokenizer.tokenize("3 * -4",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["3","*","-4"], "3* -4 Test" );

     EQTokenizer.tokenize("300+7-2",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["300","+","7","-","2"], "300+7-2 Test" );


    EQTokenizer.tokenize("(10) - 2",getVar);
    list = EQTokenizer.getList();
    deepEqual( list,["(","10", ")","-","2"], "(10) - 2 Test" );
});