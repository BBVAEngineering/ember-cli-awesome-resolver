/* eslint-disable ember/classic-decorator-hooks */
import { run } from '@ember/runloop';
import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import Resolver from 'ember-cli-awesome-resolver/resolvers/default';
import cases from 'qunit-parameterize';
import Application from '@ember/application';
import config from '../../config/environment';
import amd from '../helpers/amd';
import profile from '../helpers/profile';

let application, registry;

module('Unit | Resolver | default', (hooks) => {
  hooks.beforeEach(() => {
    class BaseApplication extends Application {
      name = 'application';
      modulePrefix = config.modulePrefix;
      podModulePrefix = config.podModulePrefix;
      Resolver = class extends Resolver {
        namespaces = ['dummy'];
        pluralizedTypes = {
          config: 'config',
        };
      };

      init() {
        super.init(...arguments);
        this.deferReadiness();
      }

      toString() {
        return 'application';
      }
    }

    run(() => {
      application = BaseApplication.create();
      registry = application.__registry__;
    });
  });

  hooks.afterEach(() => {
    amd.reset();

    application.destroy();
    application = null;
  });

  test('it generates default pluralizedTypes', function (assert) {
    class BaseApplication extends Application {
      modulePrefix = config.modulePrefix;
      podModulePrefix = config.podModulePrefix;
      Resolver = Resolver;
    }

    run(() => {
      application = BaseApplication.create();
      registry = application.__registry__;
    });

    const object = EmberObject;

    amd.define('dummy/config/foo', object);

    assert.strictEqual(registry.resolve('config:foo'), object);
  });

  cases([
    // Main based.
    { title: 'main', input: 'object:main', output: 'dummy/object' },

    // Engine based.
    { title: 'engine', input: 'engine:foo', output: 'foo/engine' },

    // Route-map based.
    { title: 'route-map', input: 'route-map:foo', output: 'foo/routes' },

    // Type based.
    { title: 'type base', input: 'object:foo', output: 'dummy/objects/foo' },
    {
      title: 'type base namespace',
      input: 'template:foo/bar',
      output: 'dummy/templates/foo/bar',
    },
    {
      title: 'type dot',
      input: 'object:foo.bar',
      output: 'dummy/objects/foo/bar',
    },
    {
      title: 'type dot namespace',
      input: 'template:foo/foo.bar',
      output: 'dummy/templates/foo/foo/bar',
    },
    {
      title: 'type camel',
      input: 'object:fooBar',
      output: 'dummy/objects/foo-bar',
    },
    {
      title: 'type camel namespace',
      input: 'template:foo/fooBar',
      output: 'dummy/templates/foo/foo-bar',
    },
    {
      title: 'type dash',
      input: 'object:foo-bar',
      output: 'dummy/objects/foo-bar',
    },
    {
      title: 'type dash namespace',
      input: 'template:foo/foo-bar',
      output: 'dummy/templates/foo/foo-bar',
    },
    {
      title: 'type lowdash',
      input: 'object:foo_bar',
      output: 'dummy/objects/foo/bar',
    },
    {
      title: 'type lowdash namespace',
      input: 'template:foo/foo_bar',
      output: 'dummy/templates/foo/foo/bar',
    },
    {
      title: 'type partial',
      input: 'object:_foo-bar',
      output: 'dummy/objects/_foo-bar',
    },
    {
      title: 'type partial namespace',
      input: 'template:foo/_foo-bar',
      output: 'dummy/templates/foo/_foo-bar',
    },
    {
      title: 'type partial cli',
      input: 'object:-foo-bar',
      output: 'dummy/objects/-foo-bar',
    },
    {
      title: 'type partial cli namespace',
      input: 'template:foo/-foo-bar',
      output: 'dummy/templates/foo/-foo-bar',
    },
    {
      title: 'type multi',
      input: 'object:foo.bar.wow',
      output: 'dummy/objects/foo/bar/wow',
    },

    // Pod based.
    { title: 'pod base', input: 'object:foo', output: 'dummy/pods/foo/object' },
    {
      title: 'pod base namespace',
      input: 'template:foo/bar',
      output: 'dummy/pods/foo/bar/template',
    },
    {
      title: 'pod dot',
      input: 'object:foo.bar',
      output: 'dummy/pods/foo/bar/object',
    },
    {
      title: 'pod dot namespace',
      input: 'template:foo/foo.bar',
      output: 'dummy/pods/foo/foo/bar/template',
    },
    {
      title: 'pod camel',
      input: 'object:fooBar',
      output: 'dummy/pods/foo-bar/object',
    },
    {
      title: 'pod camel namespace',
      input: 'template:foo/fooBar',
      output: 'dummy/pods/foo/foo-bar/template',
    },
    {
      title: 'pod dash',
      input: 'object:foo-bar',
      output: 'dummy/pods/foo-bar/object',
    },
    {
      title: 'pod dash namespace',
      input: 'template:foo/foo-bar',
      output: 'dummy/pods/foo/foo-bar/template',
    },
    {
      title: 'pod lowdash',
      input: 'object:foo_bar',
      output: 'dummy/pods/foo/bar/object',
    },
    {
      title: 'pod lowdash namespace',
      input: 'template:foo/foo_bar',
      output: 'dummy/pods/foo/foo/bar/template',
    },
    {
      title: 'pod partial',
      input: 'object:_foo-bar',
      output: 'dummy/pods/_foo-bar/object',
    },
    {
      title: 'pod partial namespace',
      input: 'template:foo/_foo-bar',
      output: 'dummy/pods/foo/_foo-bar/template',
    },
    {
      title: 'pod partial cli',
      input: 'object:-foo-bar',
      output: 'dummy/pods/-foo-bar/object',
    },
    {
      title: 'pod partial cli namespace',
      input: 'template:foo/-foo-bar',
      output: 'dummy/pods/foo/-foo-bar/template',
    },
    {
      title: 'pod multi',
      input: 'object:foo.bar.wow',
      output: 'dummy/pods/foo/bar/wow/object',
    },
  ]).test('it loads modules from loader.js ', (params, assert) => {
    const object = EmberObject;

    amd.define(params.output, object);

    assert.equal(registry.resolve(params.input), object);
  });

  test('it does not resolve when not found', function (assert) {
    assert.notOk(registry.resolve('foo:bar'));
  });

  test('it loads components modules from loader.js', function (assert) {
    const object = Component;

    amd.define('dummy/pods/components/foo/component', object);

    assert.strictEqual(registry.resolve('component:foo'), object);
  });

  test('it loads components modules from loader.js when required twice', function (assert) {
    const object = Component;

    amd.define('dummy/pods/components/foo/component', object);

    assert.strictEqual(registry.resolve('component:foo'), object);
    assert.strictEqual(registry.resolve('component:foo'), object);
  });

  test('it looks up for namespaces in application', function (assert) {
    application.set('namespaces', ['app', 'dummy']);

    const object = EmberObject;

    amd.define('app/objects/foo', object);

    assert.strictEqual(registry.resolve('object:foo'), object);
  });

  cases([
    // Main based.
    {
      title: 'main',
      type: 'object',
      input: 'dummy/object',
      output: 'object:main',
    },

    // Engine based.
    {
      title: 'engine',
      type: 'engine',
      input: 'foo/engine',
      output: 'engine:foo',
    },

    // Route-map based.
    {
      title: 'route-map',
      type: 'route-map',
      input: 'foo/routes',
      output: 'route-map:foo',
    },

    // Type based.
    {
      title: 'type base',
      type: 'object',
      input: 'dummy/objects/bar',
      output: 'object:bar',
    },
    {
      title: 'type complex',
      type: 'object',
      input: 'dummy/objects/bar/baz',
      output: 'object:bar/baz',
    },

    // Pod based.
    {
      title: 'pod base',
      type: 'object',
      input: 'dummy/pods/bar/object',
      output: 'object:bar',
    },
    {
      title: 'pod complex',
      type: 'object',
      input: 'dummy/pods/bar/baz/object',
      output: 'object:bar/baz',
    },
  ]).test('it looks up for a type given ', (params, assert) => {
    const object = EmberObject;

    amd.define(params.input, object);

    assert.ok(registry.knownForType(params.type)[params.output]);
  });

  test('it does not look up for a type given', function (assert) {
    amd.define('foo/routes', {});

    assert.deepEqual(registry.knownForType('engine'), {});
  });

  test('it looks up for components', function (assert) {
    const object = Component;

    amd.define('dummy/pods/components/foo/component', object);

    assert.ok(registry.knownForType('component')['component:foo']);
  });

  test('it looks up only on defined namespaces', function (assert) {
    const object = Component;

    amd.define('foo/pods/components/foo/component', object);

    assert.notOk(registry.knownForType('component')['component:foo']);
  });

  test('it does not lookup on other types', function (assert) {
    const object = Component;

    amd.define('dummy/controllers/foo', object);

    assert.notOk(registry.knownForType('view')['controller:foo']);
  });

  cases([
    // Main based.
    { title: 'main', input: 'dummy/object', output: 'object:main' },

    // Engine based.
    { title: 'engine', input: 'foo/engine', output: 'engine:foo' },

    // Route-map based.
    { title: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

    // Type based.
    { title: 'type base', input: 'dummy/objects/bar', output: 'object:bar' },
    {
      title: 'type complex',
      input: 'dummy/objects/bar/baz',
      output: 'object:bar/baz',
    },

    // Pod based.
    { title: 'pod base', input: 'dummy/pods/bar/object', output: 'object:bar' },
    {
      title: 'pod complex',
      input: 'dummy/pods/bar/baz/object',
      output: 'object:bar/baz',
    },
  ]).test('it lookups description of modules ', (params, assert) => {
    const object = EmberObject;

    amd.define(params.input, object);

    assert.equal(registry.describe(params.output), params.input);
  });

  test('it makes up description to string when module is not found', function (assert) {
    assert.strictEqual(
      registry.describe('object:main'),
      `${application.name}@object:main`
    );
  });

  cases([
    // Main based.
    {
      title: 'main',
      input: 'dummy/object',
      output: 'object:main',
      toString: 'dummy@object:main',
    },

    // Engine based.
    {
      title: 'engine',
      input: 'foo/engine',
      output: 'engine:foo',
      toString: 'foo@engine:main',
    },

    // Route-map based.
    {
      title: 'route-map',
      input: 'foo/routes',
      output: 'route-map:foo',
      toString: 'foo@route-map:main',
    },

    // Type based.
    {
      title: 'type base',
      input: 'dummy/objects/bar',
      output: 'object:bar',
      toString: 'dummy@object:bar',
    },
    {
      title: 'type complex',
      input: 'dummy/objects/bar/baz',
      output: 'object:bar/baz',
      toString: 'dummy@object:bar/baz',
    },

    // Pod based.
    {
      title: 'pod base',
      input: 'dummy/pods/bar/object',
      output: 'object:bar',
      toString: 'dummy@object:bar',
    },
    {
      title: 'pod complex',
      input: 'dummy/pods/bar/baz/object',
      output: 'object:bar/baz',
      toString: 'dummy@object:bar/baz',
    },
  ]).test('it makes ember object to string', (params, assert) => {
    const object = EmberObject;

    amd.define(params.input, object);

    const factory = registry.resolve(params.output);

    assert.equal(
      registry.resolver.makeToString(factory, params.output),
      params.toString
    );
  });

  test('it makes raw object to string', function (assert) {
    const object = {};

    amd.define('dummy/objects/foo', object);

    const factory = registry.resolve('object:foo');

    assert.strictEqual(
      registry.resolver.makeToString(factory, 'object:foo'),
      'dummy@object:foo:'
    );
  });

  test('it makes object to string when module is absolute', function (assert) {
    const object = {
      _moduleName: 'foo',
    };

    amd.define('foo', object);

    assert.strictEqual(
      registry.resolver.makeToString(object, 'object:foo'),
      'undefined@undefined:undefined'
    );
  });

  test('it resolves non factory modules', function (assert) {
    const object = {};

    amd.define('dummy/objects/foo', object);

    assert.strictEqual(registry.resolve('object:foo'), object);
  });

  test('it resolves names with namespace', function (assert) {
    const object = EmberObject;

    amd.define('dummy/objects/foo', object);

    assert.strictEqual(registry.resolve('dummy@object:foo'), object);
  });

  test('it resolves names with ember cli namespace', function (assert) {
    const object = EmberObject;

    amd.define('dummy/objects/foo', object);

    assert.strictEqual(registry.resolve('object:dummy@foo'), object);
  });

  test('it does not throw an error when there are unknown modules', function (assert) {
    const object = EmberObject;

    amd.define('dummy/objects/foo', object);

    amd.define('bar', {});

    assert.ok(registry.knownForType('object'));
  });

  test('it looks up on pluralized dictionary', function (assert) {
    const object = EmberObject;

    amd.define('dummy/config/foo', object);

    assert.strictEqual(registry.resolve('config:foo'), object);
  });

  test('it is a module based resolver', function (assert) {
    assert.true(registry.resolver.get('moduleBasedResolver'));
  });

  cases([
    // Main based.
    { title: 'main', input: 'dummy/object', output: 'object:main' },

    // Engine based.
    { title: 'engine', input: 'foo/engine', output: 'engine:foo' },

    // Route-map based.
    { title: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

    // Type based.
    { title: 'type base', input: 'dummy/objects/bar', output: 'object:bar' },
    {
      title: 'type complex',
      input: 'dummy/objects/bar/baz',
      output: 'object:bar/baz',
    },

    // Pod based.
    { title: 'pod base', input: 'dummy/pods/bar/object', output: 'object:bar' },
    {
      title: 'pod complex',
      input: 'dummy/pods/bar/baz/object',
      output: 'object:bar/baz',
    },
  ]).test('it resolves under 1 ms ', (params, assert) => {
    const object = Component;

    amd.define(params.input, object);

    const res = profile(() => registry.resolve(params.output));

    assert.ok(res.mean < 1, 'resolves under 1 ms');
  });

  cases([
    // Main based.
    {
      title: 'main',
      type: 'object',
      input: 'dummy/object',
      output: 'object:main',
    },

    // Engine based.
    {
      title: 'engine',
      type: 'engine',
      input: 'foo/engine',
      output: 'engine:foo',
    },

    // Route-map based.
    {
      title: 'route-map',
      type: 'route-map',
      input: 'foo/routes',
      output: 'route-map:foo',
    },

    // Type based.
    {
      title: 'type base',
      type: 'object',
      input: 'dummy/objects/bar',
      output: 'object:bar',
    },
    {
      title: 'type complex',
      type: 'object',
      input: 'dummy/objects/bar/baz',
      output: 'object:bar/baz',
    },

    // Pod based.
    {
      title: 'pod base',
      type: 'object',
      input: 'dummy/pods/bar/object',
      output: 'object:bar',
    },
    {
      title: 'pod complex',
      type: 'object',
      input: 'dummy/pods/bar/baz/object',
      output: 'object:bar/baz',
    },
  ]).test('it knows for types under 1 ms ', (params, assert) => {
    const object = Component;

    amd.define(params.input, object);

    const res = profile(
      () => registry.knownForType(params.type)[params.output]
    );

    assert.ok(res.mean < 1, 'resolves under 1 ms');
  });

  cases([
    // Main based.
    { title: 'main', input: 'dummy/object', output: 'object:main' },

    // Engine based.
    { title: 'engine', input: 'foo/engine', output: 'engine:foo' },

    // Route-map based.
    { title: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

    // Type based.
    { title: 'type base', input: 'dummy/objects/bar', output: 'object:bar' },
    {
      title: 'type complex',
      input: 'dummy/objects/bar/baz',
      output: 'object:bar/baz',
    },

    // Pod based.
    { title: 'pod base', input: 'dummy/pods/bar/object', output: 'object:bar' },
    {
      title: 'pod complex',
      input: 'dummy/pods/bar/baz/object',
      output: 'object:bar/baz',
    },
  ]).test('it resolves under 1 ms ', (params, assert) => {
    const object = Component;

    amd.define(params.input, object);

    const factory = registry.resolve(params.output);

    const res = profile(() =>
      registry.resolver.makeToString(factory, params.output)
    );

    assert.ok(res.mean < 1, 'resolves under 1 ms');
  });
});
