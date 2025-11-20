/**
 * Game Boy Color Emulator Core
 * Based on GameBoy-Online by Grant Galitz
 * Loads essential emulator files and provides initialization
 */

(function() {
    'use strict';

    // CDN base URL for GameBoy-Online
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/taisel/GameBoy-Online@master/js/';

    // Required scripts in order
    const scripts = [
        'other/base64.js',
        'other/resampler.js',
        'other/XAudioServer.js',
        'GameBoyCore.js',
        'GameBoyIO.js'
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
                await loadScript(CDN_BASE + script);
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

    // Start loading scripts immediately
    loadEmulatorScripts();

})();
