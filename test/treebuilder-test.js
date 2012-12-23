/*global ok:false EQParser:false test:false equal:false
    deepEqual:false NumberValue:false*/
EQParser.init();
EQParser.setPrecision(5);

test( "Basic Parser Sanity", function() {
    var result = EQParser.parse("1+1");
    ok( result.compareTo(new NumberValue("2")) === 0, "1+1 Sanity test" );
});

test( "addition", function() {
    var result = EQParser.parse("1+1");
    ok( result.compareTo(new NumberValue("2")) === 0, "1+1 test" );


    result = EQParser.parse("1+1+2+5+10+200");
    ok( result.compareTo(new NumberValue("219")) === 0, "multiple numbers test" );

    result = EQParser.parse("10 + -5 + 2");
    ok( result.compareTo(new NumberValue("7")) === 0, "Negative number addition test" );

    result = EQParser.parse("-10 + -5 + -2");
    ok( result.compareTo(new NumberValue("-17")) === 0, "Negative number addition test 2" );
});

test( "subtraction", function() {
    var result = EQParser.parse("3-1");
    ok( result.compareTo(new NumberValue("2")) === 0, "3-1 test" );


    result = EQParser.parse("200 - 100 - 50");
    ok( result.compareTo(new NumberValue("50")) === 0, "multiple numbers test" );

    result = EQParser.parse("200 - (100 - 50)");
    ok( result.compareTo(new NumberValue("150")) === 0, "Parens test" );

    result = EQParser.parse("10 - -5 - 2");
    ok( result.compareTo(new NumberValue("13")) === 0, "Negative number subtraction test" );

    result = EQParser.parse("-10 - -5 - -2");
    ok( result.compareTo(new NumberValue("-3")) === 0, "Negative number subtraction test 2" );
});

test( "multiplication", function() {
    var result = EQParser.parse("3*2");
    ok( result.compareTo(new NumberValue("6")) === 0, "3*2 test" );


    result = EQParser.parse("3*2*5");
    ok( result.compareTo(new NumberValue("30")) === 0, "multiple numbers test" );

    result = EQParser.parse("200 * 0.5");
    ok( result.compareTo(new NumberValue("100")) === 0, "Decimal multiplication test" );

    result = EQParser.parse("10 * -5 * 2");
    ok( result.compareTo(new NumberValue("-100")) === 0, 
        "Negative number multiplication test" );

    result = EQParser.parse("-10 * -5 * 2");
    ok( result.compareTo(new NumberValue("100")) === 0,
        "Negative number multiplication test 2" );
});


test( "Division", function() {
    var result = EQParser.parse("10/2");
    ok( result.compareTo(new NumberValue("5")) === 0, "10/2 test" );


    result = EQParser.parse("18/2/3");
    ok( result.compareTo(new NumberValue("3")) === 0, "multiple numbers test" );

    result = EQParser.parse("200 / 0.5");
    ok( result.compareTo(new NumberValue("400")) === 0, "Decimal division test" );

    result = EQParser.parse("10 / -2");
    ok( result.compareTo(new NumberValue("-5")) === 0, 
        "Negative number division test" );

    result = EQParser.parse("-10 / -5 ");
    ok( result.compareTo(new NumberValue("2")) === 0, 
        "Negative number division test 2" );

    result = EQParser.parse("10 / 3 ");
    ok( result.compareTo(new NumberValue("3.33333")) > 0 &&
        result.compareTo(new NumberValue("3.333334")) <0 , 
        "Negative number division test 2" );
});

test( "Factorial", function() {
    var result = EQParser.parse("3!");
    ok( result.compareTo(new NumberValue("6")) === 0, "3! test" );


    result = EQParser.parse("1!");
    ok( result.compareTo(new NumberValue("1")) === 0, "1! test" );

    result = EQParser.parse("2 + 3! + 5");
    ok( result.compareTo(new NumberValue("13")) === 0, 
        "Adding to factorial test" );
});

test( "Precision", function() {
    var result = EQParser.parse("7 / 6 * 12");
    ok( result.compareTo(new NumberValue("14")) === 0, 
        "Division precision test" );
});