# Batch Analyzer

A command-line tool built in Rust for running Google Lighthouse performance audits on multiple URLs in batch. This tool reads a list of URLs from a file and generates HTML reports for each URL, organizing them in timestamped directories.

## Features

- 🚀 **Batch Processing**: Analyze multiple URLs in a single run
- 📁 **Organized Output**: Automatically creates timestamped directories for each batch run
- 🏷️ **Custom Naming**: Prefix output directories with custom names for easy identification
- 🔧 **Headless Mode**: Runs Chrome in headless mode for server environments
- 📊 **HTML Reports**: Generates detailed Lighthouse HTML reports for each URL
- 🛡️ **Safe Filenames**: Automatically converts URLs to filesystem-safe filenames

## Prerequisites

Before using this tool, you need to have the following installed:

1. **Rust** (latest stable version)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Node.js and npm**
   ```bash
   # On Ubuntu/Debian
   sudo apt install nodejs npm
   
   # On macOS with Homebrew
   brew install node
   ```

3. **Google Lighthouse** (globally installed)
   ```bash
   npm install -g lighthouse
   ```

4. **Google Chrome** (for Lighthouse to use)

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd batch-analyzer
   ```

2. Build the project:
   ```bash
   cargo build --release
   ```

3. The compiled binary will be available at `target/release/batch_analyzer`

## Usage

### Basic Usage

```bash
./target/release/batch_analyzer --name "my-analysis"
```

This will:
- Read URLs from `urls.txt` (default file)
- Create a directory named `my-analysis_YYYYMMDD_HHMMSS`
- Generate Lighthouse reports for each URL

### Custom URL File

```bash
./target/release/batch_analyzer --name "my-analysis" --file "custom-urls.txt"
```

### Command Line Options

- `--name, -n`: **Required** - Name to prefix the output directory
- `--file, -f`: **Optional** - Path to the file containing URLs (default: `urls.txt`)

### URL File Format

Create a text file with one URL per line:

```
https://github.com
https://github.com/omarhosamcodes
https://www.google.com
https://stackoverflow.com
```

## Example

1. Create a `urls.txt` file:
   ```
   https://github.com
   https://www.google.com
   https://stackoverflow.com
   ```

2. Run the analyzer:
   ```bash
   ./target/release/batch_analyzer --name "website-audit"
   ```

3. Check the generated reports in the timestamped directory:
   ```
   website-audit_20250706_143022/
   ├── github_com.html
   ├── www_google_com.html
   └── stackoverflow_com.html
   ```

## Output Structure

The tool creates a timestamped directory with the following naming pattern:
```
{name}_{YYYYMMDD_HHMMSS}/
```

Each URL generates an HTML report with a sanitized filename based on the URL.

## Development

### Building from Source

```bash
# Debug build
cargo build

# Release build (optimized)
cargo build --release

# Run directly with Cargo
cargo run -- --name "test" --file "urls.txt"
```

### Running Tests

```bash
cargo test
```

### Code Formatting

```bash
cargo fmt
```

### Linting

```bash
cargo clippy
```

## Dependencies

- **clap**: Command-line argument parsing
- **chrono**: Date and time handling for timestamps

## Troubleshooting

### "Failed to execute Lighthouse command"
- Ensure Lighthouse is installed globally: `npm install -g lighthouse`
- Verify Node.js and npm are installed
- Check that `lighthouse` command is available in your PATH

### "Could not open or read file"
- Ensure the URLs file exists and is readable
- Check file permissions
- Verify the file path is correct

### Chrome/Chromium Issues
- Install Google Chrome or Chromium browser
- On headless servers, ensure Chrome can run with the `--no-sandbox` flag

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
