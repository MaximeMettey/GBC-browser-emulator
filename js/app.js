/**
 * Game Boy Color Emulator Application Logic
 * Handles UI, ROM loading, save states, and controls
 */

(function() {
    'use strict';

    // Application state
    const app = {
        emulatorReady: false,
        canvas: null,
        currentROM: null,
        settings: {
            volume: 50
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Listen for emulator ready event
    window.addEventListener('emulatorReady', onEmulatorReady);
    window.addEventListener('emulatorError', onEmulatorError);

    function init() {
        console.log('Initializing GBC Emulator App...');

        // Get canvas element
        app.canvas = document.getElementById('emulator-canvas');

        // Initialize UI
        initializeUI();
        initializeControls();
        initializeSettings();

        // Load saved settings
        loadSettings();

        // Show loading message
        showCanvasMessage('Loading emulator...');
    }

    function onEmulatorReady(event) {
        console.log('✓ Emulator ready:', event.detail);
        app.emulatorReady = true;

        // Show ready message
        showCanvasMessage('Ready! Load a ROM to start');
        showNotification('Emulator loaded successfully!');
    }

    function onEmulatorError(event) {
        console.error('✗ Emulator error:', event.detail);
        showCanvasMessage('Error loading emulator\nPlease refresh the page');
        showNotification('Failed to load emulator: ' + event.detail.error, 'error');
    }

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

            // Update emulator volume
            if (window.settings) {
                window.settings[8] = parseInt(volume);
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
            if (!app.emulatorReady) {
                showNotification('Emulator not ready yet. Please wait...', 'error');
                return;
            }
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

    // Keyboard mapping for GameBoy-Online
    const keyMap = {
        'ArrowUp': 38,
        'ArrowDown': 40,
        'ArrowLeft': 37,
        'ArrowRight': 39,
        'KeyZ': 90,      // A
        'KeyX': 88,      // B
        'Enter': 13,     // Start
        'Shift': 16      // Select
    };

    function handleKeyDown(e) {
        const keyCode = keyMap[e.code];
        if (keyCode && typeof GameBoyKeyDown === 'function') {
            e.preventDefault();
            GameBoyKeyDown({ keyCode });

            // Visual feedback
            const buttonMap = {
                38: 'up', 40: 'down', 37: 'left', 39: 'right',
                90: 'a', 88: 'b', 13: 'start', 16: 'select'
            };
            const button = buttonMap[keyCode];
            if (button) {
                visualButtonPress(button);
            }
        }
    }

    function handleKeyUp(e) {
        const keyCode = keyMap[e.code];
        if (keyCode && typeof GameBoyKeyUp === 'function') {
            e.preventDefault();
            GameBoyKeyUp({ keyCode });

            // Remove visual feedback
            const buttonMap = {
                38: 'up', 40: 'down', 37: 'left', 39: 'right',
                90: 'a', 88: 'b', 13: 'start', 16: 'select'
            };
            const button = buttonMap[keyCode];
            if (button) {
                visualButtonRelease(button);
            }
        }
    }

    function pressButton(button) {
        visualButtonPress(button);

        // Send to emulator
        const keyCodeMap = {
            'up': 38, 'down': 40, 'left': 37, 'right': 39,
            'a': 90, 'b': 88, 'start': 13, 'select': 16
        };

        const keyCode = keyCodeMap[button];
        if (keyCode && typeof GameBoyKeyDown === 'function') {
            GameBoyKeyDown({ keyCode });
        }
    }

    function releaseButton(button) {
        visualButtonRelease(button);

        // Send to emulator
        const keyCodeMap = {
            'up': 38, 'down': 40, 'left': 37, 'right': 39,
            'a': 90, 'b': 88, 'start': 13, 'select': 16
        };

        const keyCode = keyCodeMap[button];
        if (keyCode && typeof GameBoyKeyUp === 'function') {
            GameBoyKeyUp({ keyCode });
        }
    }

    function visualButtonPress(button) {
        const btn = document.querySelector(`[data-key="${button}"]`);
        if (btn) {
            btn.style.transform = btn.classList.contains('special-btn')
                ? 'rotate(-20deg) translateY(2px)'
                : 'translateY(3px)';
        }
    }

    function visualButtonRelease(button) {
        const btn = document.querySelector(`[data-key="${button}"]`);
        if (btn) {
            btn.style.transform = btn.classList.contains('special-btn')
                ? 'rotate(-20deg)'
                : '';
        }
    }

    function handleROMLoad(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!app.emulatorReady) {
            showNotification('Emulator not ready yet. Please wait...', 'error');
            return;
        }

        const romStatus = document.getElementById('rom-status');
        romStatus.textContent = 'Loading ROM...';

        const reader = new FileReader();
        reader.onload = function(event) {
            const romData = event.target.result;
            app.currentROM = romData;

            console.log('ROM loaded:', file.name, romData.byteLength, 'bytes');

            try {
                // Initialize emulator with ROM using GameBoy-Online's start() function
                if (typeof start === 'function') {
                    // Clear any previous emulation (safely)
                    try {
                        if (typeof clearLastEmulation === 'function') {
                            clearLastEmulation();
                        } else if (window.gameboy) {
                            // Manual cleanup if clearLastEmulation isn't available
                            if (window.gbRunInterval) {
                                clearInterval(window.gbRunInterval);
                            }
                            if (window.gameboy.stopEmulator !== undefined) {
                                window.gameboy.stopEmulator |= 2;
                            }
                        }
                    } catch (clearError) {
                        console.warn('Could not clear previous emulation:', clearError);
                        // Continue anyway
                    }

                    // Start emulation
                    start(app.canvas, romData);

                    // Update UI
                    romStatus.textContent = `Loaded: ${file.name}`;
                    showNotification('ROM loaded! Game starting...');
                    showCanvasMessage(''); // Clear message

                } else {
                    throw new Error('Emulator start() function not available');
                }
            } catch (error) {
                console.error('Error starting ROM:', error);
                romStatus.textContent = 'Error loading ROM';
                showNotification('Failed to load ROM: ' + error.message, 'error');
            }
        };

        reader.onerror = function() {
            romStatus.textContent = 'Error reading file';
            showNotification('Failed to read ROM file', 'error');
        };

        reader.readAsArrayBuffer(file);
    }

    function saveState() {
        if (!window.gameboy) {
            showNotification('No game running', 'error');
            return;
        }

        try {
            // Use GameBoy-Online's autoSave function
            if (typeof autoSave === 'function') {
                autoSave();
                showNotification('State saved to browser');
            } else {
                throw new Error('Save function not available');
            }
        } catch (error) {
            console.error('Error saving state:', error);
            showNotification('Failed to save state: ' + error.message, 'error');
        }
    }

    function loadState() {
        try {
            // GameBoy-Online automatically loads saves on start
            // So we just need to reload the ROM if one is loaded
            if (app.currentROM && typeof start === 'function') {
                start(app.canvas, app.currentROM);
                showNotification('State loaded from browser');
            } else {
                showNotification('No ROM loaded', 'error');
            }
        } catch (error) {
            console.error('Error loading state:', error);
            showNotification('Failed to load state: ' + error.message, 'error');
        }
    }

    function downloadState() {
        // Get save data from localStorage
        const saveName = 'FREEZE_' + window.gameboy?.name || 'unknown';
        const saveData = localStorage.getItem(saveName);

        if (!saveData) {
            showNotification('No saved state to download', 'error');
            return;
        }

        try {
            const blob = new Blob([saveData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gbc_savestate_${Date.now()}.sav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('State file downloaded');
        } catch (error) {
            console.error('Error downloading state:', error);
            showNotification('Failed to download state', 'error');
        }
    }

    function uploadState(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const stateData = event.target.result;

            try {
                // Save to localStorage
                const saveName = 'FREEZE_' + (window.gameboy?.name || 'unknown');
                localStorage.setItem(saveName, stateData);

                showNotification('State uploaded. Reload ROM to use it.');
            } catch (error) {
                console.error('Error uploading state:', error);
                showNotification('Failed to upload state', 'error');
            }
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

                // Apply to emulator settings
                if (window.settings) {
                    window.settings[8] = parseInt(app.settings.volume);
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }

    function showCanvasMessage(message) {
        const ctx = app.canvas.getContext('2d');
        ctx.fillStyle = '#9bbc0f';
        ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);

        if (message) {
            ctx.fillStyle = '#0f380f';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const lines = message.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, app.canvas.width / 2, app.canvas.height / 2 + (i - lines.length / 2 + 0.5) * 15);
            });
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
            max-width: 80%;
            text-align: center;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
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
