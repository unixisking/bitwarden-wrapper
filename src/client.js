import util from 'util'
import { exec } from 'node:child_process'

const execAsync = util.promisify(exec)

class BitwardenClient {
  #clientId
  #clientSecret
  #password
  #session

  constructor(clientId, clientSecret, password) {
    this.#clientId = clientId || process.env.BW_CLIENT_ID
    this.#clientSecret = clientSecret || process.env.BW_CLIENT_SECRET
    this.#password = password || process.env.BW_PASSWORD
    this.#session = null
  }

  async init() {
    await this.checkBwInstalled()
    await this.login()
    await this.unlock()
  }

  async checkBwInstalled() {
    try {
      await execAsync('bw --version')
      console.log('✅ Bitwarden CLI is installed.')
    } catch (err) {
      throw new Error(
        'Bitwarden CLI is not installed. Please install it first.'
      )
    }
  }

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
      console.log('🔐 Login successful.')
      return stdout
    } catch (err) {
      if (err.message.includes('already logged in')) {
        console.log('🔑 Already logged in. Skipping login step.')
      } else {
        throw new Error('Login failed. Please check your credentials.')
      }
    }
  }

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
      console.log('✅ Vault unlocked. Session token:', sessionToken.trim())
      this.#session = sessionToken.trim()
      return this.#session
    } catch (err) {
      console.error('❌ Authentication failed:', err.stderr || err.message)
      process.exit(1)
    }
  }
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
  async gettSession() {
    return this.#session
  }
}

export default BitwardenClient
