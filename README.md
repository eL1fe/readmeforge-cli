# ReadmeForge CLI

Generate professional README files with AI from your terminal.

[![npm version](https://img.shields.io/npm/v/readmeforge?style=flat-square&color=black)](https://www.npmjs.com/package/readmeforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)

## Installation

```bash
# Run directly with npx (no install required)
npx readmeforge -k YOUR_API_KEY

# Or install globally
npm install -g readmeforge
```

## Usage

```bash
# Generate README for current repo
npx readmeforge -k rf_xxxxx

# Use environment variable for API key
export READMEFORGE_API_KEY=rf_xxxxx
npx readmeforge

# Generate minimal README in Russian
npx readmeforge -k rf_xxxxx -t minimal -l ru

# Force overwrite existing README
npx readmeforge -k rf_xxxxx -f
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-k, --key` | API key (or use `READMEFORGE_API_KEY` env var) | - |
| `-r, --repo` | GitHub repo URL (auto-detected from git remote) | - |
| `-t, --template` | Template: `standard`, `minimal`, `detailed` | `standard` |
| `-l, --language` | Language: `en`, `ru`, `es`, `de`, `fr`, `zh`, `ja` | `en` |
| `--tone` | Tone: `professional`, `friendly`, `casual`, `technical` | `professional` |
| `--no-emoji` | Disable emojis in headings | - |
| `-o, --output` | Output file path | `README.md` |
| `-f, --force` | Overwrite existing file without prompting | - |

## Get Your API Key

1. Go to [readmeforge.app](https://readmeforge.app)
2. Sign in with GitHub
3. Navigate to Settings → API Keys
4. Generate a new API key

## CI/CD Integration

Use environment variables in your CI/CD pipeline:

```yaml
# GitHub Actions
- name: Generate README
  run: npx readmeforge -f
  env:
    READMEFORGE_API_KEY: ${{ secrets.READMEFORGE_API_KEY }}
```

Or use the official [ReadmeForge Action](https://github.com/eL1fe/readmeforge-action) for more features.

## License

MIT

---

<p align="center">
  <a href="https://readmeforge.app">
    <img src="https://readmeforge.app/badge.svg" alt="Made with ReadmeForge" height="20">
  </a>
</p>
