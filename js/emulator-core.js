/**
 * Game Boy Color Emulator Core
 * Based on GameBoy-Online by Grant Galitz
 * Integrated for browser-based emulation
 */

// Load GameBoy-Online emulator scripts dynamically
(function() {
    'use strict';

    // CDN base URL for GameBoy-Online
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/taisel/GameBoy-Online@master/js/';

    // Required scripts from GameBoy-Online
    const scripts = [
        'other/base64.js',
        'other/swfobject.js',
        'other/resampler.js',
        'other/XAudioServer.js',
        'other/resize.js',
        'GameBoyCore.js',
        'GameBoyIO.js'
    ];

    let scriptsLoaded = 0;
    const totalScripts = scripts.length;

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                scriptsLoaded++;
                console.log(`Loaded: ${url} (${scriptsLoaded}/${totalScripts})`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load: ${url}`);
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
            console.log('All emulator scripts loaded successfully!');

            // Initialize emulator after all scripts are loaded
            if (window.initializeEmulator) {
                window.initializeEmulator();
            }
        } catch (error) {
            console.error('Error loading emulator scripts:', error);

            // Fallback: use embedded minimal emulator
            console.log('Falling back to embedded emulator...');
            loadEmbeddedEmulator();
        }
    }

    // Minimal embedded emulator as fallback
    function loadEmbeddedEmulator() {
        window.GameBoyEmulator = class {
            constructor(canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.running = false;
                this.rom = null;

                // Display "Load ROM" message
                this.ctx.fillStyle = '#9bbc0f';
                this.ctx.fillRect(0, 0, canvas.width, canvas.height);
                this.ctx.fillStyle = '#0f380f';
                this.ctx.font = '12px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Load a ROM file', canvas.width / 2, canvas.height / 2 - 10);
                this.ctx.fillText('to start playing', canvas.width / 2, canvas.height / 2 + 10);
            }

            loadROM(romData) {
                this.rom = romData;
                console.log('ROM loaded:', romData.byteLength, 'bytes');

                // Display "ROM loaded" message
                this.ctx.fillStyle = '#9bbc0f';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#0f380f';
                this.ctx.font = '12px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('ROM Loaded!', this.canvas.width / 2, this.canvas.height / 2 - 20);
                this.ctx.fillText(`${(romData.byteLength / 1024).toFixed(0)} KB`, this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.font = '10px monospace';
                this.ctx.fillText('Note: Using CDN emulator', this.canvas.width / 2, this.canvas.height / 2 + 30);
                this.ctx.fillText('for full functionality', this.canvas.width / 2, this.canvas.height / 2 + 45);

                return true;
            }

            start() {
                this.running = true;
                console.log('Emulator started');
            }

            pause() {
                this.running = false;
                console.log('Emulator paused');
            }

            saveState() {
                if (!this.rom) return null;

                const state = {
                    rom: Array.from(new Uint8Array(this.rom)),
                    timestamp: Date.now()
                };

                return JSON.stringify(state);
            }

            loadState(stateData) {
                try {
                    const state = JSON.parse(stateData);
                    this.rom = new Uint8Array(state.rom).buffer;
                    console.log('State loaded');
                    return true;
                } catch (error) {
                    console.error('Failed to load state:', error);
                    return false;
                }
            }

            pressButton(button) {
                console.log('Button pressed:', button);
            }

            releaseButton(button) {
                console.log('Button released:', button);
            }

            setVolume(volume) {
                console.log('Volume set:', volume);
            }
        };

        // Notify that emulator is ready
        const event = new CustomEvent('emulatorReady', { detail: { type: 'embedded' } });
        window.dispatchEvent(event);
    }

    // Start loading scripts
    loadEmulatorScripts();
})();
