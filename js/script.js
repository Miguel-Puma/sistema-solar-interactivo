// Global map variable
let map;
// Store all restaurants fetched from API
let allFetchedRestaurants = [];
// Store current markers on map
let currentRestaurantMarkers = [];
// Store the currently selected restaurant for details view
let selectedRestaurantForDetails = null;

// Helper function to generate star rating string
function getStarRating(rating) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return 'N/A';
    }
    const fullStar = '★';
    const halfStar = '½';
    const emptyStar = '☆';
    let stars = '';
    const roundedRating = Math.round(rating * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            stars += fullStar;
        } else if (i - 0.5 === roundedRating) {
            stars += halfStar;
        } else {
            stars += emptyStar;
        }
    }
    return stars;
}

// Function to clear existing restaurant markers from the map
function clearRestaurantMarkers() {
    for (let i = 0; i < currentRestaurantMarkers.length; i++) {
        currentRestaurantMarkers[i].setMap(null);
    }
    currentRestaurantMarkers = [];
}

// Function to display/render restaurant markers on the map
function displayRestaurants(restaurantsToDisplay) {
    clearRestaurantMarkers();

    const detailsContainer = document.getElementById('restaurant-details-container');
    const detailNameEl = document.getElementById('detail-name');
    const detailRatingEl = document.getElementById('detail-rating');
    const detailAddressEl = document.getElementById('detail-address');

    if (!restaurantsToDisplay || restaurantsToDisplay.length === 0) {
        console.log("No restaurants to display after filtering/search.");
        if (detailsContainer) detailsContainer.style.display = 'none';
        selectedRestaurantForDetails = null; // Clear selected restaurant if none are displayed
        return;
    }

    for (let i = 0; i < restaurantsToDisplay.length; i++) {
        const place = restaurantsToDisplay[i];
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: `${place.name} - Rating: ${place.rating || 'N/A'}`
        });

        marker.addListener('click', () => {
            selectedRestaurantForDetails = place; // Store the clicked restaurant's data

            if (!detailsContainer || !detailNameEl || !detailRatingEl || !detailAddressEl) {
                console.error("Detail elements not found in the DOM.");
                return;
            }
            detailNameEl.textContent = place.name || 'Name not available';

            let ratingText = 'Rating: ' + getStarRating(place.rating);
            ratingText += (place.rating ? ` (${place.rating.toFixed(1)} / 5)` : '');
            ratingText += (place.user_ratings_total ? ` - ${place.user_ratings_total} reviews` : ' (No reviews)');
            detailRatingEl.innerHTML = ratingText;

            detailAddressEl.textContent = 'Address: ' + (place.vicinity || 'Address not available');

            detailsContainer.style.display = 'block';
            detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        currentRestaurantMarkers.push(marker);
    }
    console.log(`Displayed ${currentRestaurantMarkers.length} restaurants with click listeners.`);
}

// Function to apply filters and search based on dropdown selections and search input
function applyFilters() {
    const selectedFoodType = document.getElementById('food-type-select').value;
    const selectedZone = document.getElementById('zone-select').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    console.log(`Applying filters/search: Food Type - '${selectedFoodType}', Zone - '${selectedZone}', Search - '${searchTerm}'`);

    let filteredRestaurants = allFetchedRestaurants;

    if (selectedFoodType) {
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
            const nameMatch = restaurant.name.toLowerCase().includes(selectedFoodType.toLowerCase());
            const typesMatch = restaurant.types && restaurant.types.some(type => type.toLowerCase().includes(selectedFoodType.toLowerCase()));
            return nameMatch || typesMatch;
        });
    }

    if (selectedZone) {
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
            const zoneString = selectedZone.toLowerCase().replace("_", " ");
            const vicinityMatch = restaurant.vicinity && restaurant.vicinity.toLowerCase().includes(zoneString);
            const nameMatch = restaurant.name.toLowerCase().includes(zoneString);
            return vicinityMatch || nameMatch;
        });
    }

    if (searchTerm) {
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
            const nameMatch = restaurant.name.toLowerCase().includes(searchTerm);
            const typesMatch = restaurant.types && restaurant.types.some(type => type.toLowerCase().includes(searchTerm));
            const vicinityMatch = restaurant.vicinity && restaurant.vicinity.toLowerCase().includes(searchTerm);
            return nameMatch || typesMatch || vicinityMatch;
        });
    }

    console.log(`Found ${filteredRestaurants.length} restaurants after applying filters and search.`);
    displayRestaurants(filteredRestaurants);

    if (filteredRestaurants.length === 0) {
        const detailsContainer = document.getElementById('restaurant-details-container');
        if (detailsContainer) detailsContainer.style.display = 'none';
        selectedRestaurantForDetails = null;
    }
}


// Function to fetch nearby restaurants
function fetchNearbyRestaurants(mapInstance, location) {
    if (!google.maps.places) {
        console.error("Google Places API library not loaded.");
        return;
    }
    const placesService = new google.maps.places.PlacesService(mapInstance);
    const request = {
        location: location,
        radius: '2500',
        type: ['restaurant']
    };

    placesService.nearbySearch(request, (results, status) => {
        const locationStatusDiv = document.getElementById('location-status');
        let userMessage = "";

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            allFetchedRestaurants = results;
            console.log(`Fetched ${allFetchedRestaurants.length} restaurants initially.`);
            if (locationStatusDiv && locationStatusDiv.textContent.startsWith("Latitude:")) {
                 userMessage = locationStatusDiv.textContent.split(". No")[0].split(". Error")[0] + ". ";
            }
             userMessage += `Found ${results.length} restaurants nearby.`;

        } else {
            console.error(`PlacesService failed. Status: ${status}`);
            allFetchedRestaurants = [];
            if (locationStatusDiv && locationStatusDiv.textContent.startsWith("Latitude:")) {
                 userMessage = locationStatusDiv.textContent.split(". Error")[0].split(". No")[0] + ". ";
            }
            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                userMessage += "No restaurants found nearby the central point.";
            } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                 userMessage += "Error fetching restaurants (API Limit).";
            } else {
                userMessage += `Error fetching restaurants: ${status}.`;
            }
        }

        if (locationStatusDiv) locationStatusDiv.textContent = userMessage;
        applyFilters();
    });
}

// Function to initialize the map
function initMap(latitude, longitude) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) {
        console.error("Error: map div not found.");
        return;
    }

    if (map && typeof map.getCenter === 'function') {
        console.log("Map already initialized. Attempting to update center/markers.");
        if (latitude !== undefined && longitude !== undefined) {
            const newCenter = { lat: latitude, lng: longitude };
            map.setCenter(newCenter);
            new google.maps.Marker({
                position: newCenter,
                map: map,
                title: "Your Updated Location",
                icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
            });
            fetchNearbyRestaurants(map, newCenter);
        }
        return;
    }

    let mapCenter;
    let addUserMarker = false;

    if (latitude !== undefined && longitude !== undefined) {
        mapCenter = { lat: latitude, lng: longitude };
        addUserMarker = true;
    } else {
        mapCenter = { lat: 41.3851, lng: 2.1734 };
        console.log("User location not available or not provided. Defaulting to Barcelona.");
    }

    map = new google.maps.Map(mapDiv, {
        center: mapCenter,
        zoom: 14
    });

    if (addUserMarker) {
        new google.maps.Marker({
            position: mapCenter,
            map: map,
            title: "Your Location",
            icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
        });
    }

    if (google.maps.places) {
        fetchNearbyRestaurants(map, map.getCenter());
    } else {
        console.warn("Places library not ready when initMap was called. Restaurants might not load.");
        setTimeout(() => {
            if (google.maps.places) {
                fetchNearbyRestaurants(map, map.getCenter());
            } else {
                console.error("Places library still not loaded after delay.");
            }
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const locationStatusDiv = document.getElementById('location-status');
    const foodTypeSelect = document.getElementById('food-type-select');
    const zoneSelect = document.getElementById('zone-select');
    const searchInput = document.getElementById('search-input');
    const getDirectionsButton = document.getElementById('get-directions-button');

    if (foodTypeSelect) foodTypeSelect.addEventListener('change', applyFilters);
    else console.error("Food type select dropdown not found.");

    if (zoneSelect) zoneSelect.addEventListener('change', applyFilters);
    else console.error("Zone select dropdown not found.");

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    else console.error("Search input field not found.");

    if (getDirectionsButton) {
        getDirectionsButton.addEventListener('click', () => {
            if (selectedRestaurantForDetails && selectedRestaurantForDetails.geometry && selectedRestaurantForDetails.geometry.location) {
                const lat = selectedRestaurantForDetails.geometry.location.lat();
                const lng = selectedRestaurantForDetails.geometry.location.lng();
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                window.open(directionsUrl, '_blank');
            } else {
                console.error("No restaurant selected or location missing for directions.");
                alert("Please select a restaurant first to get directions.");
            }
        });
    } else {
        console.error("Get Directions button not found.");
    }

    function getUserLocation() {
        const statusDiv = locationStatusDiv || { textContent: "" };

        if (!navigator.geolocation) {
            statusDiv.textContent = "Geolocation is not supported by your browser. Defaulting to Barcelona.";
            console.log("Geolocation is not supported by this browser.");
            if (!map) initMap();
            return;
        }

        statusDiv.textContent = "Fetching location...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log(`Latitude: ${lat}, Longitude: ${lon}`);
                statusDiv.textContent = `Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}.`;
                if (!map) initMap(lat, lon);
                else {
                    const newCenter = {lat: lat, lng: lon};
                    map.setCenter(newCenter);
                    new google.maps.Marker({ position: newCenter, map: map, title: "Your Location", icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }});
                    fetchNearbyRestaurants(map, map.getCenter());
                }
            },
            (error) => {
                console.error(`Geolocation error: ${error.message} (Code: ${error.code})`);
                statusDiv.textContent = `Unable to retrieve your location: ${error.message}. Defaulting to Barcelona.`;
                if (!map) initMap();
            }
        );
    }

    if (typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.places === 'undefined') {
        console.log("Google Maps API (including Places) not immediately available. Will attempt to initialize map via getUserLocation or after delay.");
        setTimeout(() => {
            if (typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.places === 'undefined') {
                 console.error("Google Maps API (with Places) failed to load after a short delay.");
                 if (locationStatusDiv) locationStatusDiv.textContent = "Error: Google Maps API failed to load. Check API key and internet.";
            } else {
                 if (!map) getUserLocation();
            }
        }, 750); // Slightly increased delay

    } else {
        console.log("Google Maps API (with Places) available. `initMap` (API callback) or `getUserLocation` will manage map initialization.");
        if (!map) {
            console.log("`map` not yet initialized, calling `getUserLocation` (which might call `initMap`).");
            getUserLocation();
        } else {
             console.log("`map` already initialized. `getUserLocation` might update center if new geo data is available.");
             getUserLocation();
        }
    }
});

console.log("Barcelona Restaurant Finder script loaded! Get Directions functionality added.");
