// types.d.js

/**
 * @typedef {Object} VaultItem
 * @property {string} id
 * @property {string} object
 * @property {string} name
 * @property {number} type
 * @property {number} reprompt
 * @property {boolean} favorite
 * @property {string|null} notes
 * @property {string|null} folderId
 * @property {string|null} organizationId
 * @property {string|null} deletedDate
 * @property {string} creationDate
 * @property {string} revisionDate
 * @property {string[]|null} collectionIds
 * @property {null} passwordHistory
 * @property {VaultItemLogin|null} login
 */

/**
 * @typedef {Object} VaultItemLogin
 * @property {string|null} username
 * @property {string|null} password
 * @property {string|null} totp
 * @property {string|null} passwordRevisionDate
 * @property {Array<Object>} uris
 */
