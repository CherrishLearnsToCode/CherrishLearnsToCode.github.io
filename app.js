// Apology Microsite JavaScript
// Handles step progression, animations, confetti, and localStorage persistence

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'apology_progress';
    const CONFETTI_COUNT = 15;
    const CONFETTI_COLORS = ['#FF6FAE', '#E0467B', '#FFB7C5', '#FFD6E2'];
    
    // State management
    let currentStep = 1;
    let isAnimating = false;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // DOM elements
    const elements = {
        liveRegion: null,
        buttons: {},
        messages: {},
        dateOptions: null,
        confettiContainer: null
    };

    // Initialize the application
    function init() {
        cacheElements();
        loadProgress();
        setupEventListeners();
        updateUI();
        
        // Update reduced motion preference if it changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            prefersReducedMotion = e.matches;
        });
    }

    // Cache DOM elements for performance
    function cacheElements() {
        elements.liveRegion = document.getElementById('live-region');
        elements.confettiContainer = document.getElementById('confetti-container');
        elements.dateOptions = document.getElementById('date-options');
        
        // Cache buttons and messages
        for (let i = 1; i <= 4; i++) {
            elements.buttons[i] = document.getElementById(`btn-${i}`);
            elements.messages[i] = document.getElementById(`message-${i}`);
        }
    }

    // Load progress from localStorage
    function loadProgress() {
        // Always start fresh - don't load from localStorage on page load
        currentStep = 1;
        
        // Clear any existing progress
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Could not clear localStorage:', error);
        }
    }

    // Save progress to localStorage
    function saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                currentStep: currentStep,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Could not save progress to localStorage:', error);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Add click handlers for each button
        Object.entries(elements.buttons).forEach(([step, button]) => {
            if (button) {
                button.addEventListener('click', () => handleButtonClick(parseInt(step)));
                
                // Add keyboard support
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleButtonClick(parseInt(step));
                    }
                });
            }
        });

        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

    // Handle button clicks
    function handleButtonClick(step) {
        if (isAnimating || step !== currentStep) return;
        
        isAnimating = true;
        
        // Hide current button with animation
        const currentButton = elements.buttons[step];
        if (currentButton) {
            if (!prefersReducedMotion) {
                currentButton.classList.add('fade-out');
                setTimeout(() => {
                    currentButton.classList.add('hidden');
                    currentButton.classList.remove('fade-out');
                }, 400);
            } else {
                currentButton.classList.add('hidden');
            }
        }

        // Show current message
        setTimeout(() => {
            revealMessage(step);
            
            // Move to next step or finish
            if (step < 4) {
                currentStep = step + 1;
                setTimeout(() => {
                    showNextButton(currentStep);
                    isAnimating = false;
                }, prefersReducedMotion ? 100 : 600);
            } else {
                // Final step - show confetti and date options
                setTimeout(() => {
                    triggerConfetti();
                    showDateOptions();
                    isAnimating = false;
                }, prefersReducedMotion ? 100 : 800);
            }
            
            saveProgress();
        }, prefersReducedMotion ? 50 : 200);
    }

    // Reveal a message with animation
    function revealMessage(step) {
        const message = elements.messages[step];
        if (!message) return;

        message.classList.remove('hidden');
        
        if (!prefersReducedMotion) {
            message.classList.add('slide-in');
        }

        // Update live region for screen readers
        const messageText = message.querySelector('.message-text');
        if (messageText && elements.liveRegion) {
            elements.liveRegion.textContent = messageText.textContent;
        }

        // Remove animation class after animation completes
        if (!prefersReducedMotion) {
            setTimeout(() => {
                message.classList.remove('slide-in');
            }, 600);
        }
    }

    // Show the next button
    function showNextButton(step) {
        const button = elements.buttons[step];
        if (!button) return;

        button.classList.remove('hidden');
        
        if (!prefersReducedMotion) {
            button.classList.add('slide-in');
            setTimeout(() => {
                button.classList.remove('slide-in');
            }, 600);
        }

        // Focus the button for keyboard users
        setTimeout(() => {
            button.focus();
        }, prefersReducedMotion ? 50 : 300);
    }

    // Show date options
    function showDateOptions() {
        if (!elements.dateOptions) return;

        elements.dateOptions.classList.remove('hidden');
        
        if (!prefersReducedMotion) {
            elements.dateOptions.classList.add('slide-in');
            setTimeout(() => {
                elements.dateOptions.classList.remove('slide-in');
            }, 600);
        }

        // Update live region
        if (elements.liveRegion) {
            elements.liveRegion.textContent = 'Movie options are now available. Pick tonight\'s movie.';
        }
    }

    // Trigger confetti animation
    function triggerConfetti() {
        if (!elements.confettiContainer || prefersReducedMotion) return;

        for (let i = 0; i < CONFETTI_COUNT; i++) {
            setTimeout(() => {
                createConfettiHeart();
            }, i * 100);
        }
    }

    // Create a single confetti heart
    function createConfettiHeart() {
        const heart = document.createElement('div');
        heart.className = 'confetti-heart';
        
        // Create heart image
        const img = document.createElement('img');
        img.src = document.querySelector('.floating-hearts .heart img').src;
        img.alt = '';
        img.setAttribute('role', 'presentation');
        heart.appendChild(img);

        // Random positioning and color
        const startX = Math.random() * window.innerWidth;
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        
        heart.style.left = startX + 'px';
        heart.style.color = color;
        img.style.filter = `drop-shadow(0 2px 4px ${color}40)`;

        // Add to container
        elements.confettiContainer.appendChild(heart);

        // Remove after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 3000);
    }

    // Update UI based on current state
    function updateUI() {
        // Show all revealed messages
        for (let i = 1; i < currentStep; i++) {
            const message = elements.messages[i];
            if (message) {
                message.classList.remove('hidden');
            }
        }

        // Hide all buttons except current
        Object.entries(elements.buttons).forEach(([step, button]) => {
            if (button) {
                const stepNum = parseInt(step);
                if (stepNum === currentStep && currentStep <= 4) {
                    button.classList.remove('hidden');
                    button.focus();
                } else {
                    button.classList.add('hidden');
                }
            }
        });

        // Show date options if we've completed all steps
        if (currentStep > 4 && elements.dateOptions) {
            elements.dateOptions.classList.remove('hidden');
        }
    }

    // Handle keyboard navigation
    function handleKeyboardNavigation(e) {
        // Reset functionality with 'r' key
        if (e.key === 'r' || e.key === 'R') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                resetProgress();
            }
        }

        // Skip to end with 's' key (for testing)
        if (e.key === 's' || e.key === 'S') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                skipToEnd();
            }
        }
    }

    // Reset progress (useful for testing)
    function resetProgress() {
        currentStep = 1;
        isAnimating = false;
        
        // Hide all messages and buttons
        Object.values(elements.messages).forEach(message => {
            if (message) message.classList.add('hidden');
        });
        
        Object.values(elements.buttons).forEach(button => {
            if (button) button.classList.add('hidden');
        });

        if (elements.dateOptions) {
            elements.dateOptions.classList.add('hidden');
        }

        // Clear live region
        if (elements.liveRegion) {
            elements.liveRegion.textContent = '';
        }

        // Clear localStorage
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Could not clear localStorage:', error);
        }

        // Update UI
        setTimeout(() => {
            updateUI();
        }, 100);
    }

    // Skip to end (for testing)
    function skipToEnd() {
        currentStep = 5;
        
        // Show all messages
        Object.values(elements.messages).forEach(message => {
            if (message) message.classList.remove('hidden');
        });
        
        // Hide all buttons
        Object.values(elements.buttons).forEach(button => {
            if (button) button.classList.add('hidden');
        });

        // Show date options
        if (elements.dateOptions) {
            elements.dateOptions.classList.remove('hidden');
        }

        saveProgress();
        triggerConfetti();
    }

    // Utility function to check if element is visible
    function isElementVisible(element) {
        return element && !element.classList.contains('hidden');
    }

    // Public API for debugging
    window.ApologyApp = {
        reset: resetProgress,
        skipToEnd: skipToEnd,
        getCurrentStep: () => currentStep,
        triggerConfetti: triggerConfetti
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); 