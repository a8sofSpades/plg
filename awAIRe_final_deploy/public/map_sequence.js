import ThreatDashboard from './script.js';

// Initialize the map using the global L object from Leaflet CDN
const map = new L.Map('map', { center: new L.LatLng(58.4, 43.0), zoom: 11 });
const osm = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

map.addLayer(osm);
new ThreatDashboard(map);

// Store overlay layers for cleanup
let overlayLayers = [];

// Function to recursively find all polygons in a layer group
function findAllPolygons(layer, polygons = []) {
    if (layer instanceof L.Polygon) {
        polygons.push(layer);
    } else if (layer instanceof L.LayerGroup || layer instanceof L.FeatureGroup) {
        layer.eachLayer(function(subLayer) {
            findAllPolygons(subLayer, polygons);
        });
    }
    return polygons;
}

// Function to create animated overlay polygons that sit on top of originals
function createAnimatedOverlays(kmlLayer) {
    console.log('=== Creating animated overlay polygons (ALL originals preserved) ===');
    
    // Clear any existing overlays
    overlayLayers.forEach(overlay => {
        if (map.hasLayer(overlay)) {
            map.removeLayer(overlay);
        }
    });
    overlayLayers = [];
    
    // Find all polygons recursively
    const allPolygons = findAllPolygons(kmlLayer);
    console.log(`Found ${allPolygons.length} total polygons`);
    
    if (allPolygons.length === 0) {
        console.log('No polygons found.');
        return;
    }
    
    allPolygons.forEach((layer, index) => {
        console.log(`Processing polygon #${index + 1}`);
        
        // Get the name from popup
        let name = '';
        if (layer.getPopup && layer.getPopup()) {
            const popupContent = layer.getPopup().getContent();
            if (popupContent && typeof popupContent === 'string') {
                const nameMatch = popupContent.match(/<h2[^>]*>(.*?)<\/h2>/);
                if (nameMatch) {
                    name = nameMatch[1];
                }
            }
        }
        
        console.log('Layer name:', name || 'unnamed');
        
        
        let animationClass = null;
        let overlayColor = null;
        let overlayOpacity = 0.3;
        
        if (name && (name.toLowerCase().includes('red') && name.toLowerCase().includes('threat'))) {
            animationClass = 'css-red-zone-animated';
            overlayColor = '#ff0000';
            overlayOpacity = 0.4;
            console.log('Creating RED zone overlay animation');
        } else if (name && (name.toLowerCase().includes('orange') && name.toLowerCase().includes('threat'))) {
            animationClass = 'css-orange-zone-animated';
            overlayColor = '#ff8000';
            overlayOpacity = 0.3;
            console.log('Creating ORANGE zone overlay animation');
        } else if (name && (name.toLowerCase().includes('yellow') && name.toLowerCase().includes('threat'))) {
            animationClass = 'css-yellow-zone-animated';
            overlayColor = '#ffff00';
            overlayOpacity = 0.2;
            console.log(' Creating YELLOW zone overlay animation');
        } else {
            console.log('No overlay animation needed for:', name, '(but polygon preserved)');
            return; 
        }
        
        if (animationClass && overlayColor) {
            try {
                // Get the original coordinates from the layer
                const originalCoords = layer.getLatLngs();
                console.log('Original coordinates extracted:', originalCoords.length > 0 ? 'success' : 'failed');
                
                if (originalCoords && originalCoords.length > 0) {
                    // Create a new overlay polygon with the EXACT same coordinates
                    const overlayPolygon = L.polygon(originalCoords, {
                        color: overlayColor,
                        fillColor: overlayColor,
                        fillOpacity: overlayOpacity,
                        weight: 3,
                        opacity: 0.8,
                        className: animationClass,
                        interactive: false, // Don't interfere with original polygon interactions
                        pane: 'overlayPane' // Ensure it's on top
                    });
                    
                    // Add the overlay to the map
                    overlayPolygon.addTo(map);
                    overlayLayers.push(overlayPolygon);
                    
                    console.log(`✅ Overlay polygon created and added to map with class "${animationClass}"`);
                    
                    // Apply CSS animation to the overlay's DOM element
                    setTimeout(() => {
                        const overlayElement = overlayPolygon.getElement();
                        if (overlayElement) {
                            overlayElement.classList.add(animationClass);
                            console.log(`CSS animation class applied to overlay element`);
                        } else {
                            console.warn('Could not find overlay element for animation');
                        }
                    }, 100);
                } else {
                    console.warn('Could not extract coordinates from original polygon');
                }
            } catch (error) {
                console.error('Error creating overlay polygon:', error);
            }
        }
    });
    
    console.log(`=== Overlay creation complete. Created ${overlayLayers.length} animated overlays ===`);
    console.log(`=== ALL ${allPolygons.length} original polygons preserved and untouched ===`);
}

// Load kml file
fetch('./incident_data/kml_1530.kml')
    .then(res => res.text())
    .then(kmltext => {
        console.log('KML loaded successfully');
        
        // Create new kml overlay
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmltext, 'text/xml');
        const track = new L.KML(kml);
        
        // Add the KML layer to the map
        map.addLayer(track);
        
        // Create animated overlays when ready
        track.on('ready', function() {
            console.log('KML layer ready, creating animated overlays...');
            setTimeout(() => {
                createAnimatedOverlays(track);
            }, 1000);
        });
        
        // Fallback: create overlays after delay
        setTimeout(() => {
            console.log('Creating animated overlays after delay...');
            createAnimatedOverlays(track);
        }, 2000);
        
        // Additional fallback
        setTimeout(() => {
            console.log('Final attempt to create animated overlays...');
            createAnimatedOverlays(track);
        }, 3000);
        
        // Adjust map to show the kml
        const bounds = track.getBounds();
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds);
        }
    })
    .catch(error => {
        console.error('Error loading KML:', error);
    });