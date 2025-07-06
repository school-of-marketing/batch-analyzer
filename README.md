# Batch Analyzer

A command-line tool built in Rust for running Google Lighthouse performance audits on multiple URLs in batch. This tool reads a list of URLs from a file and generates HTML reports for each URL, organizing them in timestamped directories.

## Features

- 🚀 **Batch Processing**: Analyze multiple URLs in a single run
- 📁 **Organized Output**: Automatically creates timestamped directories for each batch run
- 🏷️ **Custom Naming**: Prefix output directories with custom names for easy identification
- 🔧 **Headless Mode**: Runs Chrome in headless mode for server environments
- 📊 **HTML Reports**: Generates detailed Lighthouse HTML reports for each URL
- 🛡️ **Safe Filenames**: Automatically converts URLs to filesystem-safe filenames with random suffixes
- 📂 **Custom Reports Directory**: Configure where report folders are created
- 🎯 **Customizable Report Prefixes**: Set custom prefixes for generated report files
- 🧪 **Comprehensive Testing**: Full test suite ensuring reliability and correctness

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
- Create a directory named `my-analysis_YYYYMMDD_HHMMSS` in the `reports` directory
- Generate Lighthouse reports for each URL with randomized filenames for uniqueness

### Using Environment File

You can set default values using a `.env` file instead of always providing command-line arguments:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file:
   ```
   # Default name to prefix output directories
   BATCH_ANALYZER_NAME=my-default-analysis
   
   # Default prefix for report filenames
   BATCH_ANALYZER_REPORT_PREFIX=report
   ```

3. Run without the `--name` flag:
   ```bash
   ./target/release/batch_analyzer
   ```

The tool will automatically use the name from the `.env` file. Command-line arguments take precedence over environment variables.

### Custom URL File and Reports Directory

```bash
./target/release/batch_analyzer --name "my-analysis" --file "custom-urls.txt" --reports-dir "custom-reports"
```

### Command Line Options

- `--name, -n`: **Optional** - Name to prefix the output directory (can be set via `BATCH_ANALYZER_NAME` environment variable)
- `--file, -f`: **Optional** - Path to the file containing URLs (default: `urls.txt`)
- `--reports-dir, -r`: **Optional** - Directory where report folders will be created (default: `reports`)

### Environment Variables

You can set these in a `.env` file in the project root:

- `BATCH_ANALYZER_NAME`: Default name to prefix output directories
- `BATCH_ANALYZER_REPORT_PREFIX`: Default prefix for report filenames (default: "report")

## Advanced Usage

### Environment Configuration

Create a `.env` file for default settings:
```bash
# Copy the example file
cp .env.example .env

# Edit with your preferences
BATCH_ANALYZER_NAME=production-audit
BATCH_ANALYZER_REPORT_PREFIX=lighthouse
```

### Custom Reports Directory Structure

Organize different types of audits:
```bash
# Development environment audit
./target/release/batch_analyzer --name "dev-env" --reports-dir "audits/development"

# Production environment audit  
./target/release/batch_analyzer --name "prod-env" --reports-dir "audits/production"

# Performance comparison
./target/release/batch_analyzer --name "before-optimization" --reports-dir "comparisons"
```

### Batch Processing Multiple URL Lists

```bash
# Process different site sections
./target/release/batch_analyzer --name "homepage" --file "homepage-urls.txt"
./target/release/batch_analyzer --name "products" --file "product-urls.txt"
./target/release/batch_analyzer --name "checkout" --file "checkout-urls.txt"
```

## URL File Format

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
   reports/website-audit_20250706_143022/
   ├── report_github_com__abc123.html
   ├── report_www_google_com__def456.html
   └── report_stackoverflow_com__ghi789.html
   ```

## Output Structure

The tool creates a timestamped directory with the following naming pattern:
```
reports/{name}_{YYYYMMDD_HHMMSS}/
```

Each URL generates an HTML report with a sanitized filename based on the URL, including a random suffix for uniqueness:
```
{prefix}_{sanitized_url}__{random_string}.html
```

For example: `report_www_google_com_search_q_rust__a1b2c3.html`

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

The project includes a comprehensive test suite covering:
- URL-to-filename conversion edge cases
- File reading operations
- Unicode and special character handling
- Long URL truncation
- Integration testing

```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific tests
cargo test test_url_to_filename
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

- **clap**: Command-line argument parsing with derive features
- **chrono**: Date and time handling for timestamps
- **dotenv**: Environment file (.env) loading support
- **rand**: Random string generation for unique filenames

## Troubleshooting

### "Failed to execute Lighthouse command"
- Ensure Lighthouse is installed globally: `npm install -g lighthouse`
- Verify Node.js and npm are installed
- Check that `lighthouse` command is available in your PATH

### "Could not open or read file"
- Ensure the URLs file exists and is readable
- Check file permissions (`chmod 644 urls.txt`)
- Verify the file path is correct (use absolute paths if needed)
- Make sure the file contains at least one valid URL

### Chrome/Chromium Issues
- Install Google Chrome or Chromium browser
- On headless servers, ensure Chrome can run with the `--no-sandbox` flag
- For memory-constrained environments, Chrome might fail - consider using a machine with more RAM

### Filename Issues
- Long URLs are automatically truncated to prevent filesystem issues
- Special characters are sanitized to safe alternatives
- Random suffixes prevent filename collisions when processing similar URLs

## Performance Tips

- **Sequential Processing**: URLs are processed one at a time to avoid overwhelming the target servers
- **Headless Mode**: Chrome runs in headless mode with optimized flags for better performance
- **Cache Disabled**: Lighthouse runs with cache disabled for accurate performance measurements
- **Memory Management**: For large URL lists, consider splitting into smaller batches to manage memory usage
- **Output Organization**: Use the `--reports-dir` option to organize reports by project or date

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
