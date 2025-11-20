/**
 * Game Boy Color Emulator Core
 * Based on GameBoy-Online by Grant Galitz
 * Loads essential emulator files and provides initialization
 */

(function() {
    'use strict';

    // Local paths for GameBoy-Online emulator
    const scripts = [
        'js/other/base64.js',
        'js/other/resampler.js',
        'js/other/XAudioServer.js',
        'js/GameBoyCore.js',
        'js/GameBoyIO.js'
    ];

    let scriptsLoaded = 0;
    const totalScripts = scripts.length;

    console.log('Loading Game Boy emulator...');

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = false; // Maintain order
            script.onload = () => {
                scriptsLoaded++;
                console.log(`✓ Loaded: ${url.split('/').pop()} (${scriptsLoaded}/${totalScripts})`);
                resolve();
            };
            script.onerror = () => {
                console.error(`✗ Failed to load: ${url}`);
                reject(new Error(`Failed to load ${url}`));
            };
            document.head.appendChild(script);
        });
    }

    // Load all required scripts sequentially
    async function loadEmulatorScripts() {
        try {
            for (const script of scripts) {
                await loadScript(script);
            }

            console.log('✓ All emulator scripts loaded successfully!');

            // Notify that emulator is ready
            const event = new CustomEvent('emulatorReady', {
                detail: {
                    type: 'gameboy-online',
                    ready: true
                }
            });
            window.dispatchEvent(event);

        } catch (error) {
            console.error('Error loading emulator scripts:', error);

            // Notify of error
            const event = new CustomEvent('emulatorError', {
                detail: {
                    error: error.message
                }
            });
            window.dispatchEvent(event);
        }
    }

    // Initialize minimal settings required by GameBoy-Online
    window.settings = window.settings || [
        true,  // [0] Enable sound
        1,     // [1] Volume (0-1)
        true,  // [2] Enable colorization for GB games
        true,  // [3] Enable original Game Boy boot ROM
        true,  // [4] Enable Game Boy Color boot ROM
        true,  // [5] Enable smooth scaling
        8,     // [6] Interval (ms)
        15,    // [7] Audio accuracy
        50,    // [8] Volume (0-100)
        1,     // [9] Speed
        true,  // [10] Resize smoothing
        true,  // [11] Channel 1
        true,  // [12] Channel 2
        true,  // [13] Channel 3
        true   // [14] Channel 4
    ];

    // Stub functions required by GameBoy-Online but not needed for our UI
    window.cout = function(message, level) {
        // Console output stub
        const levels = ['INFO', 'WARN', 'ERROR'];
        const levelName = levels[level] || 'INFO';
        console.log(`[GameBoy ${levelName}] ${message}`);
    };

    window.autoSave = function() {
        // Auto-save function stub
        if (window.gameboy && typeof window.gameboy.saveState === 'function') {
            try {
                const state = window.gameboy.saveState();
                const saveName = 'FREEZE_' + (window.gameboy.name || 'unknown');
                localStorage.setItem(saveName, JSON.stringify(state));
                console.log('Game state saved:', saveName);
            } catch (e) {
                console.error('Failed to auto-save:', e);
            }
        }
    };

    window.openSRAM = function(filename) {
        // Load SRAM (battery save) from localStorage
        try {
            const sramName = 'SRAM_' + filename;
            const data = localStorage.getItem(sramName);
            if (data) {
                console.log('Loaded SRAM:', filename);
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load SRAM:', e);
        }
        return null;
    };

    window.openRTC = function(filename) {
        // Load RTC (real-time clock) data from localStorage
        try {
            const rtcName = 'RTC_' + filename;
            const data = localStorage.getItem(rtcName);
            if (data) {
                console.log('Loaded RTC:', filename);
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load RTC:', e);
        }
        return null;
    };

    window.saveSRAM = function(filename, data) {
        // Save SRAM to localStorage
        try {
            const sramName = 'SRAM_' + filename;
            localStorage.setItem(sramName, JSON.stringify(data));
            console.log('Saved SRAM:', filename);
        } catch (e) {
            console.error('Failed to save SRAM:', e);
        }
    };

    window.saveRTC = function(filename, data) {
        // Save RTC to localStorage
        try {
            const rtcName = 'RTC_' + filename;
            localStorage.setItem(rtcName, JSON.stringify(data));
            console.log('Saved RTC:', filename);
        } catch (e) {
            console.error('Failed to save RTC:', e);
        }
    };

    // Additional helper functions
    window.GameBoyEmulatorInitialized = function() {
        return window.gameboy != null;
    };

    window.GameBoyEmulatorPlaying = function() {
        return window.gameboy != null && window.gbRunInterval != null;
    };

    // Resize function stub (not needed for our implementation)
    window.initNewCanvas = function() {
        console.log('Canvas initialized');
    };

    window.initNewCanvasSize = function() {
        console.log('Canvas size updated');
    };

    // Start loading scripts immediately
    loadEmulatorScripts();

})();
