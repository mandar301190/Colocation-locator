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
    }

    initMap() {
        this.map = L.map('map').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add click event to find nearest locations
        this.map.on('click', (e) => {
            this.mapClicked = true;
            this.findNearestLocations(e.latlng);
        });
        
        // Store click marker, nearest markers, and lines
        this.clickMarker = null;
        this.nearestMarkers = [];
        this.nearestLines = [];
        this.mapClicked = false;
    }

    setupEventListeners() {
        document.getElementById('provider-select').addEventListener('change', () => this.filterLocations());
        document.getElementById('region-select').addEventListener('change', () => this.filterLocations());
        document.getElementById('refresh-data').addEventListener('click', () => this.refreshData());
        
        // Hide nearest locations section when clicking outside the map
        document.addEventListener('click', (e) => {
            // Skip if this was a map click
            if (this.mapClicked) {
                this.mapClicked = false;
                return;
            }
            
            const mapContainer = document.querySelector('.map-container');
            const nearestSection = document.getElementById('nearest-locations-list');
            
            // Check if click is outside map container and nearest section is visible
            if (nearestSection && 
                nearestSection.style.display !== 'none' && 
                !mapContainer.contains(e.target) && 
                !nearestSection.contains(e.target)) {
                this.clearNearestLocations();
            }
        });
    }

    clearNearestLocations() {
        // Remove markers and lines from map
        if (this.clickMarker) {
            this.map.removeLayer(this.clickMarker);
            this.clickMarker = null;
        }
        this.nearestMarkers.forEach(marker => this.map.removeLayer(marker));
        this.nearestMarkers = [];
        this.nearestLines.forEach(line => this.map.removeLayer(line));
        this.nearestLines = [];
        
        // Hide the nearest locations section
        const container = document.getElementById('nearest-locations-list');
        if (container) {
            container.style.display = 'none';
        }
    }

    async loadData() {
        try {
            // Load cached data first
            const cachedData = this.getCachedData();
            if (cachedData && this.isDataFresh(cachedData.timestamp)) {
                this.allLocations = cachedData.locations;
                this.displayLocations();
                this.updateLastUpdated(cachedData.timestamp);
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
            const timestamp = Date.now();
            this.cacheData(this.allLocations, timestamp);
            this.displayLocations();
            this.updateLastUpdated(timestamp);
            
        } catch (error) {
            console.error('Error loading data:', error);
            document.getElementById('locations-container').innerHTML = 
                '<div class="loading">Error loading data. Please try refreshing.</div>';
        }
    }

    async fetchMegaportData() {
        // Load Megaport data from JSON file
        try {
            const response = await fetch('data/megaport.json');
            if (!response.ok) {
                console.warn('Could not load megaport.json, using fallback data');
                return this.getFallbackMegaportData();
            }
            const data = await response.json();
            console.log(`Loaded ${data.length} Megaport locations from JSON`);
            return data;
        } catch (error) {
            console.warn('Error loading megaport.json:', error);
            return this.getFallbackMegaportData();
        }
    }

    getFallbackMegaportData() {
        // Fallback Megaport data in case JSON file is not available
        return [
            // North America
            { name: 'Megaport New York (60 Hudson)', provider: 'megaport', region: 'North America', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: 'Megaport New York (111 8th Ave)', provider: 'megaport', region: 'North America', country: 'United States', city: 'New York', lat: 40.7505, lng: -74.0014 },
            { name: 'Megaport Secaucus', provider: 'megaport', region: 'North America', country: 'United States', city: 'Secaucus', lat: 40.7895, lng: -74.0565 },
            { name: 'Megaport Los Angeles (One Wilshire)', provider: 'megaport', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Megaport Los Angeles (El Segundo)', provider: 'megaport', region: 'North America', country: 'United States', city: 'El Segundo', lat: 33.9192, lng: -118.4165 },
            { name: 'Megaport Chicago', provider: 'megaport', region: 'North America', country: 'United States', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
            { name: 'Megaport Dallas', provider: 'megaport', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Megaport Dallas (Richardson)', provider: 'megaport', region: 'North America', country: 'United States', city: 'Richardson', lat: 32.9483, lng: -96.7299 },
            { name: 'Megaport Dallas (Plano)', provider: 'megaport', region: 'North America', country: 'United States', city: 'Plano', lat: 33.0198, lng: -96.6989 },
            { name: 'Megaport Ashburn', provider: 'megaport', region: 'North America', country: 'United States', city: 'Ashburn', lat: 39.0437, lng: -77.4875 },
            { name: 'Megaport Sterling', provider: 'megaport', region: 'North America', country: 'United States', city: 'Sterling', lat: 39.0062, lng: -77.4286 },
            { name: 'Megaport San Jose', provider: 'megaport', region: 'North America', country: 'United States', city: 'San Jose', lat: 37.3382, lng: -121.8863 },
            { name: 'Megaport Santa Clara', provider: 'megaport', region: 'North America', country: 'United States', city: 'Santa Clara', lat: 37.3541, lng: -121.9552 },
            { name: 'Megaport Seattle', provider: 'megaport', region: 'North America', country: 'United States', city: 'Seattle', lat: 47.6062, lng: -122.3321 },
            { name: 'Megaport Miami', provider: 'megaport', region: 'North America', country: 'United States', city: 'Miami', lat: 25.7617, lng: -80.1918 },
            { name: 'Megaport Atlanta', provider: 'megaport', region: 'North America', country: 'United States', city: 'Atlanta', lat: 33.7490, lng: -84.3880 },
            { name: 'Megaport Phoenix', provider: 'megaport', region: 'North America', country: 'United States', city: 'Phoenix', lat: 33.4484, lng: -112.0740 },
            { name: 'Megaport Denver', provider: 'megaport', region: 'North America', country: 'United States', city: 'Denver', lat: 39.7392, lng: -104.9903 },
            { name: 'Megaport Boston', provider: 'megaport', region: 'North America', country: 'United States', city: 'Boston', lat: 42.3601, lng: -71.0589 },
            { name: 'Megaport Toronto', provider: 'megaport', region: 'North America', country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
            { name: 'Megaport Montreal', provider: 'megaport', region: 'North America', country: 'Canada', city: 'Montreal', lat: 45.5017, lng: -73.5673 },
            { name: 'Megaport Vancouver', provider: 'megaport', region: 'North America', country: 'Canada', city: 'Vancouver', lat: 49.2827, lng: -123.1207 },
            
            // EMEA
            { name: 'Megaport London (Slough)', provider: 'megaport', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: 'Megaport London (Docklands)', provider: 'megaport', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.0278 },
            { name: 'Megaport Manchester', provider: 'megaport', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            { name: 'Megaport Amsterdam', provider: 'megaport', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Megaport Frankfurt', provider: 'megaport', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Megaport Paris', provider: 'megaport', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Megaport Madrid', provider: 'megaport', region: 'EMEA', country: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
            { name: 'Megaport Barcelona', provider: 'megaport', region: 'EMEA', country: 'Spain', city: 'Barcelona', lat: 41.3851, lng: 2.1734 },
            { name: 'Megaport Milan', provider: 'megaport', region: 'EMEA', country: 'Italy', city: 'Milan', lat: 45.4642, lng: 9.1900 },
            { name: 'Megaport Stockholm', provider: 'megaport', region: 'EMEA', country: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
            { name: 'Megaport Dublin', provider: 'megaport', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            { name: 'Megaport Zurich', provider: 'megaport', region: 'EMEA', country: 'Switzerland', city: 'Zurich', lat: 47.3769, lng: 8.5417 },
            { name: 'Megaport Vienna', provider: 'megaport', region: 'EMEA', country: 'Austria', city: 'Vienna', lat: 48.2082, lng: 16.3738 },
            { name: 'Megaport Warsaw', provider: 'megaport', region: 'EMEA', country: 'Poland', city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
            { name: 'Megaport Helsinki', provider: 'megaport', region: 'EMEA', country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
            
            // APJ
            { name: 'Megaport Sydney', provider: 'megaport', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Megaport Melbourne', provider: 'megaport', region: 'APJ', country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
            { name: 'Megaport Brisbane', provider: 'megaport', region: 'APJ', country: 'Australia', city: 'Brisbane', lat: -27.4698, lng: 153.0251 },
            { name: 'Megaport Perth', provider: 'megaport', region: 'APJ', country: 'Australia', city: 'Perth', lat: -31.9505, lng: 115.8605 },
            { name: 'Megaport Adelaide', provider: 'megaport', region: 'APJ', country: 'Australia', city: 'Adelaide', lat: -34.9285, lng: 138.6007 },
            { name: 'Megaport Singapore', provider: 'megaport', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Megaport Tokyo', provider: 'megaport', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Megaport Osaka', provider: 'megaport', region: 'APJ', country: 'Japan', city: 'Osaka', lat: 34.6937, lng: 135.5023 },
            { name: 'Megaport Hong Kong', provider: 'megaport', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: 'Megaport Seoul', provider: 'megaport', region: 'APJ', country: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780 },
            { name: 'Megaport Mumbai', provider: 'megaport', region: 'APJ', country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Megaport Chennai', provider: 'megaport', region: 'APJ', country: 'India', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
            { name: 'Megaport Auckland', provider: 'megaport', region: 'APJ', country: 'New Zealand', city: 'Auckland', lat: -36.8485, lng: 174.7633 },
            { name: 'Megaport Jakarta', provider: 'megaport', region: 'APJ', country: 'Indonesia', city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
            { name: 'Megaport Kuala Lumpur', provider: 'megaport', region: 'APJ', country: 'Malaysia', city: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
            
            // South America
            { name: 'Megaport São Paulo', provider: 'megaport', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Megaport Rio de Janeiro', provider: 'megaport', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
            { name: 'Megaport Santiago', provider: 'megaport', region: 'South America', country: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
            { name: 'Megaport Bogota', provider: 'megaport', region: 'South America', country: 'Colombia', city: 'Bogota', lat: 4.7110, lng: -74.0721 },
            { name: 'Megaport Lima', provider: 'megaport', region: 'South America', country: 'Peru', city: 'Lima', lat: -12.0464, lng: -77.0428 }
        ];
    }

    async fetchEquinixData() {
        // Comprehensive Equinix data based on PeeringDB facilities
        return [
            // North America
            { name: 'Equinix DC1-DC15 - Ashburn', provider: 'equinix', region: 'North America', country: 'United States', city: 'Ashburn', lat: 39.0437, lng: -77.4875 },
            { name: 'Equinix DC7 - Vienna', provider: 'equinix', region: 'North America', country: 'United States', city: 'Vienna', lat: 38.9012, lng: -77.2653 },
            { name: 'Equinix DC8 - Vienna', provider: 'equinix', region: 'North America', country: 'United States', city: 'Vienna', lat: 38.9012, lng: -77.2653 },
            { name: 'Equinix NY1 - Newark', provider: 'equinix', region: 'North America', country: 'United States', city: 'Newark', lat: 40.7357, lng: -74.1724 },
            { name: 'Equinix NY2/NY4/NY5/NY6 - Secaucus', provider: 'equinix', region: 'North America', country: 'United States', city: 'Secaucus', lat: 40.7895, lng: -74.0565 },
            { name: 'Equinix NY8 - 60 Hudson', provider: 'equinix', region: 'North America', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: 'Equinix NY9 - 111 8th Avenue', provider: 'equinix', region: 'North America', country: 'United States', city: 'New York', lat: 40.7505, lng: -74.0014 },
            { name: 'Equinix CH1/CH2/CH4 - Chicago', provider: 'equinix', region: 'North America', country: 'United States', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
            { name: 'Equinix CH3 - Elk Grove', provider: 'equinix', region: 'North America', country: 'United States', city: 'Elk Grove Village', lat: 42.0039, lng: -87.9703 },
            { name: 'Equinix DA1 - Dallas', provider: 'equinix', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Equinix DA2 - Dallas', provider: 'equinix', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Equinix DA3 - Dallas', provider: 'equinix', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Equinix DA4 - Dallas', provider: 'equinix', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Equinix DA6 - Dallas', provider: 'equinix', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Equinix DA7 - Plano', provider: 'equinix', region: 'North America', country: 'United States', city: 'Plano', lat: 33.0198, lng: -96.6989 },
            { name: 'Equinix DA11 - Dallas', provider: 'equinix', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Equinix LA1 - Los Angeles', provider: 'equinix', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Equinix LA2 - Los Angeles', provider: 'equinix', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Equinix LA3/LA4 - El Segundo', provider: 'equinix', region: 'North America', country: 'United States', city: 'El Segundo', lat: 33.9192, lng: -118.4165 },
            { name: 'Equinix LA5 - Los Angeles', provider: 'equinix', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Equinix LA7 - Los Angeles', provider: 'equinix', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Equinix SV1/SV5/SV10 - San Jose', provider: 'equinix', region: 'North America', country: 'United States', city: 'San Jose', lat: 37.3382, lng: -121.8863 },
            { name: 'Equinix SV2 - Santa Clara', provider: 'equinix', region: 'North America', country: 'United States', city: 'Santa Clara', lat: 37.3541, lng: -121.9552 },
            { name: 'Equinix SV3 - San Jose', provider: 'equinix', region: 'North America', country: 'United States', city: 'San Jose', lat: 37.3382, lng: -121.8863 },
            { name: 'Equinix SV4 - Sunnyvale', provider: 'equinix', region: 'North America', country: 'United States', city: 'Sunnyvale', lat: 37.3688, lng: -122.0363 },
            { name: 'Equinix SV6 - Sunnyvale', provider: 'equinix', region: 'North America', country: 'United States', city: 'Sunnyvale', lat: 37.3688, lng: -122.0363 },
            { name: 'Equinix SV8 - Palo Alto', provider: 'equinix', region: 'North America', country: 'United States', city: 'Palo Alto', lat: 37.4419, lng: -122.1430 },
            { name: 'Equinix SV17 - Santa Clara', provider: 'equinix', region: 'North America', country: 'United States', city: 'Santa Clara', lat: 37.3541, lng: -121.9552 },
            { name: 'Equinix SE2/SE3 - Seattle', provider: 'equinix', region: 'North America', country: 'United States', city: 'Seattle', lat: 47.6062, lng: -122.3321 },
            { name: 'Equinix SE4 - Kent', provider: 'equinix', region: 'North America', country: 'United States', city: 'Kent', lat: 47.3809, lng: -122.2348 },
            { name: 'Equinix MI1 - Miami', provider: 'equinix', region: 'North America', country: 'United States', city: 'Miami', lat: 25.7617, lng: -80.1918 },
            { name: 'Equinix MI2 - Miami', provider: 'equinix', region: 'North America', country: 'United States', city: 'Miami', lat: 25.7617, lng: -80.1918 },
            { name: 'Equinix MI3 - Boca Raton', provider: 'equinix', region: 'North America', country: 'United States', city: 'Boca Raton', lat: 26.3683, lng: -80.1289 },
            { name: 'Equinix MI6 - Doral', provider: 'equinix', region: 'North America', country: 'United States', city: 'Doral', lat: 25.8198, lng: -80.3556 },
            { name: 'Equinix AT1 - Atlanta', provider: 'equinix', region: 'North America', country: 'United States', city: 'Atlanta', lat: 33.7490, lng: -84.3880 },
            { name: 'Equinix AT2/AT3 - Atlanta', provider: 'equinix', region: 'North America', country: 'United States', city: 'Atlanta', lat: 33.7490, lng: -84.3880 },
            { name: 'Equinix AT4 - Atlanta', provider: 'equinix', region: 'North America', country: 'United States', city: 'Atlanta', lat: 33.7490, lng: -84.3880 },
            { name: 'Equinix BO1 - Waltham', provider: 'equinix', region: 'North America', country: 'United States', city: 'Waltham', lat: 42.3765, lng: -71.2356 },
            { name: 'Equinix BO2 - Billerica', provider: 'equinix', region: 'North America', country: 'United States', city: 'Billerica', lat: 42.5584, lng: -71.2690 },
            { name: 'Equinix DE1 - Englewood', provider: 'equinix', region: 'North America', country: 'United States', city: 'Englewood', lat: 39.6478, lng: -104.9875 },
            { name: 'Equinix DE2 - Denver', provider: 'equinix', region: 'North America', country: 'United States', city: 'Denver', lat: 39.7392, lng: -104.9903 },
            { name: 'Equinix PH1 - Philadelphia', provider: 'equinix', region: 'North America', country: 'United States', city: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
            { name: 'Equinix HO1 - Houston', provider: 'equinix', region: 'North America', country: 'United States', city: 'Houston', lat: 29.7604, lng: -95.3698 },
            { name: 'Equinix CU1/CU2/CU3/CU4 - Culpeper', provider: 'equinix', region: 'North America', country: 'United States', city: 'Culpeper', lat: 38.4732, lng: -78.0047 },
            
            // Canada
            { name: 'Equinix TR1 - Toronto', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
            { name: 'Equinix TR2 - Toronto', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
            { name: 'Equinix TR4 - Toronto', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
            { name: 'Equinix TR5 - Markham', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Markham', lat: 43.8561, lng: -79.3370 },
            { name: 'Equinix TR6 - Brampton', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Brampton', lat: 43.7315, lng: -79.7624 },
            { name: 'Equinix TR7 - Brampton', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Brampton', lat: 43.7315, lng: -79.7624 },
            { name: 'Equinix MT1 - Montreal', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Montreal', lat: 45.5017, lng: -73.5673 },
            { name: 'Equinix MT2 - Vaudreuil-Dorion', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Vaudreuil-Dorion', lat: 45.4001, lng: -74.0365 },
            { name: 'Equinix VA1 - Burnaby', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Burnaby', lat: 49.2488, lng: -122.9805 },
            { name: 'Equinix CL1 - Calgary', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Calgary', lat: 51.0447, lng: -114.0719 },
            { name: 'Equinix CL2 - Calgary', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Calgary', lat: 51.0447, lng: -114.0719 },
            { name: 'Equinix CL3 - Calgary', provider: 'equinix', region: 'North America', country: 'Canada', city: 'Calgary', lat: 51.0447, lng: -114.0719 },
            
            // Mexico
            { name: 'Equinix MX1/MX2 - Mexico City', provider: 'equinix', region: 'North America', country: 'Mexico', city: 'Mexico City', lat: 19.4326, lng: -99.1332 },
            { name: 'Equinix MO1 - Monterrey', provider: 'equinix', region: 'North America', country: 'Mexico', city: 'Monterrey', lat: 25.6866, lng: -100.3161 },
            { name: 'Equinix MO2 - Monterrey', provider: 'equinix', region: 'North America', country: 'Mexico', city: 'Monterrey', lat: 25.6866, lng: -100.3161 },
            
            // EMEA
            { name: 'Equinix LD3 - London', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: 'Equinix LD4 - Slough', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Slough', lat: 51.5105, lng: -0.5950 },
            { name: 'Equinix LD5 - Slough', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Slough', lat: 51.5105, lng: -0.5950 },
            { name: 'Equinix LD6 - Slough', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Slough', lat: 51.5105, lng: -0.5950 },
            { name: 'Equinix LD7 - Slough', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Slough', lat: 51.5105, lng: -0.5950 },
            { name: 'Equinix LD8 - Docklands', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.0278 },
            { name: 'Equinix LD9 - Powergate', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: 'Equinix LD10 - Slough', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Slough', lat: 51.5105, lng: -0.5950 },
            { name: 'Equinix MA1 - Manchester', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            { name: 'Equinix MA3 - Manchester', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            { name: 'Equinix MA4 - Manchester', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            { name: 'Equinix MA5 - Manchester', provider: 'equinix', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            
            { name: 'Equinix FR2 - Frankfurt', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Equinix FR4 - Frankfurt', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Equinix FR5 - Frankfurt', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Equinix FR6 - Frankfurt', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Equinix FR7 - Frankfurt', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Equinix FR8 - Frankfurt', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: 'Equinix MU1/MU3 - Munich', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Munich', lat: 48.1351, lng: 11.5820 },
            { name: 'Equinix MU4 - Munich', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Munich', lat: 48.1351, lng: 11.5820 },
            { name: 'Equinix DU1 - Düsseldorf', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Düsseldorf', lat: 51.2277, lng: 6.7735 },
            { name: 'Equinix HH1 - Hamburg', provider: 'equinix', region: 'EMEA', country: 'Germany', city: 'Hamburg', lat: 53.5511, lng: 9.9937 },
            
            { name: 'Equinix AM1/AM2 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM3 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM4 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM5 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM6 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM7 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM8 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: 'Equinix AM11 - Amsterdam', provider: 'equinix', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            
            { name: 'Equinix PA1 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Equinix PA2 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Equinix PA3 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Equinix PA4 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Equinix PA5 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Equinix PA6 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Equinix PA7 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Equinix PA10 - Paris', provider: 'equinix', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            
            { name: 'Equinix DB1 - Dublin', provider: 'equinix', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            { name: 'Equinix DB2 - Dublin', provider: 'equinix', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            { name: 'Equinix DB3 - Dublin', provider: 'equinix', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            { name: 'Equinix DB4 - Dublin', provider: 'equinix', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            
            { name: 'Equinix MD1 - Madrid', provider: 'equinix', region: 'EMEA', country: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
            { name: 'Equinix MD2 - Madrid', provider: 'equinix', region: 'EMEA', country: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
            { name: 'Equinix MD6 - Madrid', provider: 'equinix', region: 'EMEA', country: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
            { name: 'Equinix BA1 - Barcelona', provider: 'equinix', region: 'EMEA', country: 'Spain', city: 'Barcelona', lat: 41.3851, lng: 2.1734 },
            { name: 'Equinix BA2 - Barcelona', provider: 'equinix', region: 'EMEA', country: 'Spain', city: 'Barcelona', lat: 41.3851, lng: 2.1734 },
            
            { name: 'Equinix ML2 - Milan', provider: 'equinix', region: 'EMEA', country: 'Italy', city: 'Milan', lat: 45.4642, lng: 9.1900 },
            { name: 'Equinix ML3 - Milan', provider: 'equinix', region: 'EMEA', country: 'Italy', city: 'Milan', lat: 45.4642, lng: 9.1900 },
            { name: 'Equinix ML4 - Milan', provider: 'equinix', region: 'EMEA', country: 'Italy', city: 'Milan', lat: 45.4642, lng: 9.1900 },
            { name: 'Equinix ML5 - Milan', provider: 'equinix', region: 'EMEA', country: 'Italy', city: 'Milan', lat: 45.4642, lng: 9.1900 },
            
            { name: 'Equinix SK1 - Stockholm', provider: 'equinix', region: 'EMEA', country: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
            { name: 'Equinix SK2 - Stockholm', provider: 'equinix', region: 'EMEA', country: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
            { name: 'Equinix SK3 - Stockholm', provider: 'equinix', region: 'EMEA', country: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
            
            { name: 'Equinix ZH2 - Zurich', provider: 'equinix', region: 'EMEA', country: 'Switzerland', city: 'Zurich', lat: 47.3769, lng: 8.5417 },
            { name: 'Equinix ZH4 - Zurich', provider: 'equinix', region: 'EMEA', country: 'Switzerland', city: 'Zurich', lat: 47.3769, lng: 8.5417 },
            { name: 'Equinix ZH5 - Zurich', provider: 'equinix', region: 'EMEA', country: 'Switzerland', city: 'Zurich', lat: 47.3769, lng: 8.5417 },
            { name: 'Equinix GV1 - Geneva', provider: 'equinix', region: 'EMEA', country: 'Switzerland', city: 'Geneva', lat: 46.2044, lng: 6.1432 },
            { name: 'Equinix GV2 - Geneva', provider: 'equinix', region: 'EMEA', country: 'Switzerland', city: 'Geneva', lat: 46.2044, lng: 6.1432 },
            
            { name: 'Equinix WA1 - Warsaw', provider: 'equinix', region: 'EMEA', country: 'Poland', city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
            { name: 'Equinix WA2 - Warsaw', provider: 'equinix', region: 'EMEA', country: 'Poland', city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
            { name: 'Equinix WA3 - Warsaw', provider: 'equinix', region: 'EMEA', country: 'Poland', city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
            
            { name: 'Equinix HE3 - Helsinki', provider: 'equinix', region: 'EMEA', country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
            { name: 'Equinix HE4 - Helsinki', provider: 'equinix', region: 'EMEA', country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
            { name: 'Equinix HE5 - Helsinki', provider: 'equinix', region: 'EMEA', country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
            { name: 'Equinix HE6 - Helsinki', provider: 'equinix', region: 'EMEA', country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
            { name: 'Equinix HE7 - Helsinki', provider: 'equinix', region: 'EMEA', country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
            
            { name: 'Equinix IL2 - Istanbul', provider: 'equinix', region: 'EMEA', country: 'Turkey', city: 'Istanbul', lat: 41.0082, lng: 28.9784 },
            { name: 'Equinix IL4 - Istanbul', provider: 'equinix', region: 'EMEA', country: 'Turkey', city: 'Istanbul', lat: 41.0082, lng: 28.9784 },
            
            { name: 'Equinix SO1 - Sofia', provider: 'equinix', region: 'EMEA', country: 'Bulgaria', city: 'Sofia', lat: 42.6977, lng: 23.3219 },
            { name: 'Equinix SO2 - Sofia', provider: 'equinix', region: 'EMEA', country: 'Bulgaria', city: 'Sofia', lat: 42.6977, lng: 23.3219 },
            
            { name: 'Equinix DX1 - Dubai', provider: 'equinix', region: 'EMEA', country: 'UAE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
            { name: 'Equinix DX2 - Dubai', provider: 'equinix', region: 'EMEA', country: 'UAE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
            { name: 'Equinix DX3 - Dubai', provider: 'equinix', region: 'EMEA', country: 'UAE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
            
            { name: 'Equinix MC1 - Muscat', provider: 'equinix', region: 'EMEA', country: 'Oman', city: 'Muscat', lat: 23.5859, lng: 58.4059 },
            
            // APJ
            { name: 'Equinix SY1/SY2 - Sydney', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Equinix SY3 - Sydney', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Equinix SY4 - Sydney', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Equinix SY5 - Sydney', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Equinix SY6 - Silverwater', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Equinix SY7 - Unanderra', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Equinix ME1/ME2 - Melbourne', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
            { name: 'Equinix ME4 - Derrimut', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
            { name: 'Equinix ME5 - Melbourne', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
            { name: 'Equinix BR1 - Brisbane', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Brisbane', lat: -27.4698, lng: 153.0251 },
            { name: 'Equinix PE1 - Perth', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Perth', lat: -31.9505, lng: 115.8605 },
            { name: 'Equinix PE2/PE3 - Perth', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Perth', lat: -31.9505, lng: 115.8605 },
            { name: 'Equinix AE1 - Adelaide', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Adelaide', lat: -34.9285, lng: 138.6007 },
            { name: 'Equinix CA1 - Canberra', provider: 'equinix', region: 'APJ', country: 'Australia', city: 'Canberra', lat: -35.2809, lng: 149.1300 },
            
            { name: 'Equinix SG1 - Singapore', provider: 'equinix', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Equinix SG2 - Singapore', provider: 'equinix', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Equinix SG3 - Singapore', provider: 'equinix', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Equinix SG4 - Singapore', provider: 'equinix', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: 'Equinix SG5 - Singapore', provider: 'equinix', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            
            { name: 'Equinix TY1 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY2 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY3 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY4 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY5 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY6 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY7 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY8 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY9 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY10 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY11 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix TY15 - Tokyo', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Equinix OS1 - Osaka', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Osaka', lat: 34.6937, lng: 135.5023 },
            { name: 'Equinix OS3 - Osaka', provider: 'equinix', region: 'APJ', country: 'Japan', city: 'Osaka', lat: 34.6937, lng: 135.5023 },
            
            { name: 'Equinix HK1 - Hong Kong', provider: 'equinix', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: 'Equinix HK2 - Hong Kong', provider: 'equinix', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: 'Equinix HK3 - Hong Kong', provider: 'equinix', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: 'Equinix HK4 - Hong Kong', provider: 'equinix', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: 'Equinix HK5 - Hong Kong', provider: 'equinix', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            
            { name: 'Equinix SL1 - Seoul', provider: 'equinix', region: 'APJ', country: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780 },
            { name: 'Equinix SL4 - Seoul', provider: 'equinix', region: 'APJ', country: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780 },
            
            { name: 'Equinix MB1 - Mumbai', provider: 'equinix', region: 'APJ', country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Equinix MB2 - Mumbai', provider: 'equinix', region: 'APJ', country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Equinix MB3 - Mumbai', provider: 'equinix', region: 'APJ', country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Equinix MB4 - Mumbai', provider: 'equinix', region: 'APJ', country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Equinix CN1 - Chennai', provider: 'equinix', region: 'APJ', country: 'India', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
            
            { name: 'Equinix SH1 - Shanghai', provider: 'equinix', region: 'APJ', country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
            { name: 'Equinix SH2 - Shanghai', provider: 'equinix', region: 'APJ', country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
            { name: 'Equinix SH3 - Shanghai', provider: 'equinix', region: 'APJ', country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
            { name: 'Equinix SH5 - Shanghai', provider: 'equinix', region: 'APJ', country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
            { name: 'Equinix SH6 - Shanghai', provider: 'equinix', region: 'APJ', country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
            
            { name: 'Equinix KL1 - Kuala Lumpur', provider: 'equinix', region: 'APJ', country: 'Malaysia', city: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
            { name: 'Equinix JH1 - Johor', provider: 'equinix', region: 'APJ', country: 'Malaysia', city: 'Johor', lat: 1.4927, lng: 103.7414 },
            { name: 'Equinix JK1 - Jakarta', provider: 'equinix', region: 'APJ', country: 'Indonesia', city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
            
            // South America
            { name: 'Equinix SP1 - São Paulo', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Equinix SP2 - São Paulo', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Equinix SP3 - São Paulo', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Equinix SP4 - São Paulo', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Equinix SP5x - São Paulo', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Equinix SP6 - São Paulo', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: 'Equinix RJ1 - Rio de Janeiro', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
            { name: 'Equinix RJ2 - Rio de Janeiro', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
            { name: 'Equinix RJ3 - Rio de Janeiro', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
            { name: 'Equinix ST1/ST2 - Santiago', provider: 'equinix', region: 'South America', country: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
            { name: 'Equinix ST3 - Santiago', provider: 'equinix', region: 'South America', country: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
            { name: 'Equinix ST4 - Santiago', provider: 'equinix', region: 'South America', country: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
            { name: 'Equinix BG1 - Bogota', provider: 'equinix', region: 'South America', country: 'Colombia', city: 'Bogota', lat: 4.7110, lng: -74.0721 },
            { name: 'Equinix BG2 - Bogota', provider: 'equinix', region: 'South America', country: 'Colombia', city: 'Bogota', lat: 4.7110, lng: -74.0721 },
            { name: 'Equinix LM1 - Lima', provider: 'equinix', region: 'South America', country: 'Peru', city: 'Lima', lat: -12.0464, lng: -77.0428 },
            
            // South Africa
            { name: 'Equinix JN1 - Johannesburg', provider: 'equinix', region: 'South Africa', country: 'South Africa', city: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
            { name: 'Equinix AC1 - Accra', provider: 'equinix', region: 'South Africa', country: 'Ghana', city: 'Accra', lat: 5.6037, lng: -0.1870 },
            { name: 'Equinix LG1/LG2 - Lagos', provider: 'equinix', region: 'South Africa', country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
            { name: 'Equinix AB1 - Abidjan', provider: 'equinix', region: 'South Africa', country: 'Ivory Coast', city: 'Abidjan', lat: 5.3600, lng: -4.0083 }
        ];
    }

    async fetchSystems1111Data() {
        // Comprehensive 11:11 Systems data
        return [
            // EMEA - Primary presence
            { name: '11:11 Systems London Docklands', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.0278 },
            { name: '11:11 Systems London City', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: '11:11 Systems London Slough', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Slough', lat: 51.5105, lng: -0.5950 },
            { name: '11:11 Systems Manchester', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            { name: '11:11 Systems Birmingham', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Birmingham', lat: 52.4862, lng: -1.8904 },
            { name: '11:11 Systems Leeds', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Leeds', lat: 53.8008, lng: -1.5491 },
            { name: '11:11 Systems Glasgow', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Glasgow', lat: 55.8642, lng: -4.2518 },
            { name: '11:11 Systems Edinburgh', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
            { name: '11:11 Systems Dublin', provider: '1111systems', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            { name: '11:11 Systems Cork', provider: '1111systems', region: 'EMEA', country: 'Ireland', city: 'Cork', lat: 51.8985, lng: -8.4756 },
            { name: '11:11 Systems Amsterdam', provider: '1111systems', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: '11:11 Systems Frankfurt', provider: '1111systems', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: '11:11 Systems Paris', provider: '1111systems', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: '11:11 Systems Madrid', provider: '1111systems', region: 'EMEA', country: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
            { name: '11:11 Systems Milan', provider: '1111systems', region: 'EMEA', country: 'Italy', city: 'Milan', lat: 45.4642, lng: 9.1900 },
            { name: '11:11 Systems Zurich', provider: '1111systems', region: 'EMEA', country: 'Switzerland', city: 'Zurich', lat: 47.3769, lng: 8.5417 },
            { name: '11:11 Systems Stockholm', provider: '1111systems', region: 'EMEA', country: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
            { name: '11:11 Systems Copenhagen', provider: '1111systems', region: 'EMEA', country: 'Denmark', city: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
            { name: '11:11 Systems Oslo', provider: '1111systems', region: 'EMEA', country: 'Norway', city: 'Oslo', lat: 59.9139, lng: 10.7522 },
            { name: '11:11 Systems Helsinki', provider: '1111systems', region: 'EMEA', country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
            { name: '11:11 Systems Warsaw', provider: '1111systems', region: 'EMEA', country: 'Poland', city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
            { name: '11:11 Systems Prague', provider: '1111systems', region: 'EMEA', country: 'Czech Republic', city: 'Prague', lat: 50.0755, lng: 14.4378 },
            { name: '11:11 Systems Vienna', provider: '1111systems', region: 'EMEA', country: 'Austria', city: 'Vienna', lat: 48.2082, lng: 16.3738 },
            
            // North America - Expanding presence
            { name: '11:11 Systems New York', provider: '1111systems', region: 'North America', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: '11:11 Systems Los Angeles', provider: '1111systems', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: '11:11 Systems Chicago', provider: '1111systems', region: 'North America', country: 'United States', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
            { name: '11:11 Systems Dallas', provider: '1111systems', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: '11:11 Systems Ashburn', provider: '1111systems', region: 'North America', country: 'United States', city: 'Ashburn', lat: 39.0437, lng: -77.4875 },
            { name: '11:11 Systems San Jose', provider: '1111systems', region: 'North America', country: 'United States', city: 'San Jose', lat: 37.3382, lng: -121.8863 },
            { name: '11:11 Systems Seattle', provider: '1111systems', region: 'North America', country: 'United States', city: 'Seattle', lat: 47.6062, lng: -122.3321 },
            { name: '11:11 Systems Miami', provider: '1111systems', region: 'North America', country: 'United States', city: 'Miami', lat: 25.7617, lng: -80.1918 },
            { name: '11:11 Systems Atlanta', provider: '1111systems', region: 'North America', country: 'United States', city: 'Atlanta', lat: 33.7490, lng: -84.3880 },
            { name: '11:11 Systems Toronto', provider: '1111systems', region: 'North America', country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
            { name: '11:11 Systems Montreal', provider: '1111systems', region: 'North America', country: 'Canada', city: 'Montreal', lat: 45.5017, lng: -73.5673 },
            { name: '11:11 Systems Vancouver', provider: '1111systems', region: 'North America', country: 'Canada', city: 'Vancouver', lat: 49.2827, lng: -123.1207 },
            
            // APJ - Growing presence
            { name: '11:11 Systems Singapore', provider: '1111systems', region: 'APJ', country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { name: '11:11 Systems Hong Kong', provider: '1111systems', region: 'APJ', country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
            { name: '11:11 Systems Tokyo', provider: '1111systems', region: 'APJ', country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: '11:11 Systems Sydney', provider: '1111systems', region: 'APJ', country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: '11:11 Systems Melbourne', provider: '1111systems', region: 'APJ', country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
            { name: '11:11 Systems Mumbai', provider: '1111systems', region: 'APJ', country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: '11:11 Systems Seoul', provider: '1111systems', region: 'APJ', country: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780 },
            { name: '11:11 Systems Kuala Lumpur', provider: '1111systems', region: 'APJ', country: 'Malaysia', city: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
            { name: '11:11 Systems Jakarta', provider: '1111systems', region: 'APJ', country: 'Indonesia', city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
            { name: '11:11 Systems Bangkok', provider: '1111systems', region: 'APJ', country: 'Thailand', city: 'Bangkok', lat: 13.7563, lng: 100.5018 },
            
            // South America - Emerging markets
            { name: '11:11 Systems São Paulo', provider: '1111systems', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
            { name: '11:11 Systems Rio de Janeiro', provider: '1111systems', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
            { name: '11:11 Systems Santiago', provider: '1111systems', region: 'South America', country: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
            { name: '11:11 Systems Buenos Aires', provider: '1111systems', region: 'South America', country: 'Argentina', city: 'Buenos Aires', lat: -34.6118, lng: -58.3960 },
            { name: '11:11 Systems Lima', provider: '1111systems', region: 'South America', country: 'Peru', city: 'Lima', lat: -12.0464, lng: -77.0428 },
            { name: '11:11 Systems Bogota', provider: '1111systems', region: 'South America', country: 'Colombia', city: 'Bogota', lat: 4.7110, lng: -74.0721 },
            
            // South Africa - African expansion
            { name: '11:11 Systems Johannesburg', provider: '1111systems', region: 'South Africa', country: 'South Africa', city: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
            { name: '11:11 Systems Cape Town', provider: '1111systems', region: 'South Africa', country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
            { name: '11:11 Systems Lagos', provider: '1111systems', region: 'South Africa', country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
            { name: '11:11 Systems Nairobi', provider: '1111systems', region: 'South Africa', country: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 },
            { name: '11:11 Systems Cairo', provider: '1111systems', region: 'South Africa', country: 'Egypt', city: 'Cairo', lat: 30.0444, lng: 31.2357 }
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
            container.innerHTML = '<tr><td colspan="4" class="loading">No locations found for the selected filters.</td></tr>';
            return;
        }

        const html = this.filteredLocations.map(location => {
            const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
            const countryName = this.getCountryName(location.country);
            
            return `
                <tr>
                    <td class="location-name-cell" onclick="colocationLocator.focusLocation(${location.lat}, ${location.lng})">
                        ${location.name}
                        <span class="provider-badge ${location.provider}">${this.getProviderDisplayName(location.provider)}</span>
                    </td>
                    <td>
                        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="map-link">View Map</a>
                    </td>
                    <td class="country-cell">${countryName}</td>
                    <td class="continent-cell">${location.region}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = html;
    }

    getCountryName(code) {
        const countryMap = {
            'US': 'United States',
            'CA': 'Canada',
            'MX': 'Mexico',
            'BR': 'Brazil',
            'AR': 'Argentina',
            'CL': 'Chile',
            'CO': 'Colombia',
            'PE': 'Peru',
            'GB': 'United Kingdom',
            'DE': 'Germany',
            'FR': 'France',
            'NL': 'Netherlands',
            'IT': 'Italy',
            'ES': 'Spain',
            'CH': 'Switzerland',
            'AT': 'Austria',
            'BE': 'Belgium',
            'SE': 'Sweden',
            'NO': 'Norway',
            'DK': 'Denmark',
            'FI': 'Finland',
            'IE': 'Ireland',
            'PL': 'Poland',
            'CZ': 'Czech Republic',
            'HU': 'Hungary',
            'RO': 'Romania',
            'BG': 'Bulgaria',
            'GR': 'Greece',
            'PT': 'Portugal',
            'TR': 'Turkey',
            'AE': 'UAE',
            'SA': 'Saudi Arabia',
            'ZA': 'South Africa',
            'AU': 'Australia',
            'NZ': 'New Zealand',
            'JP': 'Japan',
            'KR': 'South Korea',
            'CN': 'China',
            'HK': 'Hong Kong',
            'SG': 'Singapore',
            'MY': 'Malaysia',
            'TH': 'Thailand',
            'ID': 'Indonesia',
            'IN': 'India',
            'PH': 'Philippines',
            'VN': 'Vietnam',
            'OM': 'Oman',
            'EG': 'Egypt',
            'KE': 'Kenya',
            'NG': 'Nigeria',
            'GH': 'Ghana',
            'CI': 'Ivory Coast'
        };
        return countryMap[code] || code;
    }

    updateStats() {
        document.getElementById('total-locations').textContent = this.allLocations.length;
        document.getElementById('filtered-locations').textContent = this.filteredLocations.length;
    }

    focusLocation(lat, lng) {
        this.map.setView([lat, lng], 10);
    }

    findNearestLocations(clickedLatLng) {
        // First, check if the clicked location is on land or water
        this.checkIfLand(clickedLatLng).then(isLand => {
            if (!isLand) {
                // Show water location marker with warning
                this.showWaterLocationWarning(clickedLatLng);
                return;
            }
            
            // Proceed with finding nearest locations if on land
            this.processNearestLocations(clickedLatLng);
        });
    }

    async checkIfLand(latlng) {
        try {
            // Use Nominatim reverse geocoding to check if location is on land
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=10`
            );
            const data = await response.json();
            
            // If no address is returned or it's a body of water, it's not land
            if (!data.address || data.error || 
                data.type === 'sea' || data.type === 'ocean' || 
                data.class === 'natural' && (data.type === 'water' || data.type === 'bay')) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking location:', error);
            // If there's an error, assume it's land to not block functionality
            return true;
        }
    }

    showWaterLocationWarning(clickedLatLng) {
        // Remove previous markers and lines
        if (this.clickMarker) {
            this.map.removeLayer(this.clickMarker);
        }
        this.nearestMarkers.forEach(marker => this.map.removeLayer(marker));
        this.nearestMarkers = [];
        this.nearestLines.forEach(line => this.map.removeLayer(line));
        this.nearestLines = [];

        // Add warning marker at clicked location
        this.clickMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
            icon: L.divIcon({
                className: 'water-marker',
                html: '<div style="background: #ff4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).bindPopup(`
            <div style="text-align: center; padding: 10px; min-width: 200px;">
                <div style="font-size: 2rem; margin-bottom: 8px;">🌊</div>
                <h4 style="margin: 0 0 8px 0; color: #e53e3e; font-weight: 700;">Invalid Location</h4>
                <p style="margin: 4px 0; color: #4a5568; font-size: 0.9rem;">
                    You clicked on a water body (ocean, sea, or lake).
                </p>
                <p style="margin: 8px 0 0 0; color: #718096; font-size: 0.85rem; font-weight: 600;">
                    Please click on a land location to find nearby colocation facilities.
                </p>
            </div>
        `).addTo(this.map);
        
        this.clickMarker.openPopup();
        
        // Hide nearest locations section
        const container = document.getElementById('nearest-locations-list');
        if (container) {
            container.style.display = 'none';
        }
    }

    processNearestLocations(clickedLatLng) {
        // Calculate distance between two points using Haversine formula
        const calculateDistance = (lat1, lng1, lat2, lng2) => {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // Calculate distances for all locations
        const locationsWithDistance = this.allLocations.map(location => ({
            ...location,
            distance: calculateDistance(
                clickedLatLng.lat,
                clickedLatLng.lng,
                location.lat,
                location.lng
            )
        }));

        // Sort by distance from clicked point
        const sortedLocations = locationsWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Find two locations that are at least 60 miles (97 km) apart from each other
        const minDistanceBetweenLocations = 97; // 60 miles in km
        const nearest = [];
        
        // Get the first location (closest to click)
        if (sortedLocations.length > 0) {
            nearest.push(sortedLocations[0]);
        }
        
        // Find second location that is at least 97 km away from the first location
        if (sortedLocations.length > 1) {
            for (let i = 1; i < sortedLocations.length; i++) {
                const distanceBetween = calculateDistance(
                    nearest[0].lat,
                    nearest[0].lng,
                    sortedLocations[i].lat,
                    sortedLocations[i].lng
                );
                
                if (distanceBetween >= minDistanceBetweenLocations) {
                    nearest.push(sortedLocations[i]);
                    break;
                }
            }
            
            // If no location found that's far enough, show a message
            if (nearest.length < 2) {
                alert('Could not find a second location that is at least 60 miles away from the nearest location. Showing only the closest location.');
            }
        }

        // Remove previous click marker, nearest markers, and lines
        if (this.clickMarker) {
            this.map.removeLayer(this.clickMarker);
        }
        this.nearestMarkers.forEach(marker => this.map.removeLayer(marker));
        this.nearestMarkers = [];
        this.nearestLines.forEach(line => this.map.removeLayer(line));
        this.nearestLines = [];

        // Add click marker
        this.clickMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
            icon: L.divIcon({
                className: 'click-marker',
                html: '<div style="background: #ff4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        }).addTo(this.map);

        // Add markers and lines for the two nearest locations
        nearest.forEach((location, index) => {
            const color = index === 0 ? '#00cc66' : '#0099ff';
            
            // Draw line from clicked point to location
            const line = L.polyline([
                [clickedLatLng.lat, clickedLatLng.lng],
                [location.lat, location.lng]
            ], {
                color: color,
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(this.map);
            this.nearestLines.push(line);

            // Add marker
            const marker = L.marker([location.lat, location.lng], {
                icon: L.divIcon({
                    className: 'nearest-marker',
                    html: `<div style="background: ${color}; color: white; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${index + 1}</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                })
            }).bindPopup(`
                <div class="nearest-popup">
                    <h4 style="margin: 0 0 8px 0; color: ${color};">
                        #${index + 1} Closest (${location.distance.toFixed(2)} km)
                    </h4>
                    <p style="margin: 4px 0; font-weight: 600;">${location.name}</p>
                    <p style="margin: 4px 0; color: #666;">${location.city}, ${this.getCountryName(location.country)}</p>
                    <p style="margin: 4px 0; color: #666;">${location.region}</p>
                    <span class="provider-badge ${location.provider}" style="display: inline-block; margin-top: 4px;">
                        ${this.getProviderDisplayName(location.provider)}
                    </span>
                </div>
            `).addTo(this.map);

            this.nearestMarkers.push(marker);
            
            // Open popup for the first location
            if (index === 0) {
                marker.openPopup();
            }
        });

        // Display nearest locations in the list section
        this.displayNearestLocationsList(nearest);

        // Fit map to show clicked point and nearest locations
        if (nearest.length === 2) {
            const bounds = L.latLngBounds([
                [clickedLatLng.lat, clickedLatLng.lng],
                [nearest[0].lat, nearest[0].lng],
                [nearest[1].lat, nearest[1].lng]
            ]);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        } else if (nearest.length === 1) {
            // Only one location found, zoom to show clicked point and that location
            const bounds = L.latLngBounds([
                [clickedLatLng.lat, clickedLatLng.lng],
                [nearest[0].lat, nearest[0].lng]
            ]);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    displayNearestLocationsList(nearest) {
        const container = document.getElementById('nearest-locations-list');
        if (!container) return;

        if (nearest.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        const listHtml = nearest.map((location, index) => {
            const color = index === 0 ? '#00cc66' : '#0099ff';
            return `
                <div class="nearest-location-card" style="border-left: 4px solid ${color};">
                    <div class="nearest-location-header">
                        <span class="nearest-location-number" style="background: ${color};">${index + 1}</span>
                        <span class="nearest-location-distance">${location.distance.toFixed(2)} km away</span>
                    </div>
                    <div class="nearest-location-name">${location.name}</div>
                    <div class="nearest-location-details">
                        <span class="provider-badge ${location.provider}">${this.getProviderDisplayName(location.provider)}</span>
                        <span class="nearest-location-location">📍 ${location.city}, ${this.getCountryName(location.country)}</span>
                        <span class="nearest-location-region">🌍 ${location.region}</span>
                    </div>
                    <button class="view-on-map-btn" onclick="colocationLocator.focusLocation(${location.lat}, ${location.lng})" style="background: ${color};">
                        View on Map
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h3>🎯 Nearest Locations to Your Click</h3>
            <div class="nearest-locations-grid">
                ${listHtml}
            </div>
        `;
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

    cacheData(locations, timestamp) {
        const data = {
            locations,
            timestamp: timestamp || Date.now()
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
    }

    updateLastUpdated(timestamp) {
        const date = new Date(timestamp || Date.now());
        document.getElementById('last-update').textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
}

// Initialize the application
const colocationLocator = new ColocationLocator();