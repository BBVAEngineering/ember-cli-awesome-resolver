import Ember from 'ember';
import {
	module,
	test
} from 'qunit';
import ResolverMixin from 'ember-cli-awesome-resolver/mixins/resolver';
import cases from '../helpers/cases';
import amd from '../helpers/amd';
import profile from '../helpers/profile';

const Resolver = Ember.DefaultResolver.extend(ResolverMixin, {
	namespaces: ['core']
});
let application, registry;

module('Unit | Mixin | resolver', {
	beforeEach() {
		application = Ember.run(Ember.Application, 'create', {
			Resolver
		});

		registry = application.__registry__;
	},
	afterEach() {
		amd.reset();

		Ember.run(application, 'destroy');
	}
});

cases([
	// Main based.
	{ title: 'main', input: 'object:main', output: 'core/object' },

	// Type based.
	{ title: 'type base', input: 'object:foo', output: 'core/objects/foo' },
	{ title: 'type base namespace', input: 'template:foo/bar', output: 'core/templates/foo/bar' },
	{ title: 'type dot', input: 'object:foo.bar', output: 'core/objects/foo/bar' },
	{ title: 'type dot namespace', input: 'template:foo/foo.bar', output: 'core/templates/foo/foo/bar' },
	{ title: 'type camel', input: 'object:fooBar', output: 'core/objects/foo-bar' },
	{ title: 'type camel namespace', input: 'template:foo/fooBar', output: 'core/templates/foo/foo-bar' },
	{ title: 'type dash', input: 'object:foo-bar', output: 'core/objects/foo-bar' },
	{ title: 'type dash namespace', input: 'template:foo/foo-bar', output: 'core/templates/foo/foo-bar' },
	{ title: 'type lowdash', input: 'object:foo_bar', output: 'core/objects/foo/bar' },
	{ title: 'type lowdash namespace', input: 'template:foo/foo_bar', output: 'core/templates/foo/foo/bar' },
	{ title: 'type partial', input: 'object:_foo-bar', output: 'core/objects/_foo-bar' },
	{ title: 'type partial namespace', input: 'template:foo/_foo-bar', output: 'core/templates/foo/_foo-bar' },
	{ title: 'type partial cli', input: 'object:-foo-bar', output: 'core/objects/-foo-bar' },
	{ title: 'type partial cli namespace', input: 'template:foo/-foo-bar', output: 'core/templates/foo/-foo-bar' },
	{ title: 'type multi', input: 'object:foo.bar.wow', output: 'core/objects/foo/bar/wow' },

	// Pod based.
	{ title: 'pod base', input: 'object:foo', output: 'core/pods/foo/object' },
	{ title: 'pod base namespace', input: 'template:foo/bar', output: 'core/pods/foo/bar/template' },
	{ title: 'pod dot', input: 'object:foo.bar', output: 'core/pods/foo/bar/object' },
	{ title: 'pod dot namespace', input: 'template:foo/foo.bar', output: 'core/pods/foo/foo/bar/template' },
	{ title: 'pod camel', input: 'object:fooBar', output: 'core/pods/foo-bar/object' },
	{ title: 'pod camel namespace', input: 'template:foo/fooBar', output: 'core/pods/foo/foo-bar/template' },
	{ title: 'pod dash', input: 'object:foo-bar', output: 'core/pods/foo-bar/object' },
	{ title: 'pod dash namespace', input: 'template:foo/foo-bar', output: 'core/pods/foo/foo-bar/template' },
	{ title: 'pod lowdash', input: 'object:foo_bar', output: 'core/pods/foo/bar/object' },
	{ title: 'pod lowdash namespace', input: 'template:foo/foo_bar', output: 'core/pods/foo/foo/bar/template' },
	{ title: 'pod partial', input: 'object:_foo-bar', output: 'core/pods/foo-bar/object' },
	{ title: 'pod partial namespace', input: 'template:foo/_foo-bar', output: 'core/pods/foo/foo-bar/template' },
	{ title: 'pod partial cli', input: 'object:-foo-bar', output: 'core/pods/foo-bar/object' },
	{ title: 'pod partial cli namespace', input: 'template:foo/-foo-bar', output: 'core/pods/foo/foo-bar/template' },
	{ title: 'pod multi', input: 'object:foo.bar.wow', output: 'core/pods/foo/bar/wow/object' }
]).test('it loads modules from loader.js ', function(params, assert) {
	const object = Ember.Object.extend();

	amd.define(params.output, object);

	assert.equal(registry.resolve(params.input), object);
});

test('it loads components modules from loader.js', function(assert) {
	const object = Ember.Component.extend();

	amd.define('core/pods/components/foo/component', object);

	assert.equal(registry.resolve('component:foo'), object);
});

test('it looks up for namespaces in application', function(assert) {
	application.set('namespaces', ['app', 'core']);

	const object = Ember.Object.extend();

	amd.define('app/objects/foo', object);

	assert.equal(registry.resolve('object:foo'), object);
});

cases([
	// Main based.
	{ title: 'main', type: 'object', input: 'core/object', output: 'object:main' },

	// Type based.
	{ title: 'type base', type: 'object', input: 'core/objects/bar', output: 'object:bar' },
	{ title: 'type complex', type: 'object', input: 'core/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', type: 'object', input: 'core/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', type: 'object', input: 'core/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it looks up for a type given ', function(params, assert) {
	const object = Ember.Object.extend();

	amd.define(params.input, object);

	assert.ok(registry.knownForType(params.type)[params.output]);
});

test('it looks up for components', function(assert) {
	const object = Ember.Component.extend();

	amd.define('core/pods/components/foo/component', object);

	assert.ok(registry.knownForType('component')['component:foo']);
});

test('it looks up only on defined namespaces', function(assert) {
	const object = Ember.Component.extend();

	amd.define('foo/pods/components/foo/component', object);

	assert.notOk(registry.knownForType('component')['component:foo']);
});

test('it does not lookup on other types', function(assert) {
	const object = Ember.Component.extend();

	amd.define('core/controllers/foo', object);

	assert.notOk(registry.knownForType('view')['controller:foo']);
});

cases([
	// Main based.
	{ title: 'main', input: 'core/object', output: 'object:main' },

	// Type based.
	{ title: 'type base', input: 'core/objects/bar', output: 'object:bar' },
	{ title: 'type complex', input: 'core/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'core/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', input: 'core/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it lookups description of modules ', function(params, assert) {
	const object = Ember.Object.extend();

	amd.define(params.input, object);

	assert.equal(registry.describe(params.output), params.input);
});

test('it makes up description to string when module is not found', function(assert) {
	assert.equal(registry.describe('object:main'), 'undefined@object:main');
});

cases([
	// Main based.
	{ title: 'main', input: 'core/object', output: 'object:main', toString: 'core@object:main' },

	// Type based.
	{ title: 'type base', input: 'core/objects/bar', output: 'object:bar', toString: 'core@object:bar' },
	{ title: 'type complex', input: 'core/objects/bar/baz', output: 'object:bar/baz', toString: 'core@object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'core/pods/bar/object', output: 'object:bar', toString: 'core@object:bar' },
	{ title: 'pod complex', input: 'core/pods/bar/baz/object', output: 'object:bar/baz', toString: 'core@object:bar/baz' }
]).test('it makes object to string', function(params, assert) {
	const object = Ember.Object.extend();

	amd.define(params.input, object);

	const factory = registry.resolve(params.output);

	assert.equal(registry.resolver.makeToString(factory, params.output), params.toString);
});

test('it resolves non factory modules', function(assert) {
	const object = {};

	amd.define('core/objects/foo', object);

	assert.equal(registry.resolve('object:foo'), object);
});

test('it resolves names with namespace', function(assert) {
	const object = Ember.Object.extend();

	amd.define('core/objects/foo', object);

	assert.equal(registry.resolve('core@object:foo'), object);
});

test('it resolves names with ember cli namespace', function(assert) {
	const object = Ember.Object.extend();

	amd.define('core/objects/foo', object);

	assert.equal(registry.resolve('object:core@foo'), object);
});

test('it does not throw an error when there are unknown modules', function(assert) {
	const object = Ember.Object.extend();

	amd.define('core/objects/foo', object);

	amd.define('bar', {});

	assert.ok(registry.knownForType('object'));
});

test('it looks up on pluralized dictionary', function(assert) {
	Ember.run(application, 'destroy');

	const object = Ember.Object.extend();

	amd.define('core/config/foo', object);

	application = Ember.run(Ember.Application, 'create', {
		Resolver: Ember.DefaultResolver.extend(ResolverMixin, {
			namespaces: ['core'],
			pluralizedTypes: {
				config: 'config'
			}
		})
	});

	registry = application.__registry__;

	assert.equal(registry.resolve('config:foo'), object);
});

test('it is a module based resolver', function(assert) {
	assert.equal(registry.resolver.get('moduleBasedResolver'), true);
});

cases([
	// Main based.
	{ title: 'main', input: 'core/object', output: 'object:main' },

	// Type based.
	{ title: 'type base', input: 'core/objects/bar', output: 'object:bar' },
	{ title: 'type complex', input: 'core/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'core/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', input: 'core/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it resolves under 1 ms ', function(params, assert) {
	const object = Ember.Component.extend();

	amd.define(params.input, object);

	const res = profile(() => {
		return registry.resolve(params.output);
	});

	assert.ok(res.mean < 1, 'resolves under 1 ms');
});

cases([
	// Main based.
	{ title: 'main', type: 'object', input: 'core/object', output: 'object:main' },

	// Type based.
	{ title: 'type base', type: 'object', input: 'core/objects/bar', output: 'object:bar' },
	{ title: 'type complex', type: 'object', input: 'core/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', type: 'object', input: 'core/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', type: 'object', input: 'core/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it knows for types under 1 ms ', function(params, assert) {
	const object = Ember.Component.extend();

	amd.define(params.input, object);

	const res = profile(() => {
		return registry.knownForType(params.type)[params.output];
	});

	assert.ok(res.mean < 1, 'resolves under 1 ms');
});

cases([
	// Main based.
	{ title: 'main', input: 'core/object', output: 'object:main' },

	// Type based.
	{ title: 'type base', input: 'core/objects/bar', output: 'object:bar' },
	{ title: 'type complex', input: 'core/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'core/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', input: 'core/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it resolves under 1 ms ', function(params, assert) {
	const object = Ember.Component.extend();

	amd.define(params.input, object);

	const factory = registry.resolve(params.output);

	const res = profile(() => {
		return registry.resolver.makeToString(factory, params.output);
	});

	assert.ok(res.mean < 1, 'resolves under 1 ms');
});
