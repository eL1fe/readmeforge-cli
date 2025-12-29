#!/usr/bin/env node

import { execSync } from "child_process";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve, join } from "path";
import https from "https";

const VERSION = "1.0.0";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = "") {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}Error: ${message}${colors.reset}`);
  process.exit(1);
}

function getGitRemote() {
  try {
    const remote = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
    // Parse GitHub URL
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      return `https://github.com/${match[1]}/${match[2]}`;
    }
  } catch {
    return null;
  }
  return null;
}

function callAPI(apiKey, repoUrl, options) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      repoUrl,
      template: options.template || "standard",
      customization: {
        language: options.language || "en",
        tone: options.tone || "professional",
        includeEmoji: options.emoji !== false,
      },
    });

    const req = https.request(
      {
        hostname: "www.readmeforge.app",
        port: 443,
        path: "/api/generate/action",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(body);
            if (res.statusCode >= 400) {
              reject(new Error(json.error || `HTTP ${res.statusCode}`));
            } else {
              resolve(json);
            }
          } catch {
            reject(new Error(`Invalid response: ${body}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function showHelp() {
  console.log(`
${colors.bold}readmeforge${colors.reset} - Generate professional README files with AI

${colors.bold}Usage:${colors.reset}
  npx readmeforge [options]

${colors.bold}Options:${colors.reset}
  -k, --key <key>       API key (or set READMEFORGE_API_KEY env var)
  -r, --repo <url>      GitHub repo URL (auto-detected from git remote)
  -t, --template <type> Template: standard, minimal, detailed (default: standard)
  -l, --language <lang> Output language: en, ru, es, de, fr, zh, ja (default: en)
  --tone <tone>         Tone: professional, friendly, casual, technical
  --no-emoji            Disable emojis in headings
  -o, --output <file>   Output file (default: README.md)
  -f, --force           Overwrite existing README without prompting
  -h, --help            Show this help
  -v, --version         Show version

${colors.bold}Examples:${colors.reset}
  ${colors.dim}# Generate README for current repo${colors.reset}
  npx readmeforge -k rf_xxxxx

  ${colors.dim}# Generate minimal README in Russian${colors.reset}
  npx readmeforge -k rf_xxxxx -t minimal -l ru

  ${colors.dim}# Use env var for API key${colors.reset}
  READMEFORGE_API_KEY=rf_xxxxx npx readmeforge

${colors.bold}Get your API key:${colors.reset}
  https://readmeforge.app/settings
`);
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "-h":
      case "--help":
        showHelp();
        process.exit(0);
      case "-v":
      case "--version":
        console.log(VERSION);
        process.exit(0);
      case "-k":
      case "--key":
        options.key = next;
        i++;
        break;
      case "-r":
      case "--repo":
        options.repo = next;
        i++;
        break;
      case "-t":
      case "--template":
        options.template = next;
        i++;
        break;
      case "-l":
      case "--language":
        options.language = next;
        i++;
        break;
      case "--tone":
        options.tone = next;
        i++;
        break;
      case "--no-emoji":
        options.emoji = false;
        break;
      case "-o":
      case "--output":
        options.output = next;
        i++;
        break;
      case "-f":
      case "--force":
        options.force = true;
        break;
    }
  }
  return options;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const options = parseArgs(args);

  // Get API key
  const apiKey = options.key || process.env.READMEFORGE_API_KEY;
  if (!apiKey) {
    error("API key required. Use -k or set READMEFORGE_API_KEY env var.");
  }

  // Get repo URL
  const repoUrl = options.repo || getGitRemote();
  if (!repoUrl) {
    error("Could not detect repo. Use -r to specify GitHub URL.");
  }

  // Check output file
  const outputFile = options.output || "README.md";
  const outputPath = resolve(process.cwd(), outputFile);

  if (existsSync(outputPath) && !options.force) {
    error(`${outputFile} already exists. Use -f to overwrite.`);
  }

  log(`\n${colors.bold}ReadmeForge CLI${colors.reset}\n`, colors.cyan);
  log(`Repository: ${repoUrl}`, colors.dim);
  log(`Template: ${options.template || "standard"}`, colors.dim);
  log(`Language: ${options.language || "en"}`, colors.dim);
  log("");

  log("Generating README...", colors.yellow);

  try {
    const result = await callAPI(apiKey, repoUrl, options);

    writeFileSync(outputPath, result.readme);

    log(`\n${colors.green}✓${colors.reset} README generated successfully!`);
    log(`  Saved to: ${outputPath}`, colors.dim);
    log(`  Credits remaining: ${result.creditsRemaining}`, colors.dim);
    log("");
  } catch (err) {
    error(err.message);
  }
}

main();
