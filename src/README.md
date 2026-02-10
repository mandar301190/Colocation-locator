# Source Files

This directory contains all the source code and development files for the Colocation Locator project.

## Directory Structure

```
src/
├── data/                    # JSON data files for locations
│   ├── megaport.json       # Megaport locations
│   ├── equinix.json        # Equinix locations
│   ├── 1111systems.json    # 11:11 Systems locations
│   └── all-locations.json  # Combined locations data
├── index.html              # Main HTML file (development version)
├── script.js               # Main JavaScript file (development version)
├── styles.css              # Main CSS file (development version)
├── package.json            # Node.js dependencies
├── update-data.js          # Script to fetch and update location data from PeeringDB
├── direct-connect-icon.svg # AWS Direct Connect icon
├── favicon.svg             # Website favicon
└── *.py                    # Python utility scripts for data processing
```

## Development Files

### Main Application Files
- **index.html** - Main HTML structure
- **script.js** - Application logic and map functionality
- **styles.css** - Styling and UI design

### Data Management
- **update-data.js** - Automated script to fetch location data from PeeringDB API
- **data/** - Directory containing JSON files with location data

### Python Utilities
- **add_missing_brazil.py** - Script to add missing Brazil locations
- **fetch_megaport_update.py** - Fetch Megaport data updates
- **fetch_real_data.py** - Fetch real data from various sources
- **fix_naming.py** - Fix location naming inconsistencies
- **update_megaport_from_html.py** - Update Megaport data from HTML sources

### Assets
- **direct-connect-icon.svg** - AWS Direct Connect service icon
- **favicon.svg** - Website favicon

## Production Files

The production version of the application is in the `/docs` folder at the repository root, which is served by GitHub Pages.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Open `index.html` in a web browser or use a local server:
   ```bash
   npm start
   ```

## Updating Location Data

To manually update location data from PeeringDB:

```bash
node update-data.js
```

This script automatically runs weekly via GitHub Actions.
