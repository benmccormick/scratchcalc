/**
 * EQTreeBuilder - An Equation TreeBuilder for Javascript
 * 
 *
 * @author Ben McCormick
 **/

 /*global BigDecimal:false tablePlaceHolder:true */

var EQTreeBuilder = (function() {
    var EQB ={};
    var myScan = {};
    var vars = [];  //
    var terms = []; //the different tokentypes
    var table = []; //the table describing the parsing technique
    var prods = [];    //a list of productions

    //Eventually will load table from a file.  For now just defines it in code
    var loadConfigs = function()
    {
        table = tablePlaceHolder.table;
        terms = tablePlaceHolder.terms;
        prods = tablePlaceHolder.productions;
    };

    EQB.init = function(scanner){
        myScan = scanner;
        loadConfigs();
        return {
            value: 2,
            tree: {},
            expression: expression
        };
    };
    return EQB;
}());

