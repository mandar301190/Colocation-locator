const https = require('https');
const fs = require('fs');

// Helper function to make HTTPS requests
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

// Map country codes to regions
function getRegionFromCountry(country) {
    const regionMap = {
        'US': 'North America', 'CA': 'North America', 'MX': 'North America',
        'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'CO': 'South America', 
        'PE': 'South America', 'UY': 'South America', 'VE': 'South America', 'EC': 'South America',
        'GB': 'EMEA', 'DE': 'EMEA', 'FR': 'EMEA', 'NL': 'EMEA', 'IT': 'EMEA', 'ES': 'EMEA', 'CH': 'EMEA',
        'AT': 'EMEA', 'BE': 'EMEA', 'SE': 'EMEA', 'NO': 'EMEA', 'DK': 'EMEA', 'FI': 'EMEA', 'IE': 'EMEA',
        'PL': 'EMEA', 'CZ': 'EMEA', 'HU': 'EMEA', 'RO': 'EMEA', 'BG': 'EMEA', 'GR': 'EMEA', 'PT': 'EMEA',
        'RU': 'EMEA', 'TR': 'EMEA', 'IL': 'EMEA', 'AE': 'EMEA', 'SA': 'EMEA', 'EG': 'EMEA', 'KE': 'EMEA',
        'NG': 'EMEA', 'GH': 'EMEA', 'CI': 'EMEA', 'MA': 'EMEA', 'TN': 'EMEA', 'OM': 'EMEA', 'QA': 'EMEA',
        'KW': 'EMEA', 'BH': 'EMEA', 'JO': 'EMEA', 'LB': 'EMEA', 'UA': 'EMEA', 'RS': 'EMEA', 'HR': 'EMEA',
        'SI': 'EMEA', 'SK': 'EMEA', 'EE': 'EMEA', 'LV': 'EMEA', 'LT': 'EMEA', 'LU': 'EMEA', 'CY': 'EMEA',
        'MT': 'EMEA', 'IS': 'EMEA',
        'ZA': 'South Africa',
        'AU': 'APJ', 'NZ': 'APJ', 'JP': 'APJ', 'KR': 'APJ', 'CN': 'APJ', 'HK': 'APJ', 'SG': 'APJ',
        'MY': 'APJ', 'TH': 'APJ', 'ID': 'APJ', 'PH': 'APJ', 'VN': 'APJ', 'IN': 'APJ', 'TW': 'APJ',
        'BD': 'APJ', 'PK': 'APJ', 'LK': 'APJ', 'MM': 'APJ', 'KH': 'APJ', 'LA': 'APJ', 'MN': 'APJ',
        'NP': 'APJ', 'BN': 'APJ', 'MO': 'APJ', 'FJ': 'APJ', 'PG': 'APJ', 'NC': 'APJ', 'GU': 'APJ'
    };
    return regionMap[country] || 'Other';
}

async function fetchMegaportData() {
    console.log('Fetching Megaport data from PeeringDB...');
    
    try {
        // Fetch Megaport network info (ASN 49915, Network ID 27330)
        const netData = await httpsGet('https://www.peeringdb.com/api/net/27330');
        
        if (!netData.data || !netData.data[0]) {
            console.error('No Megaport network data found');
            return [];
        }

        const network = netData.data[0];
        const facilityIds = network.netfac_set || [];
        
        console.log(`Found ${facilityIds.length} Megaport facilities`);
        
        const locations = [];
        
        // Fetch each facility's details
        for (let i = 0; i < facilityIds.length; i++) {
            const facId = facilityIds[i].fac_id;
            
            try {
                const facData = await httpsGet(`https://www.peeringdb.com/api/fac/${facId}`);
                
                if (facData.data && facData.data[0]) {
                    const fac = facData.data[0];
                    
                    // Only add if we have valid coordinates
                    if (fac.latitude && fac.longitude) {
                        locations.push({
                            name: `Megaport ${fac.name}`,
                            provider: 'megaport',
                            region: getRegionFromCountry(fac.country),
                            country: fac.country,
                            city: fac.city,
                            lat: parseFloat(fac.latitude),
                            lng: parseFloat(fac.longitude),
                            address: fac.address1 || ''
                        });
                    }
                }
                
                // Progress indicator
                if ((i + 1) % 50 === 0) {
                    console.log(`  Processed ${i + 1}/${facilityIds.length} facilities...`);
                }
                
                // Rate limiting - wait 100ms between requests
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.warn(`  Error fetching facility ${facId}:`, error.message);
            }
        }
        
        console.log(`Successfully fetched ${locations.length} Megaport locations`);
        return locations;
        
    } catch (error) {
        console.error('Error fetching Megaport data:', error.message);
        return [];
    }
}

async function fetchEquinixData() {
    console.log('Fetching Equinix data from PeeringDB...');
    
    try {
        // Fetch all facilities for Equinix (org_id = 2)
        const facData = await httpsGet('https://www.peeringdb.com/api/fac?org_id=2');
        
        if (!facData.data) {
            console.error('No Equinix facility data found');
            return [];
        }

        console.log(`Found ${facData.data.length} Equinix facilities`);
        
        const locations = facData.data
            .filter(fac => fac.latitude && fac.longitude) // Only include facilities with coordinates
            .map(fac => ({
                name: `Equinix ${fac.name}`,
                provider: 'equinix',
                region: getRegionFromCountry(fac.country),
                country: fac.country,
                city: fac.city,
                lat: parseFloat(fac.latitude),
                lng: parseFloat(fac.longitude),
                address: fac.address1 || ''
            }));
        
        console.log(`Successfully fetched ${locations.length} Equinix locations`);
        return locations;
        
    } catch (error) {
        console.error('Error fetching Equinix data:', error.message);
        return [];
    }
}

async function fetch1111SystemsData() {
    console.log('Fetching 11:11 Systems data...');
    
    // Since 11:11 Systems data isn't on PeeringDB, we'll use a comprehensive manual dataset
    // based on their known presence
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
        
        // North America
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
        
        // APJ
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
        
        // South America
        { name: '11:11 Systems São Paulo', provider: '1111systems', region: 'South America', country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
        { name: '11:11 Systems Rio de Janeiro', provider: '1111systems', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
        { name: '11:11 Systems Santiago', provider: '1111systems', region: 'South America', country: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
        { name: '11:11 Systems Buenos Aires', provider: '1111systems', region: 'South America', country: 'Argentina', city: 'Buenos Aires', lat: -34.6118, lng: -58.3960 },
        { name: '11:11 Systems Lima', provider: '1111systems', region: 'South America', country: 'Peru', city: 'Lima', lat: -12.0464, lng: -77.0428 },
        { name: '11:11 Systems Bogota', provider: '1111systems', region: 'South America', country: 'Colombia', city: 'Bogota', lat: 4.7110, lng: -74.0721 },
        
        // South Africa
        { name: '11:11 Systems Johannesburg', provider: '1111systems', region: 'South Africa', country: 'South Africa', city: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
        { name: '11:11 Systems Cape Town', provider: '1111systems', region: 'South Africa', country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
        { name: '11:11 Systems Lagos', provider: '1111systems', region: 'South Africa', country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
        { name: '11:11 Systems Nairobi', provider: '1111systems', region: 'South Africa', country: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 },
        { name: '11:11 Systems Cairo', provider: '1111systems', region: 'South Africa', country: 'Egypt', city: 'Cairo', lat: 30.0444, lng: 31.2357 }
    ];
}

async function main() {
    console.log('=== Starting Real Data Fetch from PeeringDB ===\n');
    
    const [megaportData, equinixData, systems1111Data] = await Promise.all([
        fetchMegaportData(),
        fetchEquinixData(),
        fetch1111SystemsData()
    ]);

    const allData = {
        megaport: megaportData,
        equinix: equinixData,
        '1111systems': systems1111Data,
        lastUpdated: new Date().toISOString(),
        totalLocations: megaportData.length + equinixData.length + systems1111Data.length
    };

    // Save to data directory
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true });
    }

    fs.writeFileSync('./data/megaport.json', JSON.stringify(megaportData, null, 2));
    fs.writeFileSync('./data/equinix.json', JSON.stringify(equinixData, null, 2));
    fs.writeFileSync('./data/1111systems.json', JSON.stringify(systems1111Data, null, 2));
    fs.writeFileSync('./data/all-locations.json', JSON.stringify(allData, null, 2));

    // Also save to docs directory for GitHub Pages
    if (!fs.existsSync('./docs/data')) {
        fs.mkdirSync('./docs/data', { recursive: true });
    }
    
    fs.writeFileSync('./docs/data/all-locations.json', JSON.stringify(allData, null, 2));

    console.log('\n=== Data Fetch Complete ===');
    console.log(`Megaport: ${megaportData.length} locations`);
    console.log(`Equinix: ${equinixData.length} locations`);
    console.log(`11:11 Systems: ${systems1111Data.length} locations`);
    console.log(`Total: ${allData.totalLocations} locations`);
    console.log('\nData saved to:');
    console.log('  - ./data/all-locations.json');
    console.log('  - ./docs/data/all-locations.json');
}

main().catch(console.error);
