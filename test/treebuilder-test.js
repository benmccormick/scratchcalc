/*global ok:false EQParser:false test:false equal:false
    deepEqual:false*/
EQParser.init();
EQParser.setPrecision(5);

test( "Basic Parser Sanity", function() {
    var result = EQParser.parse("1+1");
    deepEqual( result.toString(), "2", "1+1 Sanity test" );
});

test( "addition", function() {
    var result = EQParser.parse("1+1");
    deepEqual( result.toString(), "2", "1+1 test" );


    result = EQParser.parse("1+1+2+5+10+200");
    deepEqual( result.toString(), "219", "multiple numbers test" );

    result = EQParser.parse("10 + -5 + 2");
    deepEqual( result.toString(), "7", "Negative number addition test" );

    result = EQParser.parse("-10 + -5 + -2");
    deepEqual( result.toString(), "-17", "Negative number addition test 2" );
});

test( "subtraction", function() {
    var result = EQParser.parse("3-1");
    deepEqual( result.toString(), "2", "3-1 test" );


    result = EQParser.parse("200 - 100 - 50");
    deepEqual( result.toString(), "50", "multiple numbers test" );

    result = EQParser.parse("200 - (100 - 50)");
    deepEqual( result.toString(), "150", "Parens test" );

    result = EQParser.parse("10 - -5 - 2");
    deepEqual( result.toString(), "13", "Negative number subtraction test" );

    result = EQParser.parse("-10 - -5 - -2");
    deepEqual( result.toString(), "-3", "Negative number subtraction test 2" );
});

test( "multiplication", function() {
    var result = EQParser.parse("3*2");
    deepEqual( result.toString(), "6", "3*2 test" );


    result = EQParser.parse("3*2*5");
    deepEqual( result.toString(), "30", "multiple numbers test" );

    result = EQParser.parse("200 * 0.5");
    deepEqual( result.toString(), "100.0", "Decimal multiplication test" );

    result = EQParser.parse("10 * -5 * 2");
    deepEqual( result.toString(), "-100", 
        "Negative number multiplication test" );

    result = EQParser.parse("-10 * -5 * 2");
    deepEqual( result.toString(), "100", 
        "Negative number multiplication test 2" );
});


test( "Division", function() {
    var result = EQParser.parse("10/2");
    deepEqual( result.toString(), "5.00000", "10/2 test" );


    result = EQParser.parse("18/2/3");
    deepEqual( result.toString(), "3.00000", "multiple numbers test" );

    result = EQParser.parse("200 / 0.5");
    deepEqual( result.toString(), "400.00000", "Decimal division test" );

    result = EQParser.parse("10 / -2");
    deepEqual( result.toString(), "-5.000000", 
        "Negative number division test" );

    result = EQParser.parse("-10 / -5 ");
    deepEqual( result.toString(), "2.00000", 
        "Negative number division test 2" );

    result = EQParser.parse("10 / 3 ");
    deepEqual( result.toString(), "3.33333", 
        "Negative number division test 2" );
});

test( "Factorial", function() {
    var result = EQParser.parse("3!");
    deepEqual( result.toString(), "6", "3! test" );


    result = EQParser.parse("1!");
    deepEqual( result.toString(), "1", "1! test" );

    result = EQParser.parse("2 + 3! + 5");
    deepEqual( result.toString(), "13", "Adding to factorial test" );
});

test( "Precision", function() {
    var result = EQParser.parse("7 / 6 * 12");
    deepEqual( result.toString(), "14", "Division precision test test" );

});