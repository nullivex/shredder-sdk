'use strict';
var oose = require('oose-sdk')


/**
 * API Helper
 * @type {object}
 */
exports.api = require('./helpers/api')


/**
 * Mock server
 * @type {object}
 */
exports.mock = require('./mock')


/**
 * Shredder helper
 * @type {object}
 */
exports.Shredder = require('./helpers/Shredder')

/**
 * Couch Session helper
 * @type {object}
 */
exports.couchSession = require('./helpers/couchSession')

/**
 * Max Concurrency Error
 * @type {NetworkError}
 */
exports.MaxConcurrencyError = require('./helpers/MaxConcurrencyError')


/**
 * Network Error
 * @type {NetworkError}
 */
exports.NetworkError = oose.NetworkError


/**
 * Not Found Error
 * @type {NotFoundError}
 */
exports.NotFoundError = oose.NotFoundError


/**
 * User space error
 * @type {UserError}
 */
exports.UserError = oose.UserError
