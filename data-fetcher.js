// Data Fetcher Service for Colocation Locator
// This service handles automated data fetching from various sources

class DataFetcher {
    constructor() {
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
        this.cache = new Map();
    }

    // Fetch Megaport data from PeeringDB
    async fetchMegaportFromPeeringDB() {
        try {
            const url = 'https://www.peeringdb.com/api/net/27330';
            const response = await fetch(this.corsProxy + encodeURIComponent(url));
            const data = await response.json();
            
            // Extract facility information
            const facilities = data.data[0]?.netfac_set || [];
            const locations = [];

            for (const facility of facilities) {
                const facilityResponse = await fetch(this.corsProxy + encodeURIComponent(`https://www.peeringdb.com/api/fac/${facility.fac_id}`));
                const facilityData = await facilityResponse.json();
                
                if (facilityData.data && facilityData.data[0]) {
                    const fac = facilityData.data[0];
                    locations.push({
                        name: `Megaport ${fac.name}`,
                        provider: 'megaport',
                        region: this.getRegionFromCountry(fac.country),
                        country: fac.country,
                        city: fac.city,
                        lat: parseFloat(fac.latitude) || 0,
                        lng: parseFloat(fac.longitude) || 0,
                        address: fac.address1
                    });
                }
            }

            return locations;
        } catch (error) {
            console.error('Error fetching Megaport data:', error);
            return this.getFallbackMegaportData();
        }
    }

    // Fetch Equinix data from PeeringDB
    async fetchEquinixFromPeeringDB() {
        try {
            const url = 'https://www.peeringdb.com/api/org/2';
            const response = await fetch(this.corsProxy + encodeURIComponent(url));
            const data = await response.json();
            
            // Get facilities associated with Equinix
            const facilitiesResponse = await fetch(this.corsProxy + encodeURIComponent('https://www.peeringdb.com/api/fac?org_id=2'));
            const facilitiesData = await facilitiesResponse.json();
            
            const locations = facilitiesData.data.map(fac => ({
                name: `Equinix ${fac.name}`,
                provider: 'equinix',
                region: this.getRegionFromCountry(fac.country),
                country: fac.country,
                city: fac.city,
                lat: parseFloat(fac.latitude) || 0,
                lng: parseFloat(fac.longitude) || 0,
                address: fac.address1
            }));

            return locations;
        } catch (error) {
            console.error('Error fetching Equinix data:', error);
            return this.getFallbackEquinixData();
        }
    }

    // Fetch 11:11 Systems data from datacenters.com
    async fetch1111SystemsData() {
        try {
            // Since we can't directly scrape datacenters.com due to CORS,
            // we'll use a fallback dataset that would be updated via a backend service
            return this.getFallback1111SystemsData();
        } catch (error) {
            console.error('Error fetching 11:11 Systems data:', error);
            return this.getFallback1111SystemsData();
        }
    }

    // Helper function to determine region from country
    getRegionFromCountry(country) {
        const regionMap = {
            'US': 'North America',
            'CA': 'North America',
            'MX': 'North America',
            'BR': 'South America',
            'AR': 'South America',
            'CL': 'South America',
            'CO': 'South America',
            'PE': 'South America',
            'GB': 'EMEA',
            'DE': 'EMEA',
            'FR': 'EMEA',
            'NL': 'EMEA',
            'IT': 'EMEA',
            'ES': 'EMEA',
            'CH': 'EMEA',
            'AT': 'EMEA',
            'BE': 'EMEA',
            'SE': 'EMEA',
            'NO': 'EMEA',
            'DK': 'EMEA',
            'FI': 'EMEA',
            'IE': 'EMEA',
            'PL': 'EMEA',
            'CZ': 'EMEA',
            'HU': 'EMEA',
            'RO': 'EMEA',
            'BG': 'EMEA',
            'GR': 'EMEA',
            'PT': 'EMEA',
            'RU': 'EMEA',
            'TR': 'EMEA',
            'IL': 'EMEA',
            'AE': 'EMEA',
            'SA': 'EMEA',
            'EG': 'EMEA',
            'ZA': 'South Africa',
            'AU': 'APJ',
            'NZ': 'APJ',
            'JP': 'APJ',
            'KR': 'APJ',
            'CN': 'APJ',
            'HK': 'APJ',
            'SG': 'APJ',
            'MY': 'APJ',
            'TH': 'APJ',
            'ID': 'APJ',
            'PH': 'APJ',
            'VN': 'APJ',
            'IN': 'APJ',
            'TW': 'APJ'
        };

        return regionMap[country] || 'Other';
    }

    // Fallback data for Megaport (used when API is unavailable)
    getFallbackMegaportData() {
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
            { name: 'Megaport Dallas', provider: 'megaport', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 },
            { name: 'Megaport Seattle', provider: 'megaport', region: 'North America', country: 'United States', city: 'Seattle', lat: 47.6062, lng: -122.3321 },
            { name: 'Megaport Toronto', provider: 'megaport', region: 'North America', country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 }
        ];
    }

    // Fallback data for Equinix
    getFallbackEquinixData() {
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
            { name: 'Equinix RJ1', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
            { name: 'Equinix SV1', provider: 'equinix', region: 'North America', country: 'United States', city: 'Silicon Valley', lat: 37.4419, lng: -122.1430 },
            { name: 'Equinix DC2', provider: 'equinix', region: 'North America', country: 'United States', city: 'Washington DC', lat: 38.9072, lng: -77.0369 }
        ];
    }

    // Fallback data for 11:11 Systems
    getFallback1111SystemsData() {
        return [
            { name: '11:11 Systems London', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
            { name: '11:11 Systems Manchester', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
            { name: '11:11 Systems Birmingham', provider: '1111systems', region: 'EMEA', country: 'United Kingdom', city: 'Birmingham', lat: 52.4862, lng: -1.8904 },
            { name: '11:11 Systems Dublin', provider: '1111systems', region: 'EMEA', country: 'Ireland', city: 'Dublin', lat: 53.3498, lng: -6.2603 },
            { name: '11:11 Systems Amsterdam', provider: '1111systems', region: 'EMEA', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { name: '11:11 Systems New York', provider: '1111systems', region: 'North America', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: '11:11 Systems Los Angeles', provider: '1111systems', region: 'North America', country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: '11:11 Systems Frankfurt', provider: '1111systems', region: 'EMEA', country: 'Germany', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
            { name: '11:11 Systems Paris', provider: '1111systems', region: 'EMEA', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 }
        ];
    }

    // Main method to fetch all data
    async fetchAllData() {
        const [megaportData, equinixData, systems1111Data] = await Promise.all([
            this.fetchMegaportFromPeeringDB(),
            this.fetchEquinixFromPeeringDB(),
            this.fetch1111SystemsData()
        ]);

        return [...megaportData, ...equinixData, ...systems1111Data];
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataFetcher;
} else {
    window.DataFetcher = DataFetcher;
}