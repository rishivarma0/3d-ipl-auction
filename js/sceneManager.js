class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.auctionRoom = null;
        this.playerModels = [];
        this.effectObjects = [];
    }

    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.createAuctionRoom();
        this.loadPlayerModels();

        // Start animation loop
        this.animate();

        return this;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 15, 20);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Stadium lights
        const positions = [
            [10, 15, 10], [-10, 15, 10],
            [10, 15, -10], [-10, 15, -10]
        ];
        
        positions.forEach(pos => {
            const spotLight = new THREE.SpotLight(0xffffff, 0.8);
            spotLight.position.set(pos[0], pos[1], pos[2]);
            spotLight.angle = Math.PI / 6;
            spotLight.penumbra = 0.2;
            spotLight.decay = 2;
            spotLight.distance = 50;
            spotLight.castShadow = true;
            this.scene.add(spotLight);
        });
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    createAuctionRoom() {
        // Auction stage
        const stageGeometry = new THREE.BoxGeometry(20, 1, 10);
        const stageMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2c3e50,
            roughness: 0.7,
            metalness: 0.3
        });
        this.stage = new THREE.Mesh(stageGeometry, stageMaterial);
        this.stage.position.set(0, -0.5, -8);
        this.stage.receiveShadow = true;
        this.scene.add(this.stage);

        // Team podiums
        this.createTeamPodiums();
        
        // Auction table
        this.createAuctionTable();
        
        // Audience seating (simplified)
        this.createAudience();
    }

    createTeamPodiums() {
        const teams = [
            { name: 'MI', color: 0x004BA0, position: [-12, 0, 5] },
            { name: 'CSK', color: 0xFFF200, position: [-4, 0, 5] },
            { name: 'RCB', color: 0xEC1C24, position: [4, 0, 5] },
            { name: 'KKR', color: 0x2E0854, position: [12, 0, 5] }
        ];

        teams.forEach(team => {
            // Podium
            const podiumGeometry = new THREE.CylinderGeometry(1.5, 2, 3, 8);
            const podiumMaterial = new THREE.MeshStandardMaterial({ 
                color: team.color,
                roughness: 0.5
            });
            const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
            podium.position.set(team.position[0], 1.5, team.position[2]);
            podium.castShadow = true;
            this.scene.add(podium);

            // Team flag
            const flagGeometry = new THREE.PlaneGeometry(2, 3);
            const flagMaterial = new THREE.MeshBasicMaterial({ 
                color: team.color,
                side: THREE.DoubleSide
            });
            const flag = new THREE.Mesh(flagGeometry, flagMaterial);
            flag.position.set(team.position[0], 4, team.position[2] - 1);
            flag.rotation.y = Math.PI / 2;
            this.scene.add(flag);
        });
    }

    createAuctionTable() {
        const tableGeometry = new THREE.BoxGeometry(8, 2, 4);
        const tableMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.8
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(0, 1, -8);
        table.castShadow = true;
        table.receiveShadow = true;
        this.scene.add(table);

        // Auction hammer
        const hammerGroup = new THREE.Group();
        
        const hammerHeadGeometry = new THREE.BoxGeometry(0.5, 0.5, 2);
        const hammerHeadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const hammerHead = new THREE.Mesh(hammerHeadGeometry, hammerHeadMaterial);
        hammerHead.position.set(0, 0.25, 0);
        hammerGroup.add(hammerHead);
        
        const hammerHandleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
        const hammerHandleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const hammerHandle = new THREE.Mesh(hammerHandleGeometry, hammerHandleMaterial);
        hammerHandle.position.set(0, -0.75, 0);
        hammerGroup.add(hammerHandle);
        
        hammerGroup.position.set(0, 2.5, -8);
        hammerGroup.rotation.z = Math.PI / 4;
        this.scene.add(hammerGroup);
        this.auctionHammer = hammerGroup;
    }

    createAudience() {
        // Simple audience representation
        for (let i = 0; i < 50; i++) {
            const personGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
            const personMaterial = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0xffffff 
            });
            const person = new THREE.Mesh(personGeometry, personMaterial);
            
            // Distribute around the stage
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 10;
            person.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            
            this.scene.add(person);
        }
    }

    async loadPlayerModels() {
        // This would typically load 3D models, but for now create placeholders
        this.playerModels = this.createPlayerPlaceholders();
    }

    createPlayerPlaceholders() {
        const models = [];
        
        // Create different colored figures for different roles
        const roles = {
            'Batsman': 0xff0000,
            'Bowler': 0x0000ff,
            'All-rounder': 0x00ff00,
            'Wicketkeeper': 0xffff00
        };
        
        Object.entries(roles).forEach(([role, color], index) => {
            const group = new THREE.Group();
            
            // Body
            const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1;
            group.add(body);
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.4);
            const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.2;
            group.add(head);
            
            group.castShadow = true;
            models.push({ role, model: group });
        });
        
        return models;
    }

    showPlayerOnStage(playerInfo) {
        // Clear previous player
        if (this.currentPlayerModel) {
            this.scene.remove(this.currentPlayerModel);
        }
        
        // Find appropriate model
        const modelData = this.playerModels.find(m => m.role === playerInfo.role) || this.playerModels[0];
        this.currentPlayerModel = modelData.model.clone();
        
        // Position on stage
        this.currentPlayerModel.position.set(0, 0, -8);
        this.currentPlayerModel.scale.set(1.5, 1.5, 1.5);
        
        this.scene.add(this.currentPlayerModel);
        
        // Add floating animation
        this.animatePlayer();
    }

    animatePlayer() {
        if (!this.currentPlayerModel) return;
        
        // Simple floating animation
        this.currentPlayerModel.userData.floatSpeed = 0.02;
        this.currentPlayerModel.userData.floatHeight = 0.2;
        this.currentPlayerModel.userData.originalY = this.currentPlayerModel.position.y;
    }

    createBidEffect(teamColor, position) {
        // Create particle effect for bid
        const particleCount = 20;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1);
            const material = new THREE.MeshBasicMaterial({ color: teamColor });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.set(
                position.x + (Math.random() - 0.5) * 2,
                position.y + Math.random() * 3,
                position.z + (Math.random() - 0.5) * 2
            );
            
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.1 + 0.05,
                (Math.random() - 0.5) * 0.1
            );
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        this.effectObjects.push({
            object: particles,
            life: 60 // frames
        });
    }

    createSoldEffect() {
        // Create celebration effect
        const fireworkCount = 5;
        
        for (let i = 0; i < fireworkCount; i++) {
            setTimeout(() => {
                this.createFirework(
                    (Math.random() - 0.5) * 10,
                    5 + Math.random() * 5,
                    -8 + (Math.random() - 0.5) * 5
                );
            }, i * 200);
        }
        
        // Hammer animation
        if (this.auctionHammer) {
            const originalRotation = this.auctionHammer.rotation.z;
            this.auctionHammer.rotation.z = 0;
            
            setTimeout(() => {
                this.auctionHammer.rotation.z = originalRotation;
            }, 500);
        }
    }

    createFirework(x, y, z) {
        const particleCount = 30;
        const particles = new THREE.Group();
        const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.15);
            const material = new THREE.MeshBasicMaterial({ color });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.set(x, y, z);
            
            const angle = Math.random() * Math.PI * 2;
            const power = Math.random() * 0.5 + 0.5;
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * power,
                Math.sin(Math.random() * Math.PI) * power,
                Math.sin(angle) * power
            );
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        this.effectObjects.push({
            object: particles,
            life: 90 // frames
        });
    }

    handleAuctionEvent(event) {
        console.log('3D Event:', event);
        
        switch (event.event) {
            case 'playerSold':
                this.createSoldEffect();
                break;
                
            case 'bidPlaced':
                const teamPositions = {
                    'MI': [-12, 1.5, 5],
                    'CSK': [-4, 1.5, 5],
                    'RCB': [4, 1.5, 5],
                    'KKR': [12, 1.5, 5]
                };
                const teamColors = {
                    'MI': 0x004BA0,
                    'CSK': 0xFFF200,
                    'RCB': 0xEC1C24,
                    'KKR': 0x2E0854
                };
                
                if (teamPositions[event.team]) {
                    const position = new THREE.Vector3(...teamPositions[event.team]);
                    this.createBidEffect(teamColors[event.team], position);
                }
                break;
                
            case 'auctionStart':
                if (event.playerInfo) {
                    this.showPlayerOnStage(event.playerInfo);
                }
                break;
        }
    }

    updateEffects() {
        // Update and remove old effects
        for (let i = this.effectObjects.length - 1; i >= 0; i--) {
            const effect = this.effectObjects[i];
            effect.life--;
            
            if (effect.life <= 0) {
                this.scene.remove(effect.object);
                this.effectObjects.splice(i, 1);
            } else {
                // Animate particles
                effect.object.children.forEach(particle => {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.velocity.y -= 0.01; // gravity
                    particle.material.opacity = effect.life / 60;
                });
            }
        }
        
        // Animate current player
        if (this.currentPlayerModel && this.currentPlayerModel.userData.floatSpeed) {
            const time = Date.now() * this.currentPlayerModel.userData.floatSpeed;
            this.currentPlayerModel.position.y = 
                this.currentPlayerModel.userData.originalY + 
                Math.sin(time) * this.currentPlayerModel.userData.floatHeight;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateEffects();
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
