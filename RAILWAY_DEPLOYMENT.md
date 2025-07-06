# Railway Deployment Guide for Batch Analyzer

This guide explains how to deploy the Batch Analyzer project on Railway with both the Rust CLI tool and Next.js web UI.

## What's Included

The Docker deployment includes:
- **Rust CLI Tool**: The main batch analyzer binary (`batch_analyzer`)
- **Next.js Web UI**: A web interface running on port 3000
- **Google Chrome**: Headless browser for Lighthouse
- **Lighthouse**: Google's web performance auditing tool

## Railway Deployment Steps

### 1. Prepare Your Repository

Ensure your repository contains:
- `Dockerfile`
- `.dockerignore`
- `railway.json`
- All source code for both Rust CLI and Next.js web UI

### 2. Deploy to Railway

1. **Connect Repository**:
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your batch-analyzer repository

2. **Configure Build**:
   Railway will automatically detect the `Dockerfile` and `railway.json` configuration.

3. **Set Environment Variables** (Optional):
   In Railway dashboard, go to Variables tab and set:
   ```
   NODE_ENV=production
   BATCH_ANALYZER_NAME=railway-analysis
   BATCH_ANALYZER_REPORT_PREFIX=page
   ```

### 3. Access Your Deployment

Once deployed, you'll have:
- **Web UI**: Available at your Railway app URL (e.g., `https://your-app.railway.app`)
- **CLI Tool**: Available inside the container as `/usr/local/bin/batch_analyzer`

## Using the CLI Tool in Railway

### Option 1: Connect via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Execute commands in the container
railway run batch_analyzer --name "my-analysis" --file "urls.txt"
```

### Option 2: Use the Web UI

The Next.js web interface provides a user-friendly way to:
- Upload URL files
- Configure analysis settings
- View generated reports
- Download results

## File Structure in Container

```
/app/
├── batch_analyzer          # Rust CLI binary (symlinked to /usr/local/bin/)
├── .next/                  # Built Next.js application
├── node_modules/           # Node.js dependencies
├── public/                 # Static assets
├── package.json           # Node.js configuration
├── urls.txt               # Default URL list
├── example-urls.txt       # Example URLs
├── reports/               # Generated reports directory
└── start.sh              # Startup script
```

## Environment Variables

The following environment variables are configured:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `3000` | Web UI port |
| `BATCH_ANALYZER_NAME` | `railway-analysis` | Default analysis name |
| `BATCH_ANALYZER_REPORT_PREFIX` | `page` | Report file prefix |
| `CHROME_FLAGS` | `--headless --no-sandbox --disable-cache --disable-dev-shm-usage --disable-gpu` | Chrome flags for container |

## Customizing Your Deployment

### Adding Custom URLs

1. **Via Environment**: Update the default URLs by mounting a custom file
2. **Via Web UI**: Upload your URL list through the web interface
3. **Via CLI**: Use the `--file` parameter with your custom URL file

### Persistent Storage

Railway provides ephemeral storage by default. For persistent reports:
1. Use Railway's volume mounts for the `/app/reports` directory
2. Or configure external storage (S3, etc.) in your application

### Scaling Considerations

For high-volume analysis:
- Consider increasing Railway's resource allocation
- Implement queue-based processing for large URL lists
- Add Redis or database for job tracking

## Troubleshooting

### Common Issues

1. **Chrome/Lighthouse Failures**:
   - Ensure sufficient memory allocation in Railway
   - Check Chrome flags are properly set for container environment

2. **Build Timeouts**:
   - The multi-stage build can take 10-15 minutes
   - Ensure Railway has sufficient build time allocated

3. **Memory Issues**:
   - Chrome requires significant memory for Lighthouse
   - Upgrade Railway plan if needed for memory-intensive workloads

### Debugging

1. **Check Logs**:
   ```bash
   railway logs
   ```

2. **Connect to Container**:
   ```bash
   railway shell
   ```

3. **Test CLI Tool**:
   ```bash
   railway run batch_analyzer --help
   ```

## Resource Requirements

**Minimum Recommended**:
- RAM: 2GB (for Chrome/Lighthouse)
- CPU: 1 vCPU
- Storage: 1GB (for reports and dependencies)

**Production Recommended**:
- RAM: 4GB+
- CPU: 2+ vCPUs
- Storage: 5GB+ (depending on report volume)

## Security Notes

- The container runs Chrome in sandbox-disabled mode (required for containers)
- Reports are stored in ephemeral container storage by default
- Consider implementing authentication for production web UI access
- Use Railway's environment variables for sensitive configuration

## Support

For issues specific to this deployment:
1. Check Railway deployment logs
2. Verify Dockerfile build process
3. Test CLI tool functionality via Railway shell
4. Ensure all dependencies are properly installed

The deployment should provide a fully functional batch analyzer with both CLI and web interfaces, suitable for running web performance audits at scale on Railway's platform.
