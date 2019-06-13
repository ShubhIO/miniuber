module.exports = {
  compare: (lvalue, rvalue, options)=>{
    

var operator = options.hash.operator || "==";

var operators = {
    '==':       function(l,r) { return l == r; },
    '===':      function(l,r) { return l === r; },
    '!=':       function(l,r) { return l != r; },
    '<':        function(l,r) { return l < r; },
    '>':        function(l,r) { return l > r; },
    '<=':       function(l,r) { return l <= r; },
    '>=':       function(l,r) { return l >= r; },
    'typeof':   function(l,r) { return typeof l == r; }
}

if (!operators[operator])
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

var result = operators[operator](lvalue,rvalue);

if( result ) {
    return options.fn(this);
} else {
    return options.inverse(this);
}
  },



}