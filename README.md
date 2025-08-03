# Bitwarden Wrapper

A lightweight Node.js wrapper around the [Bitwarden CLI](https://bitwarden.com/help/cli/) for programmatic authentication, vault unlocking, and listing items.

---

## 📦 Installation

```bash
npm install bitwarden-wrapper
```

> ⚠️ **Prerequisite**: Requires the Bitwarden CLI (`bw`) to be installed and available in your system's PATH.

---

## ⚙️ Environment Variables

This wrapper relies on the following environment variables to function:

| Variable | Description |
|----------|-------------|
| `BW_URL` | Bitwarden server URL (e.g., `https://vault.bitwarden.com`) |
| `BW_CLIENT_ID` | Your Bitwarden API Client ID |
| `BW_CLIENT_SECRET` | Your Bitwarden API Client Secret |
| `BW_PASSWORD` | Your Bitwarden master password |

You can define them in a `.env` file or export them in your shell session:

```env
BW_URL=https://vault.bitwarden.com
BW_CLIENT_ID=your-client-id
BW_CLIENT_SECRET=your-client-secret
BW_PASSWORD=your-master-password
```

---

## 🚀 Usage Example

```javascript
import BitwardenClient from 'bitwarden-wrapper'

const client = new BitwardenClient()

async function main() {
  await client.init()
  const items = await client.listItems()
  console.log(items)
}

main()
```