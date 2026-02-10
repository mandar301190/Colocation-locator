#!/usr/bin/env python3
import json
import urllib.request
import time

def get_region_from_country(country):
    region_map = {
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
    }
    return region_map.get(country, 'Other')

def fetch_json(url):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())

print('Fetching Megaport data from PeeringDB...')

# Fetch Megaport network info
net_data = fetch_json('https://www.peeringdb.com/api/net/27330')

if not net_data.get('data') or not net_data['data']:
    print('No Megaport network data found')
    exit(1)

network = net_data['data'][0]
facility_ids = network.get('netfac_set', [])

print(f'Found {len(facility_ids)} Megaport facilities')

locations = []

# Fetch each facility's details
for i, fac_info in enumerate(facility_ids):
    fac_id = fac_info['fac_id']
    
    try:
        fac_data = fetch_json(f'https://www.peeringdb.com/api/fac/{fac_id}')
        
        if fac_data.get('data') and fac_data['data']:
            fac = fac_data['data'][0]
            
            # Only add if we have valid coordinates
            if fac.get('latitude') and fac.get('longitude'):
                locations.append({
                    'name': f"Megaport {fac['name']}",
                    'provider': 'megaport',
                    'region': get_region_from_country(fac['country']),
                    'country': fac['country'],
                    'city': fac['city'],
                    'lat': float(fac['latitude']),
                    'lng': float(fac['longitude'])
                })
        
        # Progress indicator
        if (i + 1) % 50 == 0:
            print(f'  Processed {i + 1}/{len(facility_ids)} facilities...')
        
        # Rate limiting
        time.sleep(0.1)
        
    except Exception as e:
        print(f'  Error fetching facility {fac_id}: {e}')

print(f'\nSuccessfully fetched {len(locations)} Megaport locations')

# Save to file
with open('data/megaport.json', 'w') as f:
    json.dump(locations, f, indent=2)

print(f'Saved to data/megaport.json')
print(f'\nTotal Megaport locations: {len(locations)}')
