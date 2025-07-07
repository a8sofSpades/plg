class IncidentConfiguration {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {
            incident: {},
            weather: {},
            simulation: {},
            deployment: {}
        };
        
        this.init();
    }

    init() {
        this.initEventListeners();
        this.initFormValidation();
        this.updateSummary();
        this.setCurrentDateTime();
        this.initializeFormWithLocalStorage();
        //this.fetchUploadCaseData();
    }

    initEventListeners() {
        // Navigation buttons
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());
        document.getElementById('deploy-btn').addEventListener('click', () => this.deploySimulation());

        // Input method toggles
        document.querySelectorAll('input[name="input-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.toggleInputMethod(e.target.value));
        });

        // Weather method toggles
        document.querySelectorAll('input[name="weather-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.toggleWeatherMethod(e.target.value));
        });

        // Access type toggles
        document.querySelectorAll('input[name="access-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.toggleAccessType(e.target.value));
        });

        // Simulation tier changes
        document.querySelectorAll('input[name="simulation-tier"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateSummary());
        });

        // File upload
        /** 
        document.getElementById('report-file').addEventListener('change', (e) => this.handleFileUpload(e));
        document.querySelector('.file-upload-area').addEventListener('click', () => {
            document.getElementById('report-file').click();
        });*/

        // Form changes for summary updates
        document.querySelectorAll('select, input').forEach(element => {
            element.addEventListener('change', () => this.updateSummary());
        });

        // Location input for weather fetching
        document.getElementById('incident-location').addEventListener('blur', () => this.fetchWeatherData());
    }

    initFormValidation() {
        // Add real-time validation
        const requiredFields = [
            'incident-type',
            'incident-location',
            'chemical-name'
        ];

        

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
            }
        });
    }

    initializeFormWithLocalStorage() {
    
    const requiredFields = [
            'incident-type',
            'incident-location',
            'chemical-name'
        ];
    // Process each form element
    requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            

        const storedValue = localStorage.getItem(field.name);

        // Load stored value if exists
        if (storedValue !== null) {
            if (field.type === 'checkbox') {
                field.checked = storedValue === 'true';
            } else if (field.type === 'radio') {
                field.checked = (storedValue === element.value);
            } else {
                field.value = storedValue;
            }
        }

        // Save value to localStorage on change
        field.addEventListener('change', function() {
            if (this.type === 'checkbox') {
                localStorage.setItem(this.name, this.checked.toString());
            } else if (this.type === 'radio' && this.checked) {
                localStorage.setItem(this.name, this.value);
            } else if (this.type !== 'radio') { // Skip unchecked radios
                localStorage.setItem(this.name, this.value);
            }
        });
    });
   
}



    setCurrentDateTime() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('incident-time').value = localDateTime;
    }

    toggleInputMethod(method) {
        // Hide all input areas
        document.getElementById('text-input').style.display = 'none';
        document.getElementById('file-input').style.display = 'none';
        document.getElementById('url-input').style.display = 'none';

        // Show selected input area
        //document.getElementById(`${method}-input`).style.display = 'block';
    }

    toggleWeatherMethod(method) {
        document.getElementById('live-weather').style.display = method === 'live' ? 'block' : 'none';
        document.getElementById('manual-weather').style.display = method === 'manual' ? 'block' : 'none';

        if (method === 'live') {
            this.fetchWeatherData();
        }
    }

    toggleAccessType(type) {
        // Hide all access settings
        document.getElementById('geographic-settings').style.display = 'none';
        document.getElementById('limited-settings').style.display = 'none';

        // Show relevant settings
        if (type === 'geographic') {
            document.getElementById('geographic-settings').style.display = 'block';
        } else if (type === 'limited') {
            document.getElementById('limited-settings').style.display = 'block';
        }

        this.updateSummary();
    }


    async fetchUploadCaseData(){
            const url = 'http://localhost:5000/api/access_data';
            
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            const upload_details=document.getElementById('upload_info')
            const fileName = data.fileName;
            upload_details.innerHTML = `Uploaded File: ${fileName} KB`;
  
    }

    async fetchWeatherData() {
        const location = document.getElementById('incident-location').value;
        if (!location) return;

        const weatherStatus = document.querySelector('.weather-loading');
        weatherStatus.innerHTML = `
            <div class="spinner"></div>
            <p>Fetching live weather data for ${location}...</p>
        `;

        try {
            // Simulate API call - replace with actual weather API
            //await new Promise(resolve => setTimeout(resolve, 2000));

            //const fetch = require('node-fetch');

            const url = 'https://pro.weatherxm.com/api/v1/stations/0d5a1940-bf54-11ed-9972-4f669f2d96bd/latest';
            const options = {method: 'GET', headers: {Accept: 'application/json', 'X-API-KEY': 'xyz'}};

            try {
            const response = await fetch(url, options);
            const data = await response.json();
            console.log(data);
            console.log(data.observation.temperature)
            const weatherData = {
                station_lat:"",
                station_long:"",
                station_elevation:"",
                temperature: data.observation.temperature,
                humidity: data.observation.humidity,
                windSpeed: data.observation.wind_speed,
                windDirection: data.observation.wind_direction,
                pressure: data.observation.pressure,
                visibility: 10
            };

            weatherStatus.innerHTML = `
                <div><p> Station Data: Lat: xyx, Lon: xyz: ,Elevation: xyz </p> </div>
                <div class="weather-results">
                    <h4>Current Weather Conditions</h4>
                    <div class="weather-grid">
                        <div class="weather-item">
                            <span class="weather-label">Temperature:</span>
                            <span class="weather-value">${weatherData.temperature}°F</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Wind:</span>
                            <span class="weather-value">${weatherData.windSpeed} mph from ${weatherData.windDirection}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Humidity:</span>
                            <span class="weather-value">${weatherData.humidity}%</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Pressure:</span>
                            <span class="weather-value">${weatherData.pressure} hPa</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Visibility:</span>
                            <span class="weather-value">${weatherData.visibility} miles</span>
                        </div>
                    </div>
                    <p class="weather-timestamp">Last updated: ${new Date().toLocaleTimeString()}</p>
                </div>
            `;

            } catch (error) {
            console.error(error);
            }
            
            // Mock weather data
            /*const weatherData = {
                temperature: 72,
                humidity: 65,
                windSpeed: 8,
                windDirection: 'E',
                pressure: 1013,
                visibility: 10
            }; **/

            

            

            // Add weather grid styles
            const style = document.createElement('style');
            style.textContent = `
                .weather-results {
                    text-align: left;
                    background: #f8fafc;
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                }
                .weather-results h4 {
                    margin-bottom: 1rem;
                    color: #1e293b;
                }
                .weather-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .weather-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .weather-label {
                    font-weight: 500;
                    color: #64748b;
                }
                .weather-value {
                    font-weight: 600;
                    color: #1e293b;
                }
                .weather-timestamp {
                    font-size: 0.75rem;
                    color: #64748b;
                    text-align: center;
                    margin-top: 1rem;
                }
            `;
            document.head.appendChild(style);

        } catch (error) {
            weatherStatus.innerHTML = `
                <div class="weather-error">
                    <p>Unable to fetch weather data. Please enter manually or try again.</p>
                    <button type="button" class="btn-secondary" onclick="this.closest('.weather-loading').querySelector('p').click()">Retry</button>
                </div>
            `;
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const uploadArea = document.querySelector('.file-upload-content');
        uploadArea.innerHTML = `
            <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
            </svg>
            <p><strong>${file.name}</strong></p>
            <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
            <button type="button" class="btn-secondary mt-2" onclick="document.getElementById('report-file').value=''; this.closest('.file-upload-content').innerHTML=this.closest('.file-upload-area').dataset.original;">Remove</button>
        `;

        // Store original content for reset
        if (!uploadArea.closest('.file-upload-area').dataset.original) {
            uploadArea.closest('.file-upload-area').dataset.original = uploadArea.innerHTML;
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;

        field.classList.toggle('invalid', !isValid);
        
        // Add validation styling
        if (!document.querySelector('#validation-styles')) {
            const style = document.createElement('style');
            style.id = 'validation-styles';
            style.textContent = `
                .form-control.invalid {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }
            `;
            document.head.appendChild(style);
        }

        return isValid;
    }

    validateStep(step) {
        let isValid = true;
        const stepElement = document.getElementById(`step-${step}`);

        switch (step) {
            case 1:
                const requiredFields = ['incident-type', 'incident-location', 'chemical-name'];
                requiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (!this.validateField(field)) {
                        isValid = false;
                    }
                });
                break;
            case 2:
                // Weather validation - always valid as we have defaults
                break;
            case 3:
                // Simulation settings - always valid as we have defaults
                break;
            case 4:
                // Deployment settings - always valid as we have defaults
                break;
        }

        return isValid;
    }

    nextStep() {
        if (!this.validateStep(this.currentStep)) {
            this.showValidationError();
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Update progress steps
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const deployBtn = document.getElementById('deploy-btn');

        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-flex';
        deployBtn.style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';

        // Update button text
        if (this.currentStep === this.totalSteps - 1) {
            nextBtn.innerHTML = `
                Review & Deploy
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                </svg>
            `;
        } else {
            nextBtn.innerHTML = `
                Next
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                </svg>
            `;
        }
    }

    showValidationError() {
        // Create and show validation error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Please fill in all required fields before continuing.</p>
            </div>
        `;

        // Add error styles
        const style = document.createElement('style');
        style.textContent = `
            .validation-error {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #ef4444;
                border-radius: 0.75rem;
                padding: 1.5rem;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                animation: errorSlideIn 0.3s ease;
            }
            .error-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .error-icon {
                width: 1.5rem;
                height: 1.5rem;
                color: #ef4444;
                flex-shrink: 0;
            }
            .validation-error p {
                color: #1e293b;
                font-weight: 500;
                margin: 0;
            }
            @keyframes errorSlideIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(errorDiv);

        // Remove error after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    updateSummary() {
        const tierRadio = document.querySelector('input[name="simulation-tier"]:checked');
        const accessRadio = document.querySelector('input[name="access-type"]:checked');
        const durationSelect = document.getElementById('simulation-duration');
        const expirySelect = document.getElementById('expiry-duration');

        if (!tierRadio || !accessRadio) return;

        const tierPrices = {
            base: 29,
            dynamic: 79,
            expert: 199
        };

        const tierNames = {
            base: 'Base',
            dynamic: 'Dynamic',
            expert: 'Expert'
        };

        const accessNames = {
            public: 'Anyone with Link',
            geographic: 'Geographic Restriction',
            limited: 'Limited Users'
        };

        const expiryNames = {
            24: '24 hours',
            72: '3 days',
            168: '1 week',
            720: '1 month',
            0: 'No expiry'
        };

        // Update summary display
        document.getElementById('summary-tier').textContent = tierNames[tierRadio.value];
        document.getElementById('summary-access').textContent = accessNames[accessRadio.value];
        document.getElementById('summary-duration').textContent = durationSelect ? durationSelect.options[durationSelect.selectedIndex].text : '24 hours';
        document.getElementById('summary-expiry').textContent = expirySelect ? expiryNames[expirySelect.value] : '1 week';
        //document.getElementById('summary-cost').textContent = `$${tierPrices[tierRadio.value]}`;
    }

    async deploySimulation() {
        // Collect all form data
        this.collectFormData();

        // Show deployment progress
        this.showDeploymentProgress();

        try {
            // Simulate deployment process
            await this.simulateDeployment();
            
            // Redirect to dashboard with simulation data
            this.redirectToDashboard();
        } catch (error) {
            this.showDeploymentError(error);
        }
    }

    collectFormData() {
        // Collect incident data
        this.formData.incident = {
            type: document.getElementById('incident-type').value,
            location: document.getElementById('incident-location').value,
            time: document.getElementById('incident-time').value,
            chemical: document.getElementById('chemical-name').value,
            releaseRate: document.getElementById('release-rate').value,
            duration: document.getElementById('release-duration').value,
            report: document.getElementById('incident-report').value
        };

        // Collect weather data
        const weatherMethod = document.querySelector('input[name="weather-method"]:checked').value;
        if (weatherMethod === 'manual') {
            this.formData.weather = {
                method: 'manual',
                windSpeed: document.getElementById('wind-speed').value,
                windDirection: document.getElementById('wind-direction').value,
                temperature: document.getElementById('temperature').value,
                humidity: document.getElementById('humidity').value,
                pressure: document.getElementById('pressure').value,
                visibility: document.getElementById('visibility').value
            };
        } else {
            this.formData.weather = {
                method: 'live',
                location: this.formData.incident.location
            };
        }

        // Collect simulation settings
        this.formData.simulation = {
            tier: document.querySelector('input[name="simulation-tier"]:checked').value,
            duration: document.getElementById('simulation-duration').value,
            updateFrequency: document.getElementById('update-frequency').value,
            includeTerrain: document.getElementById('include-terrain').checked,
            includeBuildings: document.getElementById('include-buildings').checked
        };

        // Collect deployment settings
        this.formData.deployment = {
            accessType: document.querySelector('input[name="access-type"]:checked').value,
            proximityRadius: document.getElementById('proximity-radius')?.value,
            maxUsers: document.getElementById('max-users')?.value,
            allowDownload: document.getElementById('allow-download').checked,
            allowSharing: document.getElementById('allow-sharing').checked,
            requireRegistration: document.getElementById('require-registration').checked,
            expiryDuration: document.getElementById('expiry-duration').value
        };
    }

    showDeploymentProgress() {
        const deployBtn = document.getElementById('deploy-btn');
        deployBtn.disabled = true;
        deployBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem; border-width: 2px;"></div>
            Deploying Simulation...
        `;

        // Show progress overlay
        const overlay = document.createElement('div');
        overlay.className = 'deployment-overlay';
        overlay.innerHTML = `
            <div class="deployment-progress">
                <div class="progress-header">
                    <h3>Deploying Threat Simulation</h3>
                    <p>Please wait while we set up your simulation...</p>
                </div>
               
            </div>
        `;

        // Add overlay styles
        const style = document.createElement('style');
        style.textContent = `
            .deployment-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .deployment-progress {
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
            }
            .progress-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            .progress-header h3 {
                color: #1e293b;
                margin-bottom: 0.5rem;
            }
            .progress-header p {
                color: #64748b;
            }
            .progress-steps {
                margin-bottom: 2rem;
            }
            .progress-step {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem 0;
                color: #64748b;
                transition: color 0.3s ease;
            }
            .progress-step.active {
                color: #3b82f6;
            }
            .progress-step.completed {
                color: #16a34a;
            }
            .step-icon {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background: #f1f5f9;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.875rem;
                transition: all 0.3s ease;
            }
            .progress-step.active .step-icon {
                background: #3b82f6;
                color: white;
            }
            .progress-step.completed .step-icon {
                background: #16a34a;
                color: white;
            }
            .progress-bar {
                height: 0.5rem;
                background: #f1f5f9;
                border-radius: 0.25rem;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                width: 0%;
                transition: width 0.5s ease;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);
    }

    async simulateDeployment() {
        const steps = document.querySelectorAll('.progress-step');
        const progressFill = document.querySelector('.progress-fill');
        
        for (let i = 0; i < steps.length; i++) {
            // Update progress
            steps[i].classList.add('active');
            progressFill.style.width = `${((i + 1) / steps.length) * 100}%`;
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            
            // Mark as completed
            steps[i].classList.remove('active');
            steps[i].classList.add('completed');
        }

        // Final delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    showDeploymentError(error) {
        console.error('Deployment error:', error);
        
        // Remove progress overlay
        document.querySelector('.deployment-overlay')?.remove();
        
        // Reset deploy button
        const deployBtn = document.getElementById('deploy-btn');
        deployBtn.disabled = false;
        deployBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/>
                <path d="M7 4h10v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4Z"/>
                <path d="M9 9h6"/>
                <path d="M9 13h6"/>
            </svg>
            Deploy Simulation
        `;

        // Show error message
        alert('Deployment failed. Please try again.');
    }

    redirectToDashboard() {
        // Remove progress overlay
        document.querySelector('.deployment-overlay')?.remove();
        
        // Store configuration data for the dashboard
        localStorage.setItem('simulationConfig', JSON.stringify(this.formData));
        
        // Show success message and redirect
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                </div>
                <h3>Simulation Deployed Successfully!</h3>
                <p>Your threat simulation is now live and accessible.</p>
                <div class="success-actions">
                    <button class="btn-primary" onclick="window.location.href='/'">
                        View Dashboard
                    </button>
                    <button class="btn-secondary" onclick="navigator.clipboard.writeText(window.location.origin + '/?sim=' + Date.now())">
                        Copy Share Link
                    </button>
                </div>
            </div>
        `;

        // Add success styles
        const style = document.createElement('style');
        style.textContent = `
            .success-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .success-message {
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                text-align: center;
                max-width: 400px;
                width: 90%;
            }
            .success-icon {
                width: 4rem;
                height: 4rem;
                background: #dcfce7;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
            }
            .success-icon svg {
                width: 2rem;
                height: 2rem;
                color: #16a34a;
            }
            .success-message h3 {
                color: #1e293b;
                margin-bottom: 0.5rem;
            }
            .success-message p {
                color: #64748b;
                margin-bottom: 2rem;
            }
            .success-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);

        // Auto-redirect after 3 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }
}

// Initialize the configuration page
document.addEventListener('DOMContentLoaded', () => {
    new IncidentConfiguration();
});