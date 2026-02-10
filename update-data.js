const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

class DataUpdater {
    constructor() {
        this.dataDir = './data';
        this.ensureDataDir();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    async fetchMegaportData() {
        try {
            console.log('Fetching Megaport data from PeeringDB...');
            const response = await axios.get('https://www.peeringdb.com/api/net/27330');
            const netData = response.data.data[0];
            
            const locations = [];
            
            if (netData && netData.netfac_set) {
                for (const facility of netData.netfac_set) {
                    try {
                        const facResponse = await axios.get(`https://www.peeringdb.com/api/fac/${facility.fac_id}`);
                        const facData = facResponse.data.data[0];
                        
                        if (facData) {
                            locations.push({
                                name: `Megaport ${facData.name}`,
                                provider: 'megaport',
                                region: this.getRegionFromCountry(facData.country),
                                country: facData.country,
                                city: facData.city,
                                lat: parseFloat(facData.latitude) || 0,
                                lng: parseFloat(facData.longitude) || 0,
                                address: facData.address1 || ''
                            });
                        }
                        
                        // Add delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.warn(`Error fetching facility ${facility.fac_id}:`, error.message);
                    }
                }
            }
            
            console.log(`Found ${locations.length} Megaport locations`);
            return locations;
        } catch (error) {
            console.error('Error fetching Megaport data:', error.message);
            return this.getFallbackMegaportData();
        }
    }

    async fetchEquinixData() {
        try {
            console.log('Fetching Equinix data from PeeringDB...');
            const response = await axios.get('https://www.peeringdb.com/api/fac?org_id=2');
            const facilities = response.data.data;
            
            const locations = facilities.map(fac => ({
                name: `Equinix ${fac.name}`,
                provider: 'equinix',
                region: this.getRegionFromCountry(fac.country),
                country: fac.country,
                city: fac.city,
                lat: parseFloat(fac.latitude) || 0,
                lng: parseFloat(fac.longitude) || 0,
                address: fac.address1 || ''
            }));
            
            console.log(`Found ${locations.length} Equinix locations`);
            return locations;
        } catch (error) {
            console.error('Error fetching Equinix data:', error.message);
            return this.getFallbackEquinixData();
        }
    }

    async fetch1111SystemsData() {
        try {
            console.log('Fetching 11:11 Systems data...');
            // Since direct scraping might be blocked, use fallback data
            // In a production environment, you might use a proxy service or API
            return this.getFallback1111SystemsData();
        } catch (error) {
            console.error('Error fetching 11:11 Systems data:', error.message);
            return this.getFallback1111SystemsData();
        }
    }

    getRegionFromCountry(country) {
        const regionMap = {
            'US': 'North America', 'CA': 'North America', 'MX': 'North America',
            'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'CO': 'South America', 'PE': 'South America',
            'GB': 'EMEA', 'DE': 'EMEA', 'FR': 'EMEA', 'NL': 'EMEA', 'IT': 'EMEA', 'ES': 'EMEA', 'CH': 'EMEA',
            'AT': 'EMEA', 'BE': 'EMEA', 'SE': 'EMEA', 'NO': 'EMEA', 'DK': 'EMEA', 'FI': 'EMEA', 'IE': 'EMEA',
            'PL': 'EMEA', 'CZ': 'EMEA', 'HU': 'EMEA', 'RO': 'EMEA', 'BG': 'EMEA', 'GR': 'EMEA', 'PT': 'EMEA',
            'RU': 'EMEA', 'TR': 'EMEA', 'IL': 'EMEA', 'AE': 'EMEA', 'SA': 'EMEA', 'EG': 'EMEA',
            'ZA': 'South Africa',
            'AU': 'APJ', 'NZ': 'APJ', 'JP': 'APJ', 'KR': 'APJ', 'CN': 'APJ', 'HK': 'APJ', 'SG': 'APJ',
            'MY': 'APJ', 'TH': 'APJ', 'ID': 'APJ', 'PH': 'APJ', 'VN': 'APJ', 'IN': 'APJ', 'TW': 'APJ'
        };
        return regionMap[country] || 'Other';
    }

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
            { name: 'Megaport Dallas', provider: 'megaport', region: 'North America', country: 'United States', city: 'Dallas', lat: 32.7767, lng: -96.7970 }
        ];
    }

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
            { name: 'Equinix RJ1', provider: 'equinix', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 }
        ];
    }

    getFallback1111SystemsData() {
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

    async updateAllData() {
        console.log('Starting data update process...');
        
        const [megaportData, equinixData, systems1111Data] = await Promise.all([
            this.fetchMegaportData(),
            this.fetchEquinixData(),
            this.fetch1111SystemsData()
        ]);

        const allData = {
            megaport: megaportData,
            equinix: equinixData,
            '1111systems': systems1111Data,
            lastUpdated: new Date().toISOString(),
            totalLocations: megaportData.length + equinixData.length + systems1111Data.length
        };

        // Ensure docs/data directory exists
        const docsDataDir = './docs/data';
        if (!fs.existsSync(docsDataDir)) {
            fs.mkdirSync(docsDataDir, { recursive: true });
        }

        // Save individual provider data to both data/ and docs/data/
        fs.writeFileSync(`${this.dataDir}/megaport.json`, JSON.stringify(megaportData, null, 2));
        fs.writeFileSync(`${docsDataDir}/megaport.json`, JSON.stringify(megaportData, null, 2));
        
        fs.writeFileSync(`${this.dataDir}/equinix.json`, JSON.stringify(equinixData, null, 2));
        fs.writeFileSync(`${docsDataDir}/equinix.json`, JSON.stringify(equinixData, null, 2));
        
        fs.writeFileSync(`${this.dataDir}/1111systems.json`, JSON.stringify(systems1111Data, null, 2));
        fs.writeFileSync(`${docsDataDir}/1111systems.json`, JSON.stringify(systems1111Data, null, 2));

        // Save combined data to both directories
        fs.writeFileSync(`${this.dataDir}/all-locations.json`, JSON.stringify(allData, null, 2));
        fs.writeFileSync(`${docsDataDir}/all-locations.json`, JSON.stringify(allData, null, 2));

        console.log(`Data update completed. Total locations: ${allData.totalLocations}`);
        console.log(`- Megaport: ${megaportData.length}`);
        console.log(`- Equinix: ${equinixData.length}`);
        console.log(`- 11:11 Systems: ${systems1111Data.length}`);
    }
}

// Run the update
const updater = new DataUpdater();
updater.updateAllData().catch(console.error);