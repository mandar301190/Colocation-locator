class ColocationLocator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.allLocations = [];
        this.filteredLocations = [];
        this.init();
    }

    async init() {
        this.initMap();
        this.setupEventListeners();
        await this.loadData();
        this.updateLastUpdated();
    }

    initMap() {
        this.map = L.map('map').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
    }

    setupEventListeners() {
        document.getElementById('provider-select').addEventListener('change', () => this.filterLocations());
        document.getElementById('region-select').addEventListener('change', () => this.filterLocations());
        document.getElementById('refresh-data').addEventListener('click', () => this.refreshData());
    }

    async loadData() {
        try {
            // Load cached data first
            const cachedData = this.getCachedData();
            if (cachedData && this.isDataFresh(cachedData.timestamp)) {
                this.allLocations = cachedData.locations;
                this.displayLocations();
                return;
            }

            // Fetch fresh data
            document.getElementById('locations-container').innerHTML = '<div class="loading">Fetching latest data...</div>';
            
            const [megaportData, equinixData, systems1111Data] = await Promise.all([
                this.fetchMegaportData(),
                this.fetchEquinixData(),
                this.fetchSystems1111Data()
            ]);

            this.allLocations = [...megaportData, ...equinixData, ...systems1111Data];
            this.cacheData(this.allLocations);
            this.displayLocations();
            
        } catch (error) {
            console.error('Error loading data:', error);
            document.getElementById('locations-container').innerHTML = 
                '<div class="loading">Error loading data. Please try refreshing.</div>';
        }
    }

    async fetchMegaportData() {
        // Simulated Megaport data - In production, this would fetch from PeeringDB API
        return [
            { name: 'Megaport Sydney', provider: 'megaport', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Megaport Melbourne', provider: 'megaport', region: 'APJ', country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
            { name: 'Megaport Singapore', provider: 'megaport', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Megaport Tokyo', provider: 'megaport', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Megaport Hong Kong', provider: 'megaport', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: 'Megaport London', provider: 'megaport', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: 'Megaport Amsterdam', provider: 'megaport', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Megaport Frankfurt', provider: 'megaport', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Megaport New York', provider: 'megaport', region: 'North America', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: 'Megaport Los Angeles', provider: 'megaport', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Megaport Chicago', provider: 'megaport', region: 'North America', country: 'United States', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
            { name: 'Megaport Dallas', provider: 'megaport', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 }
        ];
    }

    async fetchEquinixData() {
        // Simulated Equinix data - In production, this would fetch from PeeringDB API
        return [
            { name: 'Equinix SY1', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Equinix SY3', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8600, lng: 151.2000 },
            { name: 'Equinix ME1', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
            { name: 'Equinix SG1', provider: 'equinix', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Equinix SG2', provider: 'equinix', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3400, lng: 103.8000 },
            { name: 'Equinix TY2', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY8', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6800, lng: 139.6600 },
            { name: 'Equinix HK1', provider: 'equinix', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: 'Equinix LD5', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: 'Equinix LD8', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5100, lng: -0.1200 },
            { name: 'Equinix AM1', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM3', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3700, lng: 4.9100 },
            { name: 'Equinix FR2', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Equinix FR5', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1200, lng: 8.6900 },
            { name: 'Equinix NY1', provider: 'equinix', region: 'North America', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: 'Equinix NY4', provider: 'equinix', region: 'North America', country: 'United States', city: 'New York', lat: 40.7200, lng: -74.0000 },
            { name: 'Equinix LA1', provider: 'equinix', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Equinix LA3', provider: 'equinix', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0600, lng: -118.2500 },
            { name: 'Equinix CH1', provider: 'equinix', region: 'North America', country: 'United States', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
            { name: 'Equinix DA1', provider: 'equinix', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Equinix SP1', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Equinix RJ1', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 }
        ];
    }

    async fetchSystems1111Data() {
        // Simulated 11:11 Systems data - In production, this would scrape from datacenters.com
        return [
            { name: '11:11 Systems London', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: '11:11 Systems Manchester', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            { name: '11:11 Systems Birmingham', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Birmingham', lat: 52.4862, lng: -1.8904 },
            { name: '11:11 Systems Dublin', provider: '1111systems', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            { name: '11:11 Systems Amsterdam', provider: '1111systems', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: '11:11 Systems New York', provider: '1111systems', region: 'North America', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: '11:11 Systems Los Angeles', provider: '1111systems', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 }
        ];
    }

    displayLocations() {
        this.filteredLocations = [...this.allLocations];
        this.filterLocations();
    }

    filterLocations() {
        const providerFilter = document.getElementById('provider-select').value;
        const regionFilter = document.getElementById('region-select').value;

        this.filteredLocations = this.allLocations.filter(location => {
            const providerMatch = !providerFilter || location.provider === providerFilter;
            const regionMatch = !regionFilter || location.region === regionFilter;
            return providerMatch && regionMatch;
        });

        this.updateMap();
        this.updateLocationsList();
        this.updateStats();
    }

    updateMap() {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Add new markers
        this.filteredLocations.forEach(location => {
            const marker = L.marker([location.lat, location.lng])
                .bindPopup(`
                    <div class="popup-content">
                        <h4>${location.name}</h4>
                        <p><strong>Provider:</strong> ${this.getProviderDisplayName(location.provider)}</p>
                        <p><strong>Location:</strong> ${location.city}, ${location.country}</p>
                        <p><strong>Region:</strong> ${location.region}</p>
                    </div>
                `);
            
            marker.addTo(this.map);
            this.markers.push(marker);
        });

        // Fit map to show all markers
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    updateLocationsList() {
        const container = document.getElementById('locations-container');
        
        if (this.filteredLocations.length === 0) {
            container.innerHTML = '<div class="loading">No locations found for the selected filters.</div>';
            return;
        }

        const html = this.filteredLocations.map(location => `
            <div class="location-item ${location.provider}" onclick="colocationLocator.focusLocation(${location.lat}, ${location.lng})">
                <div class="location-name">${location.name}</div>
                <div class="location-details">${location.city}, ${location.country}</div>
                <div class="location-details">${location.region}</div>
                <span class="provider-badge ${location.provider}">${this.getProviderDisplayName(location.provider)}</span>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateStats() {
        document.getElementById('total-locations').textContent = this.allLocations.length;
        document.getElementById('filtered-locations').textContent = this.filteredLocations.length;
    }

    focusLocation(lat, lng) {
        this.map.setView([lat, lng], 10);
    }

    getProviderDisplayName(provider) {
        const names = {
            'megaport': 'Megaport',
            'equinix': 'Equinix',
            '1111systems': '11:11 Systems'
        };
        return names[provider] || provider;
    }

    getCachedData() {
        const cached = localStorage.getItem('colocation-data');
        return cached ? JSON.parse(cached) : null;
    }

    cacheData(locations) {
        const data = {
            locations,
            timestamp: Date.now()
        };
        localStorage.setItem('colocation-data', JSON.stringify(data));
    }

    isDataFresh(timestamp) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        return Date.now() - timestamp < oneWeek;
    }

    async refreshData() {
        localStorage.removeItem('colocation-data');
        await this.loadData();
        this.updateLastUpdated();
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('last-update').textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    }
}

// Initialize the application
const colocationLocator = new ColocationLocator();