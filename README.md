# Colocation Locator - AWS Partners

A comprehensive web application to locate and visualize colocation facilities for AWS partners including Megaport, Equinix, and 11:11 Systems worldwide.

## 🌟 Features

- **Interactive World Map**: Visualize all colocation facilities on an interactive map
- **Advanced Filtering**: Filter by provider (Megaport, Equinix, 11:11 Systems) and region
- **Real-time Data**: Automatically updated weekly from PeeringDB and other sources
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Regional Coverage**: Covers APJ, EMEA, North America, South America, and South Africa
- **Detailed Information**: View facility details including exact coordinates and addresses

## 🚀 Live Demo

Visit the live application: [https://mandar301190.github.io/Colocation-locator/](https://mandar301190.github.io/Colocation-locator/)

## 📊 Data Sources

- **Megaport**: [PeeringDB Network 27330](https://www.peeringdb.com/net/27330)
- **Equinix**: [PeeringDB Organization 2](https://www.peeringdb.com/org/2)
- **11:11 Systems**: [DataCenters.com](https://www.datacenters.com/providers/11-11-systems/data-center-locations)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Data Storage**: Browser localStorage with weekly refresh
- **Automation**: GitHub Actions for weekly data updates
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
colocation-locator/
├── README.md               # Project documentation
├── _config.yml            # Jekyll configuration for GitHub Pages
├── docs/                  # Production files (served by GitHub Pages)
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   ├── data/             # Production data files
│   └── *.svg             # Icons and assets
├── src/                   # Source files and development code
│   ├── index.html        # Development HTML
│   ├── script.js         # Development JavaScript
│   ├── styles.css        # Development CSS
│   ├── package.json      # Node.js dependencies
│   ├── update-data.js    # Data update script
│   ├── data/             # Source data files
│   └── *.py              # Python utility scripts
└── .github/workflows/    # GitHub Actions automation
    └── update-data.yml
```

## 🔧 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mandar301190/Colocation-locator.git
   cd Colocation-locator
   ```

2. **Navigate to source directory**:
   ```bash
   cd src
   ```

3. **Install dependencies** (for data updates):
   ```bash
   npm install
   ```

4. **Serve locally**:
   ```bash
   # Using Python (from src directory)
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

5. **Open in browser**:
   Navigate to `http://localhost:8000`

## 🔄 Data Updates

The application automatically updates data weekly via GitHub Actions. The workflow:

1. Runs every Sunday at 2 AM UTC
2. Fetches latest data from PeeringDB APIs
3. Updates JSON files in both `src/data/` and `docs/data/` directories
4. Commits changes back to the repository

### Manual Data Update

To manually trigger a data update:

**Via GitHub Actions:**
1. Go to the "Actions" tab in the GitHub repository
2. Select "Update Colocation Data" workflow
3. Click "Run workflow"

**Via Command Line:**
```bash
cd src
node update-data.js
```

## 🌍 Regional Coverage

- **APJ (Asia-Pacific)**: Australia, Singapore, Japan, Hong Kong, India, etc.
- **EMEA (Europe, Middle East, Africa)**: UK, Germany, Netherlands, France, etc.
- **North America**: United States, Canada, Mexico
- **South America**: Brazil, Argentina, Chile, etc.
- **South Africa**: South African facilities

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Color-coded Providers**: Each provider has distinct colors for easy identification
- **Interactive Elements**: Hover effects, smooth transitions, and responsive design
- **Statistics Dashboard**: Real-time counts of total and filtered locations
- **Mobile Responsive**: Optimized for all screen sizes

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PeeringDB](https://www.peeringdb.com/) for providing comprehensive facility data
- [Leaflet.js](https://leafletjs.com/) for the interactive mapping functionality
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- AWS Partner Network for the inspiration

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainer.

---

**Last Updated**: February 2026  
**Maintained by**: mandar301190