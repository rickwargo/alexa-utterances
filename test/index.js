var utterances = require('../');
var test       = require('tap').test;


test('basic usage', function (t) {
  var dictionary = {};
  var slots = {};
  var template = 'do the thing';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ 'do the thing' ]);
  t.end();
});


test('optional terms', function (t) {
  var dictionary = {};
  var slots = {};
  var template = 'do (it |)';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ 'do it ', 'do ' ]);
  t.end();
});


test('optional terms with curly braces', function (t) {
  var dictionary = {};
  var slots = {};
  var template = 'do {it |}';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ 'do it ', 'do ' ]);
  t.end();
});


test('dictionary expansion', function (t) {
  var dictionary = { adjustments: [ 'dim', 'brighten' ] };
  var slots = { Adjustment: 'LITERAL' };
  var template = '{adjustments|Adjustment} the light';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ '{dim|Adjustment} the light',
    '{brighten|Adjustment} the light'
  ]);
  t.end();
});


test('dictionary expansion with parens', function (t) {
  var dictionary = { adjustments: [ 'dim', 'brighten' ] };
  var slots = { Adjustment: 'LITERAL' };
  var template = '(adjustments|Adjustment) the light';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ '{dim|Adjustment} the light',
    '{brighten|Adjustment} the light'
  ]);
  t.end();
});


test('dictionary expansion with parens (no slots)', function (t) {
  var dictionary = { adjustments: [ 'dim', 'brighten' ] };
  var slots = { };
  var template = '(adjustments|adjust) the light';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ 'dim the light',
    'brighten the light',
    'adjust the light'
  ]);
  t.end();
});


test('simple number range expansion', function (t) {
  var dictionary = {};
  var slots = { };
  var template = 'set brightness to (1-3)';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ "set brightness to one",
    "set brightness to two",
    "set brightness to three"
  ]);
  t.end();
});

test('simple number range expansion using by', function (t) {
  var dictionary = {};
  var slots = { };
  var template = "buy (5-20 by 5) items";

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [
    "buy five items",
    "buy ten items",
    "buy fifteen items",
    "buy twenty items"
  ]);
  t.end();
});


test('number range expansion', function (t) {
  var dictionary = {};
  var slots = { Brightness: 'NUMBER' };
  var template = 'set brightness to {1-3|Brightness}';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ "set brightness to {one|Brightness}",
    "set brightness to {two|Brightness}",
    "set brightness to {three|Brightness}"
  ]);
  t.end();
});

test('number range expansion with parens', function (t) {
  var dictionary = {};
  var slots = { Brightness: 'NUMBER' };
  var template = 'set brightness to (1-3|Brightness)';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ "set brightness to {one|Brightness}",
    "set brightness to {two|Brightness}",
    "set brightness to {three|Brightness}"
  ]);
  t.end();
});

test('exhaustive vs non-exhaustive expansion', function (t) {
  var dictionary = { "movie_names": ["star wars", "inception", "gattaca", "the matrix"] };
  var slots = { "MOVIE": "LITERAL" };
  var template = "(foo|bar|baz) (foo|bar|baz) {movie_names|MOVIE}";
  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [
    "foo foo {star wars|MOVIE}",
    "bar foo {inception|MOVIE}",
    "baz foo {gattaca|MOVIE}",
    "foo bar {the matrix|MOVIE}",
    "bar bar {star wars|MOVIE}",
    "baz bar {inception|MOVIE}",
    "foo baz {gattaca|MOVIE}",
    "bar baz {the matrix|MOVIE}",
    "baz baz {star wars|MOVIE}"
  ]);

  var result2 = utterances(template, slots, dictionary, true);
  t.deepEqual(result2, [
    "foo foo {star wars|MOVIE}",
    "bar foo {star wars|MOVIE}",
    "baz foo {star wars|MOVIE}",
    "foo bar {star wars|MOVIE}",
    "bar bar {star wars|MOVIE}",
    "baz bar {star wars|MOVIE}",
    "foo baz {star wars|MOVIE}",
    "bar baz {star wars|MOVIE}",
    "baz baz {star wars|MOVIE}",
    "foo foo {inception|MOVIE}",
    "bar foo {inception|MOVIE}",
    "baz foo {inception|MOVIE}",
    "foo bar {inception|MOVIE}",
    "bar bar {inception|MOVIE}",
    "baz bar {inception|MOVIE}",
    "foo baz {inception|MOVIE}",
    "bar baz {inception|MOVIE}",
    "baz baz {inception|MOVIE}",
    "foo foo {gattaca|MOVIE}",
    "bar foo {gattaca|MOVIE}",
    "baz foo {gattaca|MOVIE}",
    "foo bar {gattaca|MOVIE}",
    "bar bar {gattaca|MOVIE}",
    "baz bar {gattaca|MOVIE}",
    "foo baz {gattaca|MOVIE}",
    "bar baz {gattaca|MOVIE}",
    "baz baz {gattaca|MOVIE}",
    "foo foo {the matrix|MOVIE}",
    "bar foo {the matrix|MOVIE}",
    "baz foo {the matrix|MOVIE}",
    "foo bar {the matrix|MOVIE}",
    "bar bar {the matrix|MOVIE}",
    "baz bar {the matrix|MOVIE}",
    "foo baz {the matrix|MOVIE}",
    "bar baz {the matrix|MOVIE}",
    "baz baz {the matrix|MOVIE}"
  ]);
  t.end();
});

test('exhaustive vs non-exhaustive expansion with curly braces', function (t) {
  var dictionary = { "movie_names": ["star wars", "inception", "gattaca", "the matrix"] };
  var slots = { "MOVIE": "LITERAL" };
  var template = "{foo|bar|baz} {foo|bar|baz} {movie_names|MOVIE}";
  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [             // note: iteration is sequenced after each invocation, each test will need to account for a different starting value
    "foo foo {inception|MOVIE}",
    "bar foo {gattaca|MOVIE}",
    "baz foo {the matrix|MOVIE}",
    "foo bar {star wars|MOVIE}",
    "bar bar {inception|MOVIE}",
    "baz bar {gattaca|MOVIE}",
    "foo baz {the matrix|MOVIE}",
    "bar baz {star wars|MOVIE}",
    "baz baz {inception|MOVIE}"
  ]);

  var result2 = utterances(template, slots, dictionary, true);
  t.deepEqual(result2, [
    "foo foo {star wars|MOVIE}",
    "bar foo {star wars|MOVIE}",
    "baz foo {star wars|MOVIE}",
    "foo bar {star wars|MOVIE}",
    "bar bar {star wars|MOVIE}",
    "baz bar {star wars|MOVIE}",
    "foo baz {star wars|MOVIE}",
    "bar baz {star wars|MOVIE}",
    "baz baz {star wars|MOVIE}",
    "foo foo {inception|MOVIE}",
    "bar foo {inception|MOVIE}",
    "baz foo {inception|MOVIE}",
    "foo bar {inception|MOVIE}",
    "bar bar {inception|MOVIE}",
    "baz bar {inception|MOVIE}",
    "foo baz {inception|MOVIE}",
    "bar baz {inception|MOVIE}",
    "baz baz {inception|MOVIE}",
    "foo foo {gattaca|MOVIE}",
    "bar foo {gattaca|MOVIE}",
    "baz foo {gattaca|MOVIE}",
    "foo bar {gattaca|MOVIE}",
    "bar bar {gattaca|MOVIE}",
    "baz bar {gattaca|MOVIE}",
    "foo baz {gattaca|MOVIE}",
    "bar baz {gattaca|MOVIE}",
    "baz baz {gattaca|MOVIE}",
    "foo foo {the matrix|MOVIE}",
    "bar foo {the matrix|MOVIE}",
    "baz foo {the matrix|MOVIE}",
    "foo bar {the matrix|MOVIE}",
    "bar bar {the matrix|MOVIE}",
    "baz bar {the matrix|MOVIE}",
    "foo baz {the matrix|MOVIE}",
    "bar baz {the matrix|MOVIE}",
    "baz baz {the matrix|MOVIE}"
  ]);
  t.end();
});

test('raw curly braces for custom slot types', function (t) {
  var dictionary = {};
  var slots = {"Artist": "CUSTOM_TYPE"};
  var template = "(my|your) (favorite|least favorite) fruit is {-|Fruit}";

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [
    "my favorite fruit is {Fruit}",
    "your favorite fruit is {Fruit}",
    "my least favorite fruit is {Fruit}",
    "your least favorite fruit is {Fruit}"
  ]);
  t.end();
});

test('raw curly braces for new custom slot types', function (t) {
  var dictionary = {};
  var slots = {"Artist": "CUSTOM_TYPE"};
  var template = "(my|your) (favorite|least favorite) fruit is {Fruit}";

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [
    "my favorite fruit is {Fruit}",
    "your favorite fruit is {Fruit}",
    "my least favorite fruit is {Fruit}",
    "your least favorite fruit is {Fruit}"
  ]);
  t.end();
});
