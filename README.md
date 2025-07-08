# Batch Analyzer

Batch Analyzer is a professional, open-source solution for running Google Lighthouse performance audits on multiple URLs in batch. It features a robust Rust CLI for automated report generation and a modern Next.js web UI for interactive analysis and visualization.

---

## Features

- 🚀 **Batch Processing**: Analyze hundreds of URLs in a single run
- 📁 **Organized Output**: Timestamped directories for each batch
- 🏷️ **Custom Naming**: Prefix output directories for easy identification
- 🔧 **Headless Mode**: Chrome runs headless for server environments
- 📊 **HTML Reports**: Detailed Lighthouse HTML reports per URL
- 🛡️ **Safe Filenames**: URLs are converted to safe, unique filenames
- 📂 **Custom Reports Directory**: Flexible output location
- 🎯 **Customizable Prefixes**: Set custom report file prefixes
- 🧪 **Comprehensive Testing**: Full test suite for reliability
- 🌐 **Web UI**: Modern dashboard for browsing, filtering, and downloading reports

---

## Prerequisites

- **Rust** (latest stable)
- **Node.js** (18+)
- **npm** or **bun**
- **Google Lighthouse** (globally installed)
- **Google Chrome**

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd batch-analyzer
   ```
2. **Build the Rust CLI:**
   ```bash
   cargo build --release
   # Binary at target/release/batch_analyzer
   ```
3. **Set up the Web UI:**
   ```bash
   cd web-ui
   npm install # or bun install
   npm run build
   npm start
   # Visit http://localhost:3000
   ```

---

## Usage

### CLI (Rust)

- **Basic:**
  ```bash
  ./target/release/batch_analyzer --name "my-analysis"
  ```
- **Custom URL file and output directory:**
  ```bash
  ./target/release/batch_analyzer --name "audit" --file "custom-urls.txt" --reports-dir "custom-reports"
  ```
- **Environment file:**
  ```bash
  cp .env.example .env
  # Edit .env for defaults
  ./target/release/batch_analyzer
  ```

#### Command Line Options
- `--name, -n`: Prefix for output directory (or set `BATCH_ANALYZER_NAME` in `.env`)
- `--file, -f`: URL list file (default: `urls.txt`)
- `--reports-dir, -r`: Output directory (default: `reports`)

#### Environment Variables
- `BATCH_ANALYZER_NAME`: Default output directory prefix
- `BATCH_ANALYZER_REPORT_PREFIX`: Report file prefix (default: `report`)

#### URL File Format
One URL per line:
```
https://github.com
https://www.google.com
```

#### Output Structure
```
reports/{name}_{YYYYMMDD_HHMMSS}/
  ├── report_www_google_com__abc123.html
  └── ...
```

### Web UI (Next.js)

- **Start the dashboard:**
  ```bash
  cd web-ui
  npm run dev
  # or npm start for production
  ```
- **Features:**
  - Dashboard overview of all analysis runs
  - Drill down into individual page metrics
  - Download and view original Lighthouse HTML reports
  - Responsive, modern design (dark/light mode)

---

## Docker & Railway Deployment

- **Multi-stage Dockerfile** for full-stack deployment
- **Railway**: One-click deploy with both CLI and Web UI
- See `RAILWAY_DEPLOYMENT.md` for full cloud deployment instructions

---

## Development

- **Build CLI:** `cargo build` or `cargo build --release`
- **Run tests:** `cargo test`
- **Format:** `cargo fmt`
- **Lint:** `cargo clippy`
- **Web UI:** `npm run dev` in `web-ui/`

---

## Troubleshooting

- Ensure Lighthouse and Chrome are installed and in your PATH
- For headless servers, Chrome must run with `--no-sandbox`
- See the Troubleshooting section in the CLI and Web UI READMEs for more

---

## License

MIT License. See [LICENSE](LICENSE).

## Contributing

Contributions are welcome! Please fork, branch, and submit a Pull Request.

---

## Authors
- [Your Name Here]

---

## Acknowledgements
- Built with Rust, Next.js, and Google Lighthouse
- Inspired by the open-source web performance community
