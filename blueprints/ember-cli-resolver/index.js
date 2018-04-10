/* eslint-env node */
'use strict';

module.exports = {
	normalizeEntityName() {
		// this prevents an error when the entityName is
		// not specified (since that doesn't actually matter
		// to us
	},

	afterInstall() {
		return this.addBowerPackagesToProject([
			{ name: 'babel-polyfill', target:'latest' }
		]);
	}
};
