class ModelOptimizer {
    constructor() {
        this.selectedOption = null;
        this.basePrices = {
            enhanced: 149,
            realtime: 299,
            ai: 599
        };
        this.additionalCosts = {
            parallel: 50,
            monitoring: 25,
            expert: 100
        };
        
        this.init();
    }

    init() {
        this.initEventListeners();
        this.setDefaultDateTime();
    }

    initEventListeners() {
        // Option selection buttons
        document.querySelectorAll('.select-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const option = e.target.dataset.option;
                this.selectOption(option);
            });
        });

        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showOptions();
        });

        // Deploy button
        document.getElementById('deploy-btn').addEventListener('click', () => {
            this.deployModel();
        });

        // Timing options
        document.querySelectorAll('input[name="deployment-timing"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateTimingDisplay(e.target.value);
                this.updateSummary();
            });
        });

        // Additional options checkboxes
        document.querySelectorAll('#deployment-config input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSummary();
            });
        });

        // Date/time inputs
        document.getElementById('deployment-date').addEventListener('change', () => {
            this.updateSummary();
        });
        document.getElementById('deployment-time').addEventListener('change', () => {
            this.updateSummary();
        });
    }

    setDefaultDateTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateString = tomorrow.toISOString().split('T')[0];
        const timeString = '02:00'; // Default to 2 AM
        
        document.getElementById('deployment-date').value = dateString;
        document.getElementById('deployment-time').value = timeString;
    }

    selectOption(option) {
        this.selectedOption = option;
        this.showConfiguration();
        this.updateSelectedOptionDisplay();
        this.updateSummary();
    }

    showConfiguration() {
        // Hide options, show configuration
        document.querySelector('.optimization-section').style.display = 'none';
        document.getElementById('deployment-config').style.display = 'block';
        document.getElementById('back-btn').style.display = 'inline-flex';
        document.getElementById('deploy-btn').style.display = 'inline-flex';
    }

    showOptions() {
        // Show options, hide configuration
        document.querySelector('.optimization-section').style.display = 'block';
        document.getElementById('deployment-config').style.display = 'none';
        document.getElementById('back-btn').style.display = 'none';
        document.getElementById('deploy-btn').style.display = 'none';
        this.selectedOption = null;
    }

    updateSelectedOptionDisplay() {
        const selectedOptionDiv = document.getElementById('selected-option');
        const optionData = this.getOptionData(this.selectedOption);
        
        selectedOptionDiv.innerHTML = `
            <h4>${optionData.title} - $${optionData.price}</h4>
            <p>${optionData.description}</p>
        `;
    }

    getOptionData(option) {
        const options = {
            enhanced: {
                title: 'Enhanced Accuracy',
                price: this.basePrices.enhanced,
                description: 'High-resolution modeling with ±5% accuracy and expert validation'
            },
            realtime: {
                title: 'Real-Time Updates',
                price: this.basePrices.realtime,
                description: 'Live weather integration with 5-minute model updates'
            },
            ai: {
                title: 'AI-Powered Prediction',
                price: this.basePrices.ai,
                description: 'Machine learning enhanced predictions with scenario analysis'
            }
        };
        return options[option];
    }

    updateTimingDisplay(timing) {
        const scheduledSection = document.getElementById('scheduled-time');
        scheduledSection.style.display = timing === 'scheduled' ? 'block' : 'none';
    }

    updateSummary() {
        if (!this.selectedOption) return;

        const optionData = this.getOptionData(this.selectedOption);
        const timing = document.querySelector('input[name="deployment-timing"]:checked').value;
        
        // Calculate total cost
        let totalCost = optionData.price;
        
        // Add additional costs
        if (timing === 'parallel') {
            totalCost += this.additionalCosts.parallel;
        }
        
        if (document.getElementById('performance-monitoring').checked) {
            totalCost += this.additionalCosts.monitoring;
        }
        
        if (document.getElementById('expert-review').checked) {
            totalCost += this.additionalCosts.expert;
        }

        // Update summary display
        document.getElementById('summary-optimization').textContent = optionData.title;
        document.getElementById('summary-timing').textContent = this.getTimingText(timing);
        document.getElementById('summary-downtime').textContent = this.getDowntimeText(timing);
        document.getElementById('summary-cost').textContent = `$${totalCost}`;
    }

    getTimingText(timing) {
        const timingTexts = {
            immediate: 'Immediate',
            scheduled: 'Scheduled',
            parallel: 'Parallel Deployment'
        };
        
        if (timing === 'scheduled') {
            const date = document.getElementById('deployment-date').value;
            const time = document.getElementById('deployment-time').value;
            if (date && time) {
                return `Scheduled for ${date} at ${time}`;
            }
        }
        
        return timingTexts[timing];
    }

    getDowntimeText(timing) {
        const downtimeTexts = {
            immediate: '2-3 minutes',
            scheduled: '2-3 minutes',
            parallel: 'No downtime'
        };
        return downtimeTexts[timing];
    }

    async deployModel() {
        // Show deployment progress
        this.showDeploymentProgress();

        try {
            // Collect deployment configuration
            const config = this.collectDeploymentConfig();
            
            // Simulate deployment process
            await this.simulateDeployment();
            
            // Show success and redirect
            this.showDeploymentSuccess();
        } catch (error) {
            this.showDeploymentError(error);
        }
    }

    collectDeploymentConfig() {
        const timing = document.querySelector('input[name="deployment-timing"]:checked').value;
        
        return {
            optimization: this.selectedOption,
            timing: timing,
            scheduledDate: timing === 'scheduled' ? document.getElementById('deployment-date').value : null,
            scheduledTime: timing === 'scheduled' ? document.getElementById('deployment-time').value : null,
            notifications: {
                email: document.getElementById('email-notifications').checked,
                sms: document.getElementById('sms-notifications').checked,
                webhook: document.getElementById('webhook-notifications').checked
            },
            options: {
                backup: document.getElementById('backup-current').checked,
                monitoring: document.getElementById('performance-monitoring').checked,
                expertReview: document.getElementById('expert-review').checked
            }
        };
    }

    showDeploymentProgress() {
        const deployBtn = document.getElementById('deploy-btn');
        deployBtn.disabled = true;
        deployBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem; border: 3px solid #e2e8f0; border-top: 3px solid #16a34a; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Deploying Model...
        `;

        // Show progress overlay
        const overlay = document.createElement('div');
        overlay.className = 'deployment-overlay';
        overlay.innerHTML = `
            <div class="deployment-progress">
                <div class="progress-header">
                    <h3>Deploying Model Optimization</h3>
                    <p>Please wait while we upgrade your threat simulation...</p>
                </div>
                <div class="progress-steps">
                    <div class="progress-step active">
                        <div class="step-icon">1</div>
                        <span>Preparing optimization package</span>
                    </div>
                    <div class="progress-step">
                        <div class="step-icon">2</div>
                        <span>Backing up current model</span>
                    </div>
                    <div class="progress-step">
                        <div class="step-icon">3</div>
                        <span>Deploying enhanced model</span>
                    </div>
                    <div class="progress-step">
                        <div class="step-icon">4</div>
                        <span>Validating performance</span>
                    </div>
                    <div class="progress-step">
                        <div class="step-icon">5</div>
                        <span>Activating new model</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
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
                color: #16a34a;
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
                background: #16a34a;
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
                background: linear-gradient(90deg, #16a34a, #15803d);
                width: 0%;
                transition: width 0.5s ease;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
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
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
            
            // Mark as completed
            steps[i].classList.remove('active');
            steps[i].classList.add('completed');
        }

        // Final delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    showDeploymentSuccess() {
        // Remove progress overlay
        document.querySelector('.deployment-overlay')?.remove();
        
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
                <h3>Model Optimization Deployed!</h3>
                <p>Your enhanced threat simulation is now active with improved accuracy and capabilities.</p>
                <div class="success-actions">
                    <button class="btn-primary" onclick="window.location.href='/'">
                        View Enhanced Dashboard
                    </button>
                    <button class="btn-secondary" onclick="window.location.href='/configure'">
                        Configure New Simulation
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
                flex-wrap: wrap;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);

        // Auto-redirect after 5 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 5000);
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
            Deploy New Model
        `;

        // Show error message
        alert('Deployment failed. Please try again or contact support.');
    }
}

// Initialize the optimizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ModelOptimizer();
});