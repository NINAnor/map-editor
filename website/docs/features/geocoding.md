---
sidebar_label: Geocoding
sidebar_position: 4
---

# Geocoding

## Location search (Geocoder)

The map toolbar includes a geocoding control powered by the [Nominatim](https://nominatim.org/) OpenStreetMap API. Users can type a place name or address and the map flies to the matching location.

Key behaviour:
- Results are ranked by relevance and restricted to the current map viewport bounding box when possible.
- Selecting a result smoothly animates the camera to the location.
- The search box is accessible via keyboard.

No API key is required because Nominatim is a free, open-source service.
