import json
import time

# Load all data
with open('data/all-locations.json', 'r') as f:
    all_data = json.load(f)

# Fix Equinix naming (remove duplicate 'Equinix' prefix)
equinix_fixed = []
for loc in all_data['equinix']:
    # If name starts with 'Equinix Equinix', remove the duplicate
    if loc['name'].startswith('Equinix Equinix'):
        loc['name'] = loc['name'].replace('Equinix Equinix', 'Equinix', 1)
    equinix_fixed.append(loc)

all_data['equinix'] = equinix_fixed
all_data['lastUpdated'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())

# Save updated data
with open('data/equinix.json', 'w') as f:
    json.dump(equinix_fixed, f, indent=2)

with open('data/all-locations.json', 'w') as f:
    json.dump(all_data, f, indent=2)

with open('docs/data/all-locations.json', 'w') as f:
    json.dump(all_data, f, indent=2)

print('Fixed Equinix naming')
print(f'\n=== South America - Final ===')
megaport_sa = [loc for loc in all_data['megaport'] if loc['region'] == 'South America']
equinix_sa = [loc for loc in all_data['equinix'] if loc['region'] == 'South America']

print(f'\nMegaport South America ({len(megaport_sa)}):')
for loc in sorted(megaport_sa, key=lambda x: (x['country'], x['city'])):
    print(f'  - {loc["name"]}')
    print(f'    {loc["city"]}, {loc["country"]}')

print(f'\nEquinix South America ({len(equinix_sa)}):')
for loc in sorted(equinix_sa, key=lambda x: (x['country'], x['city'])):
    print(f'  - {loc["name"]}')
    print(f'    {loc["city"]}, {loc["country"]}')

print(f'\n=== Final Totals ===')
print(f'Megaport: {len(all_data["megaport"])} locations')
print(f'Equinix: {len(all_data["equinix"])} locations')
print(f'11:11 Systems: {len(all_data["1111systems"])} locations')
print(f'Total: {all_data["totalLocations"]} locations')
