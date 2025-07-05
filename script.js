// Enhanced Professional JavaScript with Vehicle-Specific Timing
class DivineDestinations {
    constructor() {
        this.map = null;
        this.routingControl = null;
        this.originMarker = null;
        this.destinationMarker = null;
        this.currentProfile = 'driving';
        
        // Vehicle-specific speeds (km/h) for accurate time calculation
        this.transportSpeeds = {
            driving: 45,  // Average city driving speed
            walking: 4.5, // Average walking speed
            cycling: 15   // Average cycling speed
        };
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupCustomCursor();
        this.setupImageCarousels();
        this.setupDistanceCalculator();
        this.setupMap();
        this.setupScrollAnimations();
        this.setupVideoPlayer();
        this.setupAccessibility();
        this.setupOriginalCarousels();
        this.setupNavbarScroll();
    }

    setupNavbarScroll() {
        const header = document.querySelector('.header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    setupMobileMenu() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('nav-menu');

        toggle?.addEventListener('click', () => {
            menu.classList.toggle('active');
            const isOpen = menu.classList.contains('active');
            toggle.setAttribute('aria-expanded', isOpen);
            toggle.innerHTML = isOpen ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-line"></i>';
        });

        // Close menu when clicking outside or on menu items
        document.addEventListener('click', (e) => {
            if (!toggle?.contains(e.target) && !menu?.contains(e.target)) {
                menu?.classList.remove('active');
                toggle?.setAttribute('aria-expanded', 'false');
                if (toggle) toggle.innerHTML = '<i class="ri-menu-line"></i>';
            }
        });

        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menu?.classList.remove('active');
                toggle?.setAttribute('aria-expanded', 'false');
                if (toggle) toggle.innerHTML = '<i class="ri-menu-line"></i>';
            });
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for header height
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        if (!cursor || window.innerWidth <= 768) return; // Disable on mobile

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('.attraction-card, .btn-primary, .nav-link').forEach(elem => {
            elem.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(3)';
                cursor.style.opacity = '0.3';
            });
            elem.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(0)';
                cursor.style.opacity = '1';
            });
        });
    }

    setupImageCarousels() {
        const carousels = document.querySelectorAll('.attraction-images');
        
        carousels.forEach(carousel => {
            const images = carousel.querySelectorAll('img');
            let currentIndex = 0;

            const cycleThroughImages = () => {
                images[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add('active');
            };

            // Cycle every 4 seconds
            setInterval(cycleThroughImages, 4000);
        });
    }

    setupDistanceCalculator() {
        const form = document.getElementById('distance-form');
        const manualLocations = document.getElementById('manual-locations');

        // Toggle manual location input
        document.querySelectorAll('input[name="locationOption"]').forEach(radio => {
            radio.addEventListener('change', () => {
                manualLocations.style.display = radio.value === 'manual' ? 'block' : 'none';
            });
        });

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const useAutoLocation = document.querySelector('input[name="locationOption"]:checked').value === 'auto';
            const destination = document.getElementById('destination').value;
            
            if (!destination.trim()) {
                this.showResult('Please enter a destination.', 'error');
                return;
            }

            this.showLoadingState();
            this.hideMap();

            try {
                if (useAutoLocation) {
                    await this.calculateFromCurrentLocation(destination);
                } else {
                    const origin = document.getElementById('origin').value;
                    if (!origin.trim()) {
                        this.showResult('Please enter an origin location.', 'error');
                        this.hideLoadingState();
                        return;
                    }
                    await this.calculateFromManualLocation(origin, destination);
                }
            } catch (error) {
                console.error('Route calculation error:', error);
                this.showResult('Error calculating route. Please try again.', 'error');
                this.hideMap();
                this.hideLoadingState();
            }
        });

        // Setup transport mode controls
        this.setupTransportControls();
    }

    showLoadingState() {
        const btn = document.querySelector('.btn-primary');
        const btnText = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.simple-loader');
        
        btnText.style.display = 'none';
        loader.style.display = 'inline';
        btn.disabled = true;
    }

    hideLoadingState() {
        const btn = document.querySelector('.btn-primary');
        const btnText = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.simple-loader');
        
        btnText.style.display = 'inline';
        loader.style.display = 'none';
        btn.disabled = false;
    }

    setupMap() {
        // Initialize map centered on Bodh Gaya
        this.map = L.map('map').setView([24.6958, 84.9918], 10);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add a marker for Mahabodhi Temple
        const templeMarker = L.marker([24.6958, 84.9918])
            .addTo(this.map)
            .bindPopup('<b>Mahabodhi Temple</b><br>Where Buddha attained enlightenment')
            .openPopup();

        // Custom icons for origin and destination
        this.originIcon = L.divIcon({
            html: '<div style="background: #28a745; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        this.destinationIcon = L.divIcon({
            html: '<div style="background: #dc3545; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });
    }

    setupTransportControls() {
        const controls = document.querySelectorAll('.map-control-btn[data-profile]');
        const centerBtn = document.getElementById('center-map');

        controls.forEach(btn => {
            btn.addEventListener('click', () => {
                const profile = btn.dataset.profile;
                if (profile !== this.currentProfile && this.routingControl) {
                    this.currentProfile = profile;
                    controls.forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                    this.updateRouteProfile(profile);
                }
            });
        });

        centerBtn?.addEventListener('click', () => {
            if (this.originMarker && this.destinationMarker) {
                const group = new L.featureGroup([this.originMarker, this.destinationMarker]);
                this.map.fitBounds(group.getBounds().pad(0.1));
            }
        });
    }

    async calculateFromCurrentLocation(destination) {
        if (!navigator.geolocation) {
            this.showResult('Geolocation is not supported by your browser.', 'error');
            return;
        }

        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            const destCoords = await this.geocodeAddress(destination);
            await this.showRouteOnMap(
                [latitude, longitude], 
                destCoords, 
                'Your Location', 
                destination
            );
        } catch (error) {
            this.showResult('Could not retrieve your current location. Please allow location access.', 'error');
        }
    }

    async calculateFromManualLocation(origin, destination) {
        try {
            const [originCoords, destCoords] = await Promise.all([
                this.geocodeAddress(origin),
                this.geocodeAddress(destination)
            ]);
            
            await this.showRouteOnMap(originCoords, destCoords, origin, destination);
        } catch (error) {
            this.showResult('Error finding one or both locations. Please check your addresses.', 'error');
        }
    }

    async showRouteOnMap(originCoords, destCoords, originName, destName) {
        try {
            // Clear existing markers and routes
            this.clearMap();

            // Add origin and destination markers
            this.originMarker = L.marker(originCoords, { icon: this.originIcon })
                .addTo(this.map)
                .bindPopup(`<b>Origin:</b> ${originName}`);

            this.destinationMarker = L.marker(destCoords, { icon: this.destinationIcon })
                .addTo(this.map)
                .bindPopup(`<b>Destination:</b> ${destName}`);

            // Try routing with fallback to straight line
            try {
                await this.createRoute(originCoords, destCoords, originName, destName);
            } catch (routingError) {
                console.warn('Routing service failed, showing straight line:', routingError);
                this.createStraightLineRoute(originCoords, destCoords, originName, destName);
            }

        } catch (error) {
            console.error('Map error:', error);
            this.showResult('Error displaying route on map.', 'error');
            this.hideMap();
        } finally {
            this.hideLoadingState();
        }
    }

    async createRoute(originCoords, destCoords, originName, destName) {
        // Try multiple routing services with fallbacks
        const routingServices = [
            () => this.tryOSRMRouting(originCoords, destCoords),
            () => this.tryGraphhopperRouting(originCoords, destCoords)
        ];

        for (const serviceMethod of routingServices) {
            try {
                const routeData = await serviceMethod();
                if (routeData && routeData.coordinates) {
                    this.displayRoute(routeData, originName, destName);
                    return;
                }
            } catch (error) {
                console.warn('Routing service failed:', error);
                continue;
            }
        }
        
        // If all services fail, throw error to trigger fallback
        throw new Error('All routing services failed');
    }

    async tryOSRMRouting(originCoords, destCoords) {
        const transportMode = this.currentProfile === 'cycling' ? 'bike' : 
                            this.currentProfile === 'walking' ? 'foot' : 'car';
        
        const url = `https://router.project-osrm.org/route/v1/${transportMode}/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('OSRM failed');
        
        const data = await response.json();
        if (!data.routes || data.routes.length === 0) throw new Error('No routes found');
        
        const route = data.routes[0];
        return {
            coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert to [lat, lng]
            distance: route.distance,
            duration: route.duration
        };
    }

    async tryGraphhopperRouting(originCoords, destCoords) {
        // Using free Graphhopper service
        const vehicle = this.currentProfile === 'driving' ? 'car' : this.currentProfile;
        const url = `https://graphhopper.com/api/1/route?point=${originCoords[0]},${originCoords[1]}&point=${destCoords[0]},${destCoords[1]}&vehicle=${vehicle}&debug=true&calc_points=true&type=json`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Graphhopper failed');
        
        const data = await response.json();
        if (!data.paths || data.paths.length === 0) throw new Error('No paths found');
        
        const path = data.paths[0];
        return {
            coordinates: this.decodePolyline(path.points),
            distance: path.distance,
            duration: path.time / 1000 // Convert to seconds
        };
    }

    createStraightLineRoute(originCoords, destCoords, originName, destName) {
        // Create a simple straight line route as fallback
        const distance = this.haversineDistance(
            originCoords[0], originCoords[1],
            destCoords[0], destCoords[1]
        );

        // Create polyline for straight route
        const polyline = L.polyline([originCoords, destCoords], {
            color: '#0056b3',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10' // Dashed line to indicate it's not a real route
        }).addTo(this.map);

        // Calculate duration based on current transport mode and realistic speeds
        const speed = this.transportSpeeds[this.currentProfile];
        const estimatedDuration = (distance / speed) * 3600; // seconds

        const routeData = {
            coordinates: [originCoords, destCoords],
            distance: distance * 1000, // Convert to meters
            duration: estimatedDuration,
            isEstimate: true
        };

        this.displayRoute(routeData, originName, destName);
        this.routingControl = { polyline }; // Store for cleanup
    }

    displayRoute(routeData, originName, destName) {
        // If not already drawn (for straight line fallback)
        if (!routeData.isEstimate) {
            const polyline = L.polyline(routeData.coordinates, {
                color: '#0056b3',
                weight: 6,
                opacity: 0.8
            }).addTo(this.map);
            
            this.routingControl = { polyline };
        }

        const distance = (routeData.distance / 1000).toFixed(1);
        const duration = this.formatDuration(routeData.duration);
        
        document.getElementById('route-distance').textContent = `${distance} km`;
        document.getElementById('route-duration').textContent = duration;
        document.getElementById('route-type').textContent = this.getTransportLabel(this.currentProfile);
        
        const routeType = routeData.isEstimate ? '(Estimated)' : '';
        this.showResult(`Route found from ${originName} to ${destName} ${routeType}`, 'success');
        this.showRouteInfo();
        this.showMap();
        
        // Fit map to show both markers
        const group = new L.featureGroup([this.originMarker, this.destinationMarker]);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes} min`;
        }
    }

    decodePolyline(encoded) {
        // Simple polyline decoder for Graphhopper
        const coords = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            coords.push([lat / 1e5, lng / 1e5]);
        }
        return coords;
    }

    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    updateRouteProfile(profile) {
        // Store current waypoints
        if (this.originMarker && this.destinationMarker) {
            const originCoords = [this.originMarker.getLatLng().lat, this.originMarker.getLatLng().lng];
            const destCoords = [this.destinationMarker.getLatLng().lat, this.destinationMarker.getLatLng().lng];
            
            // Update transport type display immediately
            document.getElementById('route-type').textContent = this.getTransportLabel(profile);
            
            // Recalculate duration with new transport mode
            if (this.routingControl) {
                const distance = parseFloat(document.getElementById('route-distance').textContent);
                const speed = this.transportSpeeds[profile];
                const newDuration = (distance / speed) * 3600; // seconds
                document.getElementById('route-duration').textContent = this.formatDuration(newDuration);
            }
            
            // Clear current route and recalculate if possible
            this.clearRoute();
            this.showRouteOnMap(originCoords, destCoords, 'Origin', 'Destination');
        }
    }

    clearRoute() {
        if (this.routingControl && this.routingControl.polyline) {
            this.map.removeLayer(this.routingControl.polyline);
        }
        this.routingControl = null;
    }

    clearMap() {
        this.clearRoute();
        if (this.originMarker) {
            this.map.removeLayer(this.originMarker);
            this.originMarker = null;
        }
        if (this.destinationMarker) {
            this.map.removeLayer(this.destinationMarker);
            this.destinationMarker = null;
        }
    }

    getTransportLabel(profile) {
        const labels = {
            'driving': '🚗 Driving',
            'walking': '🚶 Walking', 
            'cycling': '🚴 Cycling'
        };
        return labels[profile] || '🚗 Driving';
    }

    showMap() {
        const mapContainer = document.getElementById('map');
        mapContainer.classList.add('visible');
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    hideMap() {
        document.getElementById('map').classList.remove('visible');
        this.hideRouteInfo();
    }

    showRouteInfo() {
        document.getElementById('route-info').classList.add('visible');
    }

    hideRouteInfo() {
        document.getElementById('route-info').classList.remove('visible');
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            });
        });
    }

    async geocodeAddress(address) {
        // Using Nominatim (OpenStreetMap) geocoding service
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error(`Could not find location: ${address}`);
        }
        
        // Return [lat, lng] for Leaflet compatibility
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }

    showResult(message, type) {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = message;
            resultDiv.className = `result-display ${type}`;
        }
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    setupVideoPlayer() {
        const video = document.querySelector('.video-container video');
        const playButton = document.querySelector('.play-button');

        playButton?.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playButton.style.opacity = '0';
            } else {
                video.pause();
                playButton.style.opacity = '1';
            }
        });

        video?.addEventListener('play', () => {
            playButton.style.opacity = '0';
        });

        video?.addEventListener('pause', () => {
            playButton.style.opacity = '1';
        });
    }

    setupAccessibility() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close mobile menu if open
                const menu = document.getElementById('nav-menu');
                const toggle = document.getElementById('mobile-menu-toggle');
                if (menu?.classList.contains('active')) {
                    menu.classList.remove('active');
                    toggle?.setAttribute('aria-expanded', 'false');
                    if (toggle) toggle.innerHTML = '<i class="ri-menu-line"></i>';
                }
            }
        });

        // Add focus indicators for keyboard users
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-user');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-user');
        });
    }

    // ORIGINAL CAROUSEL FUNCTIONALITY - PRESERVED
    setupOriginalCarousels() {
        // Background carousel functionality (original from your code)
        const backgroundWrappers = document.querySelectorAll(".background-wrapper");
    
        backgroundWrappers.forEach((wrapper) => {
            let isFirstBackground = true;
            const backgroundBox = wrapper.querySelector(".background-box");
    
            if (backgroundBox) {
                backgroundBox.style.backgroundImage = `url('${backgroundBox.dataset.bg1}')`;
            }
    
            function toggleBackground() {
                isFirstBackground = !isFirstBackground;
                const newBackground = isFirstBackground
                    ? backgroundBox.dataset.bg1
                    : backgroundBox.dataset.bg2;
                backgroundBox.style.backgroundImage = `url('${newBackground}')`;
            }
    
            setInterval(toggleBackground, 3000);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new DivineDestinations();
});

// Add loading performance optimization
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}