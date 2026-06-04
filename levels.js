const LEVELS = [
    {
        name: "Stereo Jump",
        speed: 6.0,
        groundColor: "#1b163a",
        skyColor: "#0b0b16",
        accentColor: "#00ffcc",
        obstacles: [
            // Base jump tutorials
            { type: 'spike', x: 500, y: 0, w: 40, h: 40 },
            { type: 'spike', x: 800, y: 0, w: 40, h: 40 },
            
            // Steps & Blocks
            { type: 'block', x: 1100, y: 0, w: 60, h: 40 },
            { type: 'spike', x: 1110, y: 40, w: 40, h: 40 }, // Spike on top of block
            
            // Double spike jump
            { type: 'spike', x: 1500, y: 0, w: 35, h: 40 },
            { type: 'spike', x: 1535, y: 0, w: 35, h: 40 },
            
            // Block bridge
            { type: 'block', x: 1900, y: 0, w: 40, h: 40 },
            { type: 'block', x: 1940, y: 0, w: 40, h: 80 },
            { type: 'block', x: 1980, y: 0, w: 80, h: 120 },
            { type: 'spike', x: 2150, y: 0, w: 40, h: 40 },
            
            // Jump Pad (yellow ring on ground)
            { type: 'pad', x: 2400, y: 0, w: 40, h: 15 },
            { type: 'spike', x: 2500, y: 0, w: 40, h: 40 },
            { type: 'spike', x: 2540, y: 0, w: 40, h: 40 },

            // Floating platforms
            { type: 'block', x: 2800, y: 100, w: 120, h: 30 },
            { type: 'spike', x: 2840, y: 130, w: 40, h: 40 },
            { type: 'spike', x: 3050, y: 0, w: 40, h: 40 },

            // Jump Orbs (requires user interaction in midair)
            { type: 'orb', x: 3300, y: 120, w: 35, h: 35 },
            { type: 'spike', x: 3400, y: 0, w: 50, h: 40 },

            // Final run
            { type: 'block', x: 3700, y: 0, w: 40, h: 40 },
            { type: 'block', x: 3780, y: 0, w: 40, h: 80 },
            { type: 'block', x: 3860, y: 0, w: 40, h: 120 },
            { type: 'spike', x: 4000, y: 0, w: 40, h: 40 },
            { type: 'spike', x: 4100, y: 0, w: 40, h: 40 },
            { type: 'spike', x: 4200, y: 0, w: 40, h: 40 }
        ]
    },
    {
        name: "Neo Flight",
        speed: 6.5,
        groundColor: "#22112e",
        skyColor: "#09040f",
        accentColor: "#ff007f",
        obstacles: [
            // Intro jump
            { type: 'spike', x: 500, y: 0, w: 40, h: 40 },
            
            // Ship Mode Portal (changes player to rocket mode)
            { type: 'portal', x: 800, y: 100, w: 40, h: 100, mode: 'ship' },
            
            // Flight obstacles (caves and pillars)
            { type: 'block', x: 1200, y: 0, w: 100, h: 150 }, // Bottom pillar
            { type: 'block', x: 1200, y: 290, w: 100, h: 150 }, // Top pillar

            { type: 'block', x: 1600, y: 0, w: 120, h: 100 },
            { type: 'block', x: 1800, y: 240, w: 120, h: 200 },
            
            // Spike tunnels
            { type: 'block', x: 2100, y: 0, w: 300, h: 60 },
            { type: 'spike', x: 2150, y: 60, w: 30, h: 30 },
            { type: 'spike', x: 2250, y: 60, w: 30, h: 30 },
            { type: 'spike', x: 2350, y: 60, w: 30, h: 30 },
            { type: 'block', x: 2100, y: 380, w: 300, h: 60 },

            // Portal back to Cube
            { type: 'portal', x: 2700, y: 100, w: 40, h: 100, mode: 'cube' },
            
            // Cube jumps
            { type: 'spike', x: 3000, y: 0, w: 40, h: 40 },
            { type: 'block', x: 3200, y: 0, w: 150, h: 40 },
            { type: 'spike', x: 3250, y: 40, w: 40, h: 40 },
            
            // Final Portal back to Ship for end flight
            { type: 'portal', x: 3600, y: 100, w: 40, h: 100, mode: 'ship' },
            { type: 'block', x: 3900, y: 120, w: 200, h: 40 },
            { type: 'block', x: 4200, y: 220, w: 200, h: 40 }
        ]
    },
    {
        name: "Cyber Realm",
        speed: 7.2,
        groundColor: "#051f20",
        skyColor: "#000b0d",
        accentColor: "#ffdd00",
        obstacles: [
            // Rapid spikes and pads
            { type: 'spike', x: 500, y: 0, w: 40, h: 40 },
            { type: 'pad', x: 700, y: 0, w: 40, h: 15 },
            { type: 'block', x: 800, y: 120, w: 80, h: 40 },
            { type: 'spike', x: 950, y: 0, w: 45, h: 45 },
            
            // Speed jumps & Orbs
            { type: 'orb', x: 1200, y: 100, w: 35, h: 35 },
            { type: 'block', x: 1320, y: 120, w: 60, h: 40 },
            { type: 'orb', x: 1480, y: 200, w: 35, h: 35 },
            { type: 'block', x: 1600, y: 200, w: 60, h: 40 },
            { type: 'spike', x: 1610, y: 240, w: 40, h: 40 },
            
            // Ship Portal
            { type: 'portal', x: 1900, y: 100, w: 40, h: 100, mode: 'ship' },
            { type: 'block', x: 2200, y: 80, w: 80, h: 80 },
            { type: 'block', x: 2400, y: 260, w: 80, h: 80 },
            { type: 'block', x: 2600, y: 120, w: 150, h: 150 },
            
            // Cube Portal back
            { type: 'portal', x: 2900, y: 100, w: 40, h: 100, mode: 'cube' },
            { type: 'spike', x: 3150, y: 0, w: 40, h: 40 },
            { type: 'spike', x: 3200, y: 0, w: 40, h: 40 },
            { type: 'pad', x: 3350, y: 0, w: 40, h: 15 },
            { type: 'block', x: 3500, y: 140, w: 100, h: 40 },
            { type: 'orb', x: 3700, y: 220, w: 35, h: 35 },
            { type: 'block', x: 3850, y: 240, w: 100, h: 40 },
            { type: 'spike', x: 4100, y: 0, w: 45, h: 45 },
            { type: 'spike', x: 4200, y: 0, w: 45, h: 45 }
        ]
    }
];

window.LEVELS = LEVELS;
