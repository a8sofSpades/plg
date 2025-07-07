class ThreatDashboard {
    constructor(map) {
        this.map = map;
        this.threats = [];
        this.markers = [];
        this.polygons = [];
        this.filters = {
            showWildfires: true,
            showFloods: true,
            showEarthquakes: true,
            showStorms: true,
            showThreatAreas: true,
            showActiveOnly: false
        };
        this.isPanelOpen = true;
        
        this.init();
    }

    async init() {
        this.initDateTime();
        this.initMap();
        this.initEventListeners();
        await this.loadThreats();
        this.updateUI();
    }

    initDateTime() {
        const updateDateTime = () => {
            const now = new Date();
            document.getElementById('current-date').textContent = now.toLocaleDateString();
            document.getElementById('current-time').textContent = now.toLocaleTimeString();
        };
        
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    initMap() {
        this.map = L.map('map', {
            center: [39.8283, -98.5795], // Center of USA
            zoom: 5,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

     
    }

     getMap() {
        return this.map;
    }

    initEventListeners() {
        // Panel toggle
        const panelToggle = document.getElementById('panel-toggle');
        const sidePanel = document.getElementById('side-panel');
        const mapContainer = document.getElementById('map-container');

        panelToggle.addEventListener('click', () => {
            this.isPanelOpen = !this.isPanelOpen;
            
            if (this.isPanelOpen) {
                sidePanel.classList.remove('closed');
                panelToggle.classList.remove('closed');
                mapContainer.classList.remove('expanded');
            } else {
                sidePanel.classList.add('closed');
                panelToggle.classList.add('closed');
                mapContainer.classList.add('expanded');
            }
            
            // Resize map after panel animation
            setTimeout(() => {
                this.map.invalidateSize();
            }, 300);
        });

        // Tab switching
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${targetTab}-content`).classList.add('active');
            });
        });

        // Filter checkboxes
        const filterCheckboxes = document.querySelectorAll('#filters-content input[type="checkbox"]');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filterId = e.target.id;
                const filterKey = this.getFilterKey(filterId);
                this.filters[filterKey] = e.target.checked;
                this.updateMapMarkers();
            });
        });
    }

    getFilterKey(filterId) {
        const filterMap = {
            'show-wildfires': 'showWildfires',
            'show-floods': 'showFloods',
            'show-earthquakes': 'showEarthquakes',
            'show-storms': 'showStorms',
            'show-threat-areas': 'showThreatAreas',
            'show-active-only': 'showActiveOnly'
        };
        return filterMap[filterId];
    }

    async loadThreats() {
        try {
            const response = await fetch('/api/threats');
            this.threats = await response.json();
            this.updateMapMarkers();
        } catch (error) {
            console.error('Error loading threats:', error);
        }
    }

    updateUI() {
        this.updateCounts();
        this.updateThreatsList();
    }

    updateCounts() {
        const counts = {
            wildfire: this.threats.filter(t => t.type === 'wildfire').length,
            flood: this.threats.filter(t => t.type === 'flood').length,
            earthquake: this.threats.filter(t => t.type === 'earthquake').length,
            storm: this.threats.filter(t => t.type === 'storm').length,
            active: this.threats.filter(t => t.status === 'active').length,
            total: this.threats.length
        };

        document.getElementById('wildfire-count').textContent = `(${counts.wildfire})`;
        document.getElementById('flood-count').textContent = `(${counts.flood})`;
        document.getElementById('earthquake-count').textContent = `(${counts.earthquake})`;
        document.getElementById('storm-count').textContent = `(${counts.storm})`;
        document.getElementById('active-count').textContent = `(${counts.active})`;
        document.getElementById('threat-count').textContent = counts.total;
        document.getElementById('total-threats').textContent = counts.total;
        document.getElementById('active-threats').textContent = counts.active;
    }

    updateThreatsList() {
        const threatsList = document.getElementById('threats-list');
        threatsList.innerHTML = '';

        this.threats.forEach(threat => {
            const threatElement = this.createThreatElement(threat);
            threatsList.appendChild(threatElement);
        });
    }

    createThreatElement(threat) {
        const div = document.createElement('div');
        div.className = 'threat-item';
        
        const iconSvg = this.getThreatIconSvg(threat.type);
        
        div.innerHTML = `
            <div class="threat-header">
                <div class="threat-title">
                    ${iconSvg}
                    <h4>${threat.title}</h4>
                </div>
                <span class="severity-badge severity-${threat.severity}">
                    ${threat.severity.toUpperCase()}
                </span>
            </div>
            <p class="threat-description">${threat.description}</p>
            <div class="threat-footer">
                <span class="status-badge status-${threat.status}">
                    ${threat.status}
                </span>
                <span class="threat-time">${threat.lastUpdated}</span>
            </div>
        `;
        
        return div;
    }

    getThreatIconSvg(type) {
        const icons = {
            wildfire: '<svg class="filter-icon wildfire" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
            flood: '<svg class="filter-icon flood" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.14 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.9 4.14 6.4s3.86 3.5 3.86 5.8a7.3 7.3 0 0 1-.84 3.31c-.53.84-1.11 1.54-1.71 2.1"/></svg>',
            earthquake: '<svg class="filter-icon earthquake" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>',
            storm: '<svg class="filter-icon storm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>'
        };
        return icons[type] || icons.wildfire;
    }

    updateMapMarkers() {
        // Clear existing markers and polygons
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.polygons.forEach(polygon => {
            this.map.removeLayer(polygon);
        });
        this.markers = [];
        this.polygons = [];

        this.threats.forEach(threat => {
            // Filter based on type
            const shouldShow = 
                (threat.type === 'wildfire' && this.filters.showWildfires) ||
                (threat.type === 'flood' && this.filters.showFloods) ||
                (threat.type === 'earthquake' && this.filters.showEarthquakes) ||
                (threat.type === 'storm' && this.filters.showStorms);

            // Filter based on active status
            const activeFilter = !this.filters.showActiveOnly || threat.status === 'active';

            if (!shouldShow || !activeFilter) return;

            // Create custom marker
            const markerSize = this.getSeveritySize(threat.severity);
            const markerColor = this.getThreatColor(threat.type);
            
            const customIcon = L.divIcon({
                className: 'custom-threat-marker',
                html: `<div class="threat-marker ${threat.type}" style="width: ${markerSize}px; height: ${markerSize}px; background: ${markerColor};"></div>`,
                iconSize: [markerSize, markerSize],
                iconAnchor: [markerSize / 2, markerSize / 2]
            });

            // Create marker
            const marker = L.marker([threat.location.lat, threat.location.lng], {
                icon: customIcon
            });

            // Create popup content
            const popupContent = `
                <div class="threat-popup">
                    <h3>${threat.title}</h3>
                    <p>${threat.description}</p>
                    <div class="threat-popup-footer">
                        <span class="severity-badge severity-${threat.severity}">
                            ${threat.severity.toUpperCase()}
                        </span>
                        <span class="threat-timestamp">${threat.lastUpdated}</span>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(this.map);
            this.markers.push(marker);

            // Create threat area polygon if enabled
            if (this.filters.showThreatAreas && threat.affectedArea) {
                const polygon = L.polygon(
                    threat.affectedArea.map(coord => [coord.lat, coord.lng]),
                    {
                        className: `threat-area-${threat.type}`,
                        color: this.getThreatColor(threat.type),
                        fillColor: this.getThreatColor(threat.type),
                        fillOpacity: 0.2,
                        weight: 2,
                        opacity: 0.8
                    }
                );

                polygon.addTo(this.map);
                this.polygons.push(polygon);
            }
        });

        this.updateUI();
    }

    getThreatColor(type) {
        const colors = {
            wildfire: '#ef4444',
            flood: '#3b82f6',
            earthquake: '#a855f7',
            storm: '#64748b'
        };
        return colors[type] || '#6b7280';
    }

    getSeveritySize(severity) {
        const sizes = {
            critical: 24,
            high: 20,
            medium: 16,
            low: 12
        };
        return sizes[severity] || 16;
    }
}

/*
// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ThreatDashboard();
    

});

**/