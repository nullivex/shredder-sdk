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
