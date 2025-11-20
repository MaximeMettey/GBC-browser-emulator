/**
 * Game Boy Color Emulator Application Logic
 * Handles UI, ROM loading, save states, and controls
 */

(function() {
    'use strict';

    // Application state
    const app = {
        emulator: null,
        canvas: null,
        currentROM: null,
        settings: {
            volume: 50
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Also listen for emulator ready event
    window.addEventListener('emulatorReady', onEmulatorReady);

    function init() {
        console.log('Initializing GBC Emulator...');

        // Get canvas element
        app.canvas = document.getElementById('emulator-canvas');

        // Initialize UI
        initializeUI();
        initializeControls();
        initializeSettings();

        // Load saved settings
        loadSettings();
    }

    function onEmulatorReady(event) {
        console.log('Emulator ready:', event.detail);

        // Initialize emulator instance
        if (window.GameBoyEmulator) {
            app.emulator = new window.GameBoyEmulator(app.canvas);
            console.log('Emulator instance created');
        } else if (typeof gameboy !== 'undefined') {
            // GameBoy-Online uses global 'gameboy' object
            app.emulator = window;
            console.log('Using GameBoy-Online emulator');
        } else {
            console.error('No emulator available');
        }
    }

    // Initialize emulator if scripts are already loaded
    window.initializeEmulator = function() {
        const event = new CustomEvent('emulatorReady', { detail: { type: 'cdn' } });
        window.dispatchEvent(event);
    };

    function initializeUI() {
        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('active');
        });

        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });

        // Close modal when clicking outside
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });

        // Volume control
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');

        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            volumeValue.textContent = volume + '%';
            app.settings.volume = volume;
            saveSettings();

            if (app.emulator && app.emulator.setVolume) {
                app.emulator.setVolume(volume / 100);
            }
        });

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    function initializeControls() {
        // Keyboard controls
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Touch controls for on-screen buttons
        const buttons = {
            'btn-up': 'up',
            'btn-down': 'down',
            'btn-left': 'left',
            'btn-right': 'right',
            'btn-a': 'a',
            'btn-b': 'b',
            'btn-start': 'start',
            'btn-select': 'select'
        };

        Object.keys(buttons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            const key = buttons[btnId];

            // Touch events
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                pressButton(key);
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                releaseButton(key);
            });

            // Mouse events (for desktop)
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                pressButton(key);
            });

            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                releaseButton(key);
            });

            btn.addEventListener('mouseleave', (e) => {
                releaseButton(key);
            });
        });
    }

    function initializeSettings() {
        // ROM loading
        const romInput = document.getElementById('rom-input');
        const loadRomBtn = document.getElementById('load-rom-btn');

        loadRomBtn.addEventListener('click', () => {
            romInput.click();
        });

        romInput.addEventListener('change', handleROMLoad);

        // Save state buttons
        document.getElementById('save-state-btn').addEventListener('click', saveState);
        document.getElementById('load-state-btn').addEventListener('click', loadState);
        document.getElementById('download-state-btn').addEventListener('click', downloadState);
        document.getElementById('upload-state-btn').addEventListener('click', () => {
            document.getElementById('state-input').click();
        });

        document.getElementById('state-input').addEventListener('change', uploadState);
    }

    // Keyboard mapping
    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'KeyZ': 'a',
        'KeyX': 'b',
        'Enter': 'start',
        'Shift': 'select'
    };

    function handleKeyDown(e) {
        const key = keyMap[e.code];
        if (key) {
            e.preventDefault();
            pressButton(key);
        }
    }

    function handleKeyUp(e) {
        const key = keyMap[e.code];
        if (key) {
            e.preventDefault();
            releaseButton(key);
        }
    }

    function pressButton(button) {
        // Visual feedback
        const btn = document.querySelector(`[data-key="${button}"]`);
        if (btn) {
            btn.style.transform = btn.classList.contains('special-btn')
                ? 'rotate(-20deg) translateY(2px)'
                : 'translateY(3px)';
        }

        // Send to emulator
        if (app.emulator) {
            if (app.emulator.pressButton) {
                app.emulator.pressButton(button);
            } else if (typeof GameBoyKeyDown === 'function') {
                // GameBoy-Online key mapping
                const keyCode = getGameBoyKeyCode(button);
                if (keyCode !== null) {
                    GameBoyKeyDown({ keyCode });
                }
            }
        }
    }

    function releaseButton(button) {
        // Remove visual feedback
        const btn = document.querySelector(`[data-key="${button}"]`);
        if (btn) {
            btn.style.transform = btn.classList.contains('special-btn')
                ? 'rotate(-20deg)'
                : '';
        }

        // Send to emulator
        if (app.emulator) {
            if (app.emulator.releaseButton) {
                app.emulator.releaseButton(button);
            } else if (typeof GameBoyKeyUp === 'function') {
                const keyCode = getGameBoyKeyCode(button);
                if (keyCode !== null) {
                    GameBoyKeyUp({ keyCode });
                }
            }
        }
    }

    function getGameBoyKeyCode(button) {
        const codes = {
            'up': 38,
            'down': 40,
            'left': 37,
            'right': 39,
            'a': 90,
            'b': 88,
            'start': 13,
            'select': 16
        };
        return codes[button] || null;
    }

    function handleROMLoad(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const romData = event.target.result;
            app.currentROM = romData;

            console.log('ROM loaded:', file.name, romData.byteLength, 'bytes');

            // Load ROM into emulator
            if (app.emulator) {
                if (app.emulator.loadROM) {
                    app.emulator.loadROM(romData);
                } else if (typeof autoSave === 'function') {
                    // GameBoy-Online initialization
                    if (!window.gameboy) {
                        start(app.canvas, romData);
                    }
                }

                // Start emulation
                if (app.emulator.start) {
                    app.emulator.start();
                } else if (typeof run === 'function') {
                    run();
                }

                // Show success message
                showNotification('ROM loaded successfully!');
            } else {
                showNotification('Emulator not ready. Please wait...', 'error');
            }
        };

        reader.readAsArrayBuffer(file);
    }

    function saveState() {
        if (!app.emulator) {
            showNotification('No emulator instance', 'error');
            return;
        }

        let stateData;

        if (app.emulator.saveState) {
            stateData = app.emulator.saveState();
        } else if (typeof saveState === 'function' && window.gameboy) {
            // GameBoy-Online save state
            const state = window.gameboy.saveState();
            stateData = JSON.stringify(state);
        }

        if (stateData) {
            // Save to localStorage
            localStorage.setItem('gbc_savestate', stateData);
            showNotification('State saved to browser');
        } else {
            showNotification('Failed to save state', 'error');
        }
    }

    function loadState() {
        const stateData = localStorage.getItem('gbc_savestate');

        if (!stateData) {
            showNotification('No saved state found', 'error');
            return;
        }

        if (app.emulator) {
            if (app.emulator.loadState) {
                app.emulator.loadState(stateData);
            } else if (typeof returnFromState === 'function' && window.gameboy) {
                try {
                    const state = JSON.parse(stateData);
                    window.gameboy.returnFromState(state);
                } catch (error) {
                    console.error('Failed to load state:', error);
                    showNotification('Failed to load state', 'error');
                    return;
                }
            }

            showNotification('State loaded from browser');
        }
    }

    function downloadState() {
        const stateData = localStorage.getItem('gbc_savestate');

        if (!stateData) {
            showNotification('No saved state to download', 'error');
            return;
        }

        const blob = new Blob([stateData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gbc_savestate_${Date.now()}.sav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('State file downloaded');
    }

    function uploadState(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const stateData = event.target.result;

            // Save to localStorage
            localStorage.setItem('gbc_savestate', stateData);

            // Load into emulator
            if (app.emulator) {
                if (app.emulator.loadState) {
                    app.emulator.loadState(stateData);
                } else if (typeof returnFromState === 'function' && window.gameboy) {
                    try {
                        const state = JSON.parse(stateData);
                        window.gameboy.returnFromState(state);
                    } catch (error) {
                        console.error('Failed to load state:', error);
                        showNotification('Failed to load state', 'error');
                        return;
                    }
                }
            }

            showNotification('State uploaded and loaded');
        };

        reader.readAsText(file);
    }

    function toggleFullscreen() {
        const container = document.getElementById('gbc-container');

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('Fullscreen error:', err);
                showNotification('Fullscreen not supported', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    function saveSettings() {
        localStorage.setItem('gbc_settings', JSON.stringify(app.settings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('gbc_settings');
        if (saved) {
            try {
                app.settings = JSON.parse(saved);

                // Apply settings to UI
                const volumeSlider = document.getElementById('volume-slider');
                const volumeValue = document.getElementById('volume-value');
                volumeSlider.value = app.settings.volume;
                volumeValue.textContent = app.settings.volume + '%';
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }

    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#d9534f' : '#5cb85c'};
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);

    // Expose app for debugging
    window.gbcApp = app;

})();
