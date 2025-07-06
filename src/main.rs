use chrono::Local;
use clap::Parser;
use dotenv::dotenv;
use rand::{distributions::Alphanumeric, Rng};
use std::env;
use std::fs::{self, File};
use std::io::{self, BufRead};
use std::path::Path;
use std::process::Command;

/// A simple CLI to run Lighthouse on a list of URLs from a file.
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Name to prefix the output directory. Can be set via BATCH_ANALYZER_NAME environment variable.
    #[arg(short, long)]
    name: Option<String>,

    /// The path to the file containing URLs, one per line.
    #[arg(short, long, default_value = "urls.txt")]
    file: String,

    /// Directory where report folders will be created.
    #[arg(short, long, default_value = "reports")]
    reports_dir: String,
}

fn main() {
    // Load environment variables from .env file if it exists
    dotenv().ok();

    let args = Args::parse();

    // Get the name from environment variable first, then command line argument
    let name = match env::var("BATCH_ANALYZER_NAME") {
        Ok(env_name) => {
            // If environment variable is set, use it and skip the name flag
            println!("Using name from environment variable: {}", env_name);
            env_name
        }
        Err(_) => {
            // If no environment variable, check command line argument
            match args.name {
                Some(name) => name,
                None => {
                    eprintln!("Error: Name is required. Provide it via --name flag or set BATCH_ANALYZER_NAME environment variable in a .env file.");
                    std::process::exit(1);
                }
            }
        }
    };

    // Get the report prefix from environment variable, default to "report" if not set
    let report_prefix =
        env::var("BATCH_ANALYZER_REPORT_PREFIX").unwrap_or_else(|_| "report".to_string());
    println!("Using report prefix: {}", report_prefix);

    // --- 1. Create the reports directory and timestamped output directory ---
    let reports_dir = Path::new(&args.reports_dir);

    // Create the reports directory if it doesn't exist
    if !reports_dir.exists() {
        fs::create_dir_all(reports_dir).expect("Failed to create reports directory");
        println!("Created reports directory: {}", args.reports_dir);
    }

    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
    let dir_name = format!("{}_{}", name, timestamp);
    let output_dir = reports_dir.join(&dir_name);

    if !output_dir.exists() {
        fs::create_dir(&output_dir).expect("Failed to create output directory");
        println!("Created output directory: {}", output_dir.display());
    }

    // --- 2. Read URLs from the specified file ---
    let urls_file = &args.file;
    if let Ok(lines) = read_lines(urls_file) {
        println!("Reading URLs from {}", urls_file);
        for (index, line) in lines.enumerate() {
            if let Ok(url) = line {
                let url = url.trim();
                if url.is_empty() {
                    continue;
                }
                println!("\nAnalyzing URL ({}): {}", index + 1, url);

                // --- 3. Run Lighthouse for each URL ---
                let report_file_name = url_to_filename(url, &report_prefix);
                let report_path = output_dir.join(&report_file_name);

                let mut lighthouse_command = Command::new("lighthouse");
                lighthouse_command
                    .arg(url)
                    .arg("--output=html")
                    .arg(format!("--output-path={}", report_path.to_str().unwrap()))
                    .arg("--view");

                // Add chrome flags to run in a headless environment and disable cache
                lighthouse_command.arg("--chrome-flags=--headless --no-sandbox --disable-cache");

                let output = lighthouse_command
                    .output()
                    .expect("Failed to execute Lighthouse command. Is it installed globally?");

                if output.status.success() {
                    println!(
                        "Successfully generated report: {}",
                        report_path.to_str().unwrap()
                    );
                } else {
                    eprintln!("Lighthouse failed for URL: {}", url);
                    eprintln!("Stderr: {}", String::from_utf8_lossy(&output.stderr));
                }
            }
        }
        println!(
            "\nAnalysis complete. Reports are saved in '{}'",
            output_dir.display()
        );
    } else {
        eprintln!(
            "Error: Could not open or read '{}'. Please make sure the file exists.",
            urls_file
        );
    }
}

/// Converts a URL into a safe filename with prefix and random string.
/// Example: "https://www.google.com/search?q=rust" -> "report_www_google_com_search_q_rust_abc123.html"
fn url_to_filename(url: &str, prefix: &str) -> String {
    let sanitized = url
        .replace("https://", "")
        .replace("http://", "")
        .chars()
        .map(|c| match c {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '-' => c,
            _ => '_',
        })
        .collect::<String>();

    // Generate a random string of 6 characters
    let random_string: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect();

    // To avoid overly long filenames, truncate if necessary
    let max_len = 80; // Reduced to account for prefix and random string
    let truncated = if sanitized.len() > max_len {
        &sanitized[..max_len]
    } else {
        &sanitized
    };

    format!("{}_{}__{}.html", prefix, truncated, random_string)
}

/// Reads a file line by line and returns an iterator over the lines.
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::fs::{self, File};
    use std::io::Write;
    use std::path::PathBuf;

    #[test]
    fn test_url_to_filename_basic() {
        let url = "https://www.google.com";
        let result = url_to_filename(url, "test");
        assert!(result.starts_with("test_www_google_com__"));
        assert!(result.ends_with(".html"));
    }

    #[test]
    fn test_url_to_filename_with_path() {
        let url = "https://www.example.com/path/to/page";
        let result = url_to_filename(url, "report");
        assert!(result.starts_with("report_www_example_com_path_to_page__"));
        assert!(result.ends_with(".html"));
    }

    #[test]
    fn test_url_to_filename_with_query_params() {
        let url = "https://www.google.com/search?q=rust&hl=en";
        let result = url_to_filename(url, "test");
        assert!(result.starts_with("test_www_google_com_search_q_rust_hl_en__"));
        assert!(result.ends_with(".html"));
    }

    #[test]
    fn test_url_to_filename_http_protocol() {
        let url = "http://example.com/test";
        let result = url_to_filename(url, "myprefix");
        assert!(result.starts_with("myprefix_example_com_test__"));
        assert!(result.ends_with(".html"));
    }

    #[test]
    fn test_url_to_filename_special_characters() {
        let url = "https://example.com/path/with-special@chars#fragment";
        let result = url_to_filename(url, "test");
        assert!(result.starts_with("test_example_com_path_with-special_chars_fragment__"));
        assert!(result.ends_with(".html"));
    }

    #[test]
    fn test_url_to_filename_long_url_truncation() {
        let long_path = "a".repeat(120);
        let url = format!("https://example.com/{}", long_path);
        let result = url_to_filename(&url, "test");

        // Should be truncated and contain prefix and random string
        assert!(result.starts_with("test_"));
        assert!(result.ends_with(".html"));
        assert!(result.contains("example_com_"));
        // Check that it's not excessively long
        assert!(result.len() < 150);
    }

    #[test]
    fn test_url_to_filename_preserves_allowed_chars() {
        let url = "https://sub-domain.example-site.com/path-with-dashes";
        let result = url_to_filename(url, "report");
        assert!(result.starts_with("report_sub-domain_example-site_com_path-with-dashes__"));
        assert!(result.ends_with(".html"));
    }

    #[test]
    fn test_read_lines_existing_file() {
        // Create a temporary test file
        let temp_dir = env::temp_dir();
        let test_file = temp_dir.join("test_urls.txt");

        {
            let mut file = File::create(&test_file).expect("Failed to create test file");
            writeln!(file, "https://www.example1.com").expect("Failed to write to test file");
            writeln!(file, "https://www.example2.com").expect("Failed to write to test file");
            writeln!(file, "").expect("Failed to write to test file"); // Empty line
            writeln!(file, "https://www.example3.com").expect("Failed to write to test file");
        }

        let lines_result = read_lines(&test_file);
        assert!(lines_result.is_ok());

        let lines: Vec<String> = lines_result.unwrap().map(|line| line.unwrap()).collect();

        assert_eq!(lines.len(), 4);
        assert_eq!(lines[0], "https://www.example1.com");
        assert_eq!(lines[1], "https://www.example2.com");
        assert_eq!(lines[2], ""); // Empty line
        assert_eq!(lines[3], "https://www.example3.com");

        // Clean up
        fs::remove_file(&test_file).expect("Failed to remove test file");
    }

    #[test]
    fn test_read_lines_nonexistent_file() {
        let nonexistent_file = "/path/that/does/not/exist.txt";
        let result = read_lines(nonexistent_file);
        assert!(result.is_err());
    }

    #[test]
    fn test_url_to_filename_edge_cases() {
        // Test empty-ish URL after protocol removal
        let url1 = "https://";
        let result1 = url_to_filename(url1, "test");
        assert!(result1.starts_with("test___"));
        assert!(result1.ends_with(".html"));

        // Test URL with only domain
        let url2 = "https://a.com";
        let result2 = url_to_filename(url2, "test");
        assert!(result2.starts_with("test_a_com__"));
        assert!(result2.ends_with(".html"));

        // Test URL with numbers
        let url3 = "https://example123.com/path456";
        let result3 = url_to_filename(url3, "test");
        assert!(result3.starts_with("test_example123_com_path456__"));
        assert!(result3.ends_with(".html"));
    }

    #[test]
    fn test_url_to_filename_unicode_characters() {
        let url = "https://example.com/café/naïve";
        let result = url_to_filename(url, "test");
        // Unicode characters should be replaced with underscores
        assert!(result.starts_with("test_example_com_caf__na_ve__"));
        assert!(result.ends_with(".html"));
    }

    #[test]
    fn test_url_to_filename_multiple_consecutive_special_chars() {
        let url = "https://example.com/path///with&&multiple@@special##chars";
        let result = url_to_filename(url, "test");
        assert!(result.starts_with("test_example_com_path___with__multiple__special__chars__"));
        assert!(result.ends_with(".html"));
    }

    // Integration test helper for creating temporary URLs file
    fn create_temp_urls_file(urls: &[&str]) -> PathBuf {
        let temp_dir = env::temp_dir();
        let test_file = temp_dir.join(format!("test_urls_{}.txt", std::process::id()));

        {
            let mut file = File::create(&test_file).expect("Failed to create test file");
            for url in urls {
                writeln!(file, "{}", url).expect("Failed to write to test file");
            }
        }

        test_file
    }

    #[test]
    fn test_integration_multiple_urls() {
        let test_urls = vec![
            "https://www.google.com",
            "https://github.com/rust-lang/rust",
            "http://example.com/test?param=value",
        ];

        let temp_file = create_temp_urls_file(&test_urls);

        // Test that we can read all URLs
        let lines_result = read_lines(&temp_file);
        assert!(lines_result.is_ok());

        let urls: Vec<String> = lines_result
            .unwrap()
            .map(|line| line.unwrap().trim().to_string())
            .filter(|line| !line.is_empty())
            .collect();

        assert_eq!(urls.len(), 3);

        // Test filename generation for each URL
        let filenames: Vec<String> = urls
            .iter()
            .map(|url| url_to_filename(url, "test"))
            .collect();

        // Check that all filenames start with prefix and end with .html
        for filename in &filenames {
            assert!(filename.starts_with("test_"));
            assert!(filename.ends_with(".html"));
        }

        // Check that filenames contain expected URL parts
        assert!(filenames[0].contains("www_google_com"));
        assert!(filenames[1].contains("github_com_rust-lang_rust"));
        assert!(filenames[2].contains("example_com_test_param_value"));

        // Clean up
        fs::remove_file(&temp_file).expect("Failed to remove test file");
    }
}
