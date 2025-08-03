import util from 'util'
import { exec } from 'node:child_process'

const execAsync = util.promisify(exec)

/**
 * BitwardenClient provides methods to interact with the Bitwarden CLI for authentication and vault management.
 *
 * @class
 */
class BitwardenClient {
  /**
   * The Bitwarden server URL.
   * @type {string}
   * @private
   */
  #url

  /**
   * The Bitwarden client ID.
   * @type {string}
   * @private
   */
  #clientId

  /**
   * The Bitwarden client secret.
   * @type {string}
   * @private
   */
  #clientSecret

  /**
   * The Bitwarden master password.
   * @type {string}
   * @private
   */
  #password

  /**
   * The Bitwarden session token.
   * @type {string|null}
   * @private
   */
  #session

  /**
   * Creates an instance of BitwardenClient.
   *
   * @param {string} [url] - The Bitwarden server URL.
   * @param {string} [clientId] - The Bitwarden client ID.
   * @param {string} [clientSecret] - The Bitwarden client secret.
   * @param {string} [password] - The Bitwarden master password.
   */
  constructor(url, clientId, clientSecret, password) {
    this.#url = url || process.env.BW_URL
    this.#clientId = clientId || process.env.BW_CLIENT_ID
    this.#clientSecret = clientSecret || process.env.BW_CLIENT_SECRET
    this.#password = password || process.env.BW_PASSWORD
    this.#session = null
  }

  /**
   * Initializes the Bitwarden client by checking CLI installation, setting server URL, logging in, and unlocking the vault.
   *
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    await this.checkBwInstalled()
    await this.setServerURL()
    await this.login()
    await this.unlock()
  }

  /**
   * Checks if the Bitwarden CLI is installed.
   *
   * @async
   * @throws {Error} If the Bitwarden CLI is not installed.
   * @returns {Promise<void>}
   */
  async checkBwInstalled() {
    try {
      await execAsync('bw --version')
    } catch (err) {
      throw new Error(
        'Bitwarden CLI is not installed. Please install it first.'
      )
    }
  }

  /**
   * Sets the Bitwarden server URL using the CLI.
   *
   * @async
   * @throws {Error} If the server URL is not provided or setting fails.
   * @returns {Promise<void>}
   */
  async setServerURL() {
    if (!this.#url) {
      throw new Error('Bitwarden server URL is not provided.')
    }
    try {
      await execAsync(`bw config server ${this.#url}`)
    } catch (err) {
      throw new Error(
        `Failed to set Bitwarden server URL: ${err.message || err.stderr}`
      )
    }
  }

  /**
   * Logs in to Bitwarden using the CLI and API key credentials.
   *
   * @async
   * @throws {Error} If login fails.
   * @returns {Promise<string|undefined>} The CLI output if successful.
   */
  async login() {
    try {
      const { stdout } = await execAsync('bw login --apikey', {
        env: {
          ...process.env,
          BW_CLIENTID: this.#clientId,
          BW_CLIENTSECRET: this.#clientSecret,
          BW_PASSWORD: this.#password,
        },
      })
      return stdout
    } catch (err) {
      if (!err.message.includes('already logged in')) {
        throw new Error('Login failed. Please check your credentials.')
      }
    }
  }

  /**
   * Unlocks the Bitwarden vault and retrieves the session token.
   *
   * @async
   * @throws {Error} If authentication fails.
   * @returns {Promise<string|undefined>} The session token.
   */
  async unlock() {
    try {
      const { stdout: sessionToken } = await execAsync(
        'bw unlock --passwordenv BW_PASSWORD --raw',
        {
          env: {
            ...process.env,
            BW_CLIENTID: this.#clientId,
            BW_CLIENTSECRET: this.#clientSecret,
            BW_PASSWORD: this.#password,
          },
        }
      )
      this.#session = sessionToken.trim()
      return this.#session
    } catch (err) {
      console.error('❌ Authentication failed:', err.stderr || err.message)
      process.exit(1)
    }
  }

  /**
   * Lists all items in the Bitwarden vault.
   *
   * @async
   * @throws {Error} If listing items fails.
   * @returns {Promise<VaultItem[]|undefined>} The list of vault items.
   */
  async listItems() {
    try {
      const { stdout } = await execAsync(
        `bw list items --session ${this.#session}`,
        {
          encoding: 'utf8',
        }
      )
      const items = JSON.parse(stdout)
      return items
    } catch (err) {
      console.error('❌ Failed to list items:', err.stderr || err.message)
    }
  }

  /**
   * Gets the current Bitwarden session token.
   *
   * @returns {string|null} The session token.
   */
  async gettSession() {
    return this.#session
  }
}

export default BitwardenClient
