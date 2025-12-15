/**
 * Interactive Onboarding System
 * Guided tour for new users
 */

export class OnboardingTour {
    constructor() {
        this.steps = [
            {
                target: '#elements-panel',
                title: 'Elements Panel',
                content: 'Drag and drop elements to build your website',
                position: 'right'
            },
            {
                target: '#canvas',
                title: 'Canvas',
                content: 'This is your website canvas. Click elements to edit them',
                position: 'center'
            },
            {
                target: '#properties-panel',
                title: 'Properties Panel',
                content: 'Customize colors, fonts, spacing and more',
                position: 'left'
            },
            {
                target: '#publish-btn',
                title: 'Publish',
                content: 'When ready, click here to publish your website',
                position: 'bottom'
            }
        ];
        this.currentStep = 0;
        this.completed = localStorage.getItem('yenze_onboarding_completed') === 'true';
    }

    start() {
        if (this.completed) return;
        this.showStep(0);
    }

    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }

        this.currentStep = index;
        const step = this.steps[index];

        const overlay = this._createOverlay(step);
        document.body.appendChild(overlay);
    }

    _createOverlay(step) {
        const overlay = document.createElement('div');
        overlay.className = 'onboarding-overlay';
        overlay.innerHTML = `
            <div class="onboarding-spotlight" data-target="${step.target}"></div>
            <div class="onboarding-tooltip" style="position: absolute;">
                <h3>${step.title}</h3>
                <p>${step.content}</p>
                <div class="onboarding-actions">
                    <button class="skip-btn">Skip</button>
                    <div>
                        <span class="step-indicator">${this.currentStep + 1}/${this.steps.length}</span>
                        <button class="next-btn">Next</button>
                    </div>
                </div>
            </div>
        `;

        overlay.querySelector('.skip-btn').addEventListener('click', () => this.complete());
        overlay.querySelector('.next-btn').addEventListener('click', () => {
            overlay.remove();
            this.showStep(this.currentStep + 1);
        });

        return overlay;
    }

    complete() {
        localStorage.setItem('yenze_onboarding_completed', 'true');
        document.querySelector('.onboarding-overlay')?.remove();
    }
}

export const onboarding = new OnboardingTour();
window.onboarding = onboarding;
