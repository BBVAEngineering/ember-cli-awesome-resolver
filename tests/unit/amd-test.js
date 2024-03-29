/* global requirejs */
import { module, test } from 'qunit';
import amd from '../helpers/amd';

module('Helper: amd', () => {
  test('it defines a module exporting a value', function (assert) {
    const value = {};

    assert.notOk(requirejs.entries.foo);

    amd.define('foo', value);

    assert.ok(requirejs.entries.foo);

    amd.reset();
  });

  test('it requires a module with its value and undefines it', function (assert) {
    const value = {};

    amd.define('foo', value);

    assert.strictEqual(amd.require('foo'), value);
    assert.notOk(requirejs.entries.foo);
  });

  test('it does not undefine a module registered from outside', function (assert) {
    assert.ok(amd.require('ember-cli-awesome-resolver/resolvers/default'));
    assert.ok(
      requirejs.entries['ember-cli-awesome-resolver/resolvers/default']
    );
  });

  test('it reset all registered modules', function (assert) {
    amd.define('foo', {});
    amd.define('bar', {});

    amd.reset();

    assert.notOk(requirejs.entries.foo);
    assert.notOk(requirejs.entries.bar);
  });
});
