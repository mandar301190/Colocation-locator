#!/usr/bin/env python3
import json
import urllib.request

def fetch_facility(fac_id):
    url = f'https://www.peeringdb.com/api/fac/{fac_id}'
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())

# Fetch missing Brazil facilities
print('Fetching missing Brazil facilities...')

# Facility 7590 - Ascenty VIN2 - Vinhedo
fac_7590 = fetch_facility(7590)
# Facility 1283 - Equinix SP2 - São Paulo (Barueri)
fac_1283 = fetch_facility(1283)

missing_locations = []

for fac_data in [fac_7590, fac_1283]:
    if fac_data.get('data') and fac_data['data']:
        fac = fac_data['data'][0]
        if fac.get('latitude') and fac.get('longitude'):
            location = {
                'name': f"Megaport {fac['name']}",
                'provider': 'megaport',
                'region': 'South America',
                'country': fac['country'],
                'city': fac['city'],
                'lat': float(fac['latitude']),
                'lng': float(fac['longitude'])
            }
            missing_locations.append(location)
            print(f"  ✓ {location['name']} ({location['city']})")

# Load existing data
with open('data/megaport.json', 'r') as f:
    existing_data = json.load(f)

print(f'\nBefore: {len(existing_data)} locations')

# Add missing locations
existing_data.extend(missing_locations)

print(f'After: {len(existing_data)} locations')

# Save updated data
with open('data/megaport.json', 'w') as f:
    json.dump(existing_data, f, indent=2)

# Also update docs/data
with open('docs/data/megaport.json', 'w') as f:
    json.dump(existing_data, f, indent=2)

print(f'\n✓ Added {len(missing_locations)} missing Brazil locations')
print('✓ Updated data/megaport.json')
print('✓ Updated docs/data/megaport.json')
