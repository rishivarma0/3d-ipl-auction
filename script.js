// Main entry point
let sceneManager;
let auctionManager;

async function init() {
    try {
        // Initialize Scene Manager
        sceneManager = new SceneManager();
        await sceneManager.init();
        
        // Initialize Auction Manager
        auctionManager = new AuctionManager();
        
        // Connect auction events to 3D scene
        window.addEventListener('auction3DEvent', (e) => {
            sceneManager.handleAuctionEvent(e.detail);
        });
        
        // Start animation loop
        sceneManager.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            sceneManager.onWindowResize();
        });
        
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 500);
        }, 2000);
        
        // Add some interactivity
        setupInteractivity();
        
        console.log('IPL Auction 3D initialized successfully!');
        
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loading-screen').innerHTML = 
            `<div style="color: #ff0000; text-align: center;">
                <h2>Error Loading Auction Room</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()">Reload</button>
            </div>`;
    }
}

function setupInteractivity() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!auctionManager) return;
        
        if (!auctionManager.isAuctionLive) return;
        
        // Number keys for quick team bids
        switch(e.key) {
            case '1':
                auctionManager.quickBid('MI');
                break;
            case '2':
                auctionManager.quickBid('CSK');
                break;
            case '3':
                auctionManager.quickBid('RCB');
                break;
            case '4':
                auctionManager.quickBid('KKR');
                break;
            case ' ':
                e.preventDefault();
                if (auctionManager.activeTeam) {
                    auctionManager.quickBid(auctionManager.activeTeam);
                }
                break;
            case 's':
            case 'S':
                if (auctionManager.isAuctionLive) {
                    auctionManager.sellPlayer();
                }
                break;
        }
    });
    
    // Instructions tooltip
    const instructions = `
    <strong>Controls:</strong><br>
    • Click team buttons to bid<br>
    • Keyboard: 1=MI, 2=CSK, 3=RCB, 4=KKR<br>
    • Space = Quick rebid<br>
    • S = Sell current player<br>
    • Start Auction = Begin/Next player
    `;
    
    const controlDiv = document.createElement('div');
    controlDiv.innerHTML = instructions;
    controlDiv.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        padding: 10px;
        border-radius: 10px;
        font-size: 12px;
        max-width: 200px;
        pointer-events: none;
        opacity: 0.8;
    `;
    document.querySelector('.overlay-ui').appendChild(controlDiv);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make managers available globally for debugging
window.sceneManager = sceneManager;
window.auctionManager = auctionManager;
