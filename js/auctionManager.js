class AuctionManager {
    constructor() {
        this.players = [];
        this.currentPlayer = null;
        this.currentBid = 0;
        this.activeTeam = null;
        this.timer = 60;
        this.timerInterval = null;
        this.isAuctionLive = false;
        this.bidIncrement = 0.5;
        
        this.teams = {
            'MI': { 
                name: 'Mumbai Indians', 
                budget: 100, 
                players: [], 
                color: '#004BA0',
                spent: 0
            },
            'CSK': { 
                name: 'Chennai Super Kings', 
                budget: 100, 
                players: [], 
                color: '#FFF200',
                spent: 0
            },
            'RCB': { 
                name: 'Royal Challengers Bangalore', 
                budget: 100, 
                players: [], 
                color: '#EC1C24',
                spent: 0
            },
            'KKR': { 
                name: 'Kolkata Knight Riders', 
                budget: 100, 
                players: [], 
                color: '#2E0854',
                spent: 0
            }
        };
        
        this.soldPlayers = [];
        this.init();
    }

    async init() {
        await this.loadPlayers();
        this.setupEventListeners();
        this.updateUI();
    }

    async loadPlayers() {
        try {
            // Try to load from JSON file
            const response = await fetch('data/players.json');
            this.players = await response.json();
            console.log('Loaded', this.players.length, 'players');
        } catch (error) {
            console.log('Using sample players');
            this.players = this.getSamplePlayers();
        }
        
        // Shuffle players
        this.shufflePlayers();
    }

    getSamplePlayers() {
        return [
            {
                id: 1,
                name: "Virat Kohli",
                role: "Batsman",
                speciality: "Chase Master",
                basePrice: 20,
                team: "India",
                stats: { runs: 7263, avg: 37.25, sr: 130.02 }
            },
            {
                id: 2,
                name: "MS Dhoni",
                role: "Wicketkeeper",
                speciality: "Finisher",
                basePrice: 15,
                team: "India",
                stats: { runs: 5082, avg: 38.79, sr: 135.92 }
            },
            {
                id: 3,
                name: "Jasprit Bumrah",
                role: "Bowler",
                speciality: "Yorker Specialist",
                basePrice: 18,
                team: "India",
                stats: { wickets: 145, econ: 7.41 }
            },
            {
                id: 4,
                name: "Rohit Sharma",
                role: "Batsman",
                speciality: "Hitman",
                basePrice: 16,
                team: "India",
                stats: { runs: 5879, avg: 30.30, sr: 129.89 }
            },
            {
                id: 5,
                name: "Glenn Maxwell",
                role: "All-rounder",
                speciality: "Big Hitting",
                basePrice: 14,
                team: "Australia",
                stats: { runs: 2719, wickets: 33, sr: 157.62 }
            },
            {
                id: 6,
                name: "AB de Villiers",
                role: "Batsman",
                speciality: "360 Degree",
                basePrice: 16,
                team: "South Africa",
                stats: { runs: 5162, avg: 39.71, sr: 151.69 }
            },
            {
                id: 7,
                name: "Rashid Khan",
                role: "Bowler",
                speciality: "Mystery Spinner",
                basePrice: 12,
                team: "Afghanistan",
                stats: { wickets: 112, econ: 6.24 }
            },
            {
                id: 8,
                name: "Hardik Pandya",
                role: "All-rounder",
                speciality: "Power Hitter",
                basePrice: 13,
                team: "India",
                stats: { runs: 1968, wickets: 52, sr: 153.91 }
            },
            {
                id: 9,
                name: "KL Rahul",
                role: "Wicketkeeper",
                speciality: "Anchor",
                basePrice: 17,
                team: "India",
                stats: { runs: 4163, avg: 46.75, sr: 134.42 }
            },
            {
                id: 10,
                name: "David Warner",
                role: "Batsman",
                speciality: "Aggressive Opener",
                basePrice: 14,
                team: "Australia",
                stats: { runs: 5881, avg: 41.59, sr: 140.69 }
            }
        ];
    }

    shufflePlayers() {
        for (let i = this.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
        }
    }

    startAuction() {
        if (this.players.length === 0) {
            alert('No players left to auction!');
            return;
        }
        
        if (this.isAuctionLive) {
            alert('Auction already in progress!');
            return;
        }
        
        this.isAuctionLive = true;
        this.currentPlayer = this.players.shift();
        this.currentBid = this.currentPlayer.basePrice;
        this.activeTeam = null;
        this.timer = 60;
        
        this.updateUI();
        this.startTimer();
        
        // Trigger 3D event
        this.trigger3DEvent('auctionStart', {
            playerInfo: this.currentPlayer
        });
        
        // Update button text
        document.getElementById('start-auction').textContent = 'Next Player';
        document.getElementById('start-auction').disabled = true;
        
        console.log('Auction started for:', this.currentPlayer.name);
    }

    placeBid(teamName, bidAmount) {
        if (!this.isAuctionLive) {
            alert('Auction not started!');
            return;
        }
        
        if (bidAmount <= this.currentBid) {
            alert(`Bid must be higher than current bid (₹${this.currentBid} Cr)`);
            return;
        }
        
        if (this.teams[teamName].budget < bidAmount) {
            alert(`${this.teams[teamName].name} doesn't have enough budget!`);
            return;
        }
        
        // Update bid
        this.currentBid = bidAmount;
        this.activeTeam = teamName;
        
        // Reset timer to 10 seconds for new bid
        this.timer = Math.max(this.timer, 10);
        
        // Update UI
        this.updateUI();
        
        // Trigger 3D event
        this.trigger3DEvent('bidPlaced', {
            team: teamName,
            amount: bidAmount,
            player: this.currentPlayer.name
        });
        
        console.log(`${teamName} bid ₹${bidAmount} Cr for ${this.currentPlayer.name}`);
    }

    quickBid(teamName) {
        const bidAmount = this.currentBid + this.bidIncrement;
        this.placeBid(teamName, bidAmount);
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            document.getElementById('timer').textContent = this.timer;
            
            // Visual warning for last 10 seconds
            if (this.timer <= 10) {
                document.getElementById('timer').classList.add('warning');
            }
            
            if (this.timer <= 0) {
                this.sellPlayer();
            }
        }, 1000);
    }

    sellPlayer() {
        clearInterval(this.timerInterval);
        
        if (this.activeTeam) {
            // Player sold successfully
            const playerData = {
                ...this.currentPlayer,
                soldPrice: this.currentBid,
                soldTo: this.activeTeam,
                timestamp: new Date().toLocaleTimeString()
            };
            
            // Update team data
            this.teams[this.activeTeam].players.push(playerData);
            this.teams[this.activeTeam].budget -= this.currentBid;
            this.teams[this.activeTeam].spent += this.currentBid;
            
            // Add to sold players list
            this.soldPlayers.unshift(playerData);
            
            // Trigger 3D event
            this.trigger3DEvent('playerSold', {
                player: this.currentPlayer.name,
                team: this.activeTeam,
                price: this.currentBid
            });
            
            console.log(`${this.currentPlayer.name} sold to ${this.activeTeam} for ₹${this.currentBid} Cr`);
        } else {
            // Player unsold
            this.trigger3DEvent('playerUnsold', {
                player: this.currentPlayer.name
            });
            
            console.log(`${this.currentPlayer.name} unsold`);
        }
        
        // Update UI
        this.updateUI();
        
        // Delay before next player
        setTimeout(() => {
            this.resetAuction();
            document.getElementById('start-auction').disabled = false;
        }, 3000);
    }

    resetAuction() {
        this.currentPlayer = null;
        this.currentBid = 0;
        this.activeTeam = null;
        this.timer = 60;
        this.isAuctionLive = false;
        
        // Reset timer display
        document.getElementById('timer').textContent = this.timer;
        document.getElementById('timer').classList.remove('warning');
        
        // Update UI
        this.updateUI();
        
        // If no players left, end auction
        if (this.players.length === 0) {
            this.endAuction();
        }
    }

    endAuction() {
        alert('Auction Completed! Check console for results.');
        console.log('Auction Results:', this.teams);
        console.log('Sold Players:', this.soldPlayers);
        
        // Disable auction button
        document.getElementById('start-auction').disabled = true;
        document.getElementById('start-auction').textContent = 'Auction Ended';
    }

    updateUI() {
        // Update player display
        const playerDisplay = document.getElementById('player-display');
        const playerName = document.getElementById('player-name');
        const playerInfo = document.getElementById('player-info');
        
        if (this.currentPlayer) {
            playerName.textContent = this.currentPlayer.name;
            playerInfo.innerHTML = `
                <p><strong>Role:</strong> ${this.currentPlayer.role}</p>
                <p><strong>Speciality:</strong> ${this.currentPlayer.speciality}</p>
                <p><strong>Base Price:</strong> ₹${this.currentPlayer.basePrice} Cr</p>
                <p><strong>Team:</strong> ${this.currentPlayer.team}</p>
            `;
            playerDisplay.style.opacity = '1';
        } else {
            playerName.textContent = 'Waiting for auction...';
            playerInfo.innerHTML = '<p>Click "Start Auction" to begin</p>';
            playerDisplay.style.opacity = '0.7';
        }
        
        // Update bid info
        document.getElementById('current-bid').textContent = `₹${this.currentBid} Cr`;
        const activeTeamEl = document.getElementById('active-team');
        if (this.activeTeam) {
            activeTeamEl.textContent = this.teams[this.activeTeam].name;
            activeTeamEl.style.color = this.teams[this.activeTeam].color;
        } else {
            activeTeamEl.textContent = 'No bids yet';
            activeTeamEl.style.color = '#fff';
        }
        
        // Update team budgets
        Object.keys(this.teams).forEach(teamKey => {
            const team = this.teams[teamKey];
            document.getElementById(`${teamKey.toLowerCase()}-budget`).textContent = `₹${team.budget} Cr`;
            document.getElementById(`${teamKey.toLowerCase()}-count`).textContent = team.players.length;
        });
        
        // Update auction stats
        document.getElementById('players-left').textContent = this.players.length;
        document.getElementById('total-sold').textContent = this.soldPlayers.length;
        
        // Update sold players list
        this.updateSoldList();
    }

    updateSoldList() {
        const soldList = document.getElementById('sold-list');
        soldList.innerHTML = '';
        
        // Show last 5 sold players
        const recentSold = this.soldPlayers.slice(0, 5);
        
        recentSold.forEach(player => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${player.name}</strong> - 
                ${player.role} → 
                <span style="color: ${this.teams[player.soldTo].color}">
                    ${player.soldTo}
                </span> 
                (₹${player.soldPrice} Cr)
            `;
            soldList.appendChild(li);
        });
    }

    trigger3DEvent(event, data = {}) {
        window.dispatchEvent(new CustomEvent('auction3DEvent', {
            detail: { event, ...data }
        }));
    }

    setupEventListeners() {
        // Team bid buttons
        document.querySelectorAll('.team-bid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isAuctionLive) return;
                const team = e.target.dataset.team;
                this.quickBid(team);
            });
        });

        // Custom bid button
        document.getElementById('custom-bid-btn').addEventListener('click', () => {
            if (!this.isAuctionLive || !this.activeTeam) {
                alert('Place a bid first to use custom bid!');
                return;
            }
            
            const bidInput = document.getElementById('custom-bid');
            const bidAmount = parseFloat(bidInput.value);
            
            if (isNaN(bidAmount) || bidAmount <= 0) {
                alert('Please enter a valid bid amount');
                return;
            }
            
            this.placeBid(this.activeTeam, bidAmount);
            bidInput.value = '';
        });

        // Start auction button
        document.getElementById('start-auction').addEventListener('click', () => {
            this.startAuction();
        });

        // Enter key for custom bid
        document.getElementById('custom-bid').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('custom-bid-btn').click();
            }
        });
    }
}

// Initialize when loaded
let auctionManager;

window.addEventListener('DOMContentLoaded', () => {
    auctionManager = new AuctionManager();
});
