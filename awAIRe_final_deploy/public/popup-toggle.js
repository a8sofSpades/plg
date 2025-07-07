// Global function to handle popup content toggling
window.togglePopupContent = function(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;
    
    const originalView = document.getElementById(popupId + '-original');
    const summaryView = document.getElementById(popupId + '-summary');
    const toggleBtn = popup.querySelector('.toggle-btn');
    const toggleIcon = popup.querySelector('.toggle-icon');
    const popupTitle = popup.querySelector('.popup-title');
    
    if (!originalView || !summaryView) return;
    
    // Check which view is currently active
    const isShowingOriginal = originalView.classList.contains('active');
    
    if (isShowingOriginal) {
        // Switch to summary view
        originalView.classList.remove('active');
        summaryView.classList.add('active');
        toggleIcon.style.transform = 'rotate(90deg)';
        popupTitle.textContent = 'Incident Summary';
        
        // Load incident summary if not already loaded
        if (summaryView.querySelector('.loading-spinner')) {
            loadIncidentSummary(popupId);
        }
    } else {
        // Switch back to original view
        summaryView.classList.remove('active');
        originalView.classList.add('active');
        toggleIcon.style.transform = 'rotate(0deg)';
        popupTitle.textContent = 'ALOHA Source Point';
    }
};

// Function to load incident summary from server
async function loadIncidentSummary(popupId) {
    const summaryView = document.getElementById(popupId + '-summary');
    if (!summaryView) return;
    
    try {
        const response = await fetch('/api/incident-summary/CHLORINE-78701');
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            
            const summaryHTML = `
                <div class="incident-summary">
                    <div class="summary-header">
                        <div class="incident-id">
                            <strong>Incident ID:</strong> ${data.incidentId}
                        </div>
                        <div class="incident-status status-${data.status.toLowerCase()}">
                            ${data.status}
                        </div>
                    </div>
                    
                    <div class="summary-section">
                        <h4>Chemical Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Chemical:</span>
                                <span class="value">${data.chemical.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Concentration:</span>
                                <span class="value">${data.chemical.concentration}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Release Type:</span>
                                <span class="value">${data.chemical.releaseType}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Duration:</span>
                                <span class="value">${data.chemical.estimatedDuration}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-section">
                        <h4>Threat Zones</h4>
                        <div class="threat-zones">
                            <div class="zone-item red-zone">
                                <div class="zone-color"></div>
                                <div class="zone-info">
                                    <strong>Red Zone:</strong> ${data.threatZones.red.distance}<br>
                                    <small>${data.threatZones.red.description}</small>
                                </div>
                            </div>
                            <div class="zone-item orange-zone">
                                <div class="zone-color"></div>
                                <div class="zone-info">
                                    <strong>Orange Zone:</strong> ${data.threatZones.orange.distance}<br>
                                    <small>${data.threatZones.orange.description}</small>
                                </div>
                            </div>
                            <div class="zone-item yellow-zone">
                                <div class="zone-color"></div>
                                <div class="zone-info">
                                    <strong>Yellow Zone:</strong> ${data.threatZones.yellow.distance}<br>
                                    <small>${data.threatZones.yellow.description}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-section">
                        <h4>Response Status</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Units Dispatched:</span>
                                <span class="value">${data.response.unitsDispatched.join(', ')}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Evacuation:</span>
                                <span class="value">${data.response.evacuationStatus}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Estimated Affected:</span>
                                <span class="value">${data.response.estimatedAffected.toLocaleString()} people</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-section">
                        <h4>Weather Conditions</h4>
                        <div class="weather-info">
                            <span><strong>Wind:</strong> ${data.weather.windSpeed} from ${data.weather.windDirection}</span>
                            <span><strong>Temp:</strong> ${data.weather.temperature}</span>
                            <span><strong>Humidity:</strong> ${data.weather.humidity}</span>
                        </div>
                    </div>
                    
                    <div class="summary-section">
                        <h4>Timeline</h4>
                        <div class="timeline">
                            ${data.timeline.map(event => `
                                <div class="timeline-item">
                                    <span class="time">${event.time}</span>
                                    <span class="event">${event.event}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            summaryView.innerHTML = summaryHTML;
        } else {
            summaryView.innerHTML = '<div class="error-message">Failed to load incident summary</div>';
        }
    } catch (error) {
        console.error('Error loading incident summary:', error);
        summaryView.innerHTML = '<div class="error-message">Error loading incident summary</div>';
    }
}