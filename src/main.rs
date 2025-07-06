use std::fs::{self, File};
use std::io::{self, BufRead};
use std::path::Path;
use std::process::Command;
use std::env;
use chrono::Local;
use clap::Parser;
use dotenv::dotenv;

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
        },
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
                let report_file_name = url_to_filename(url);
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
                    println!("Successfully generated report: {}", report_path.to_str().unwrap());
                } else {
                    eprintln!("Lighthouse failed for URL: {}", url);
                    eprintln!("Stderr: {}", String::from_utf8_lossy(&output.stderr));
                }
            }
        }
        println!("\nAnalysis complete. Reports are saved in '{}'", output_dir.display());
    } else {
        eprintln!("Error: Could not open or read '{}'. Please make sure the file exists.", urls_file);
    }
}

/// Converts a URL into a safe filename.
/// Example: "https://www.google.com/search?q=rust" -> "www_google_com_search_q_rust.html"
fn url_to_filename(url: &str) -> String {
    let sanitized = url
        .replace("https://", "")
        .replace("http://", "")
        .chars()
        .map(|c| match c {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '-' => c,
            _ => '_',
        })
        .collect::<String>();
    
    // To avoid overly long filenames, truncate if necessary
    let max_len = 100;
    let truncated = if sanitized.len() > max_len {
        &sanitized[..max_len]
    } else {
        &sanitized
    };

    format!("{}.html", truncated)
}


/// Reads a file line by line and returns an iterator over the lines.
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where P: AsRef<Path>, {
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

