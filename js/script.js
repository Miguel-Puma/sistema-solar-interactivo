// Global map variable - will be initialized by Google Maps API
let map;
// Store all restaurants fetched from API
let allFetchedRestaurants = [];
// Store current markers on map
let currentRestaurantMarkers = [];
// Store the currently selected restaurant for details view
let selectedRestaurantForDetails = null;

// --- I18N Setup ---
const languageStrings = {
    'es': {
        'select_food_type_label': 'Selecciona el tipo de comida:',
        'select_zone_label': '¿En qué zona de Barcelona estás?:',
        'search_input_placeholder': 'Busca tu próximo restaurante favorito...',
        'search_icon_label': 'Buscar',
        'fetching_location': 'Buscando tu ubicación...',
        'location_not_supported': 'La geolocalización no está disponible en tu navegador. Mostrando Barcelona por defecto.',
        'location_error': 'No se pudo obtener tu ubicación: ',
        'location_default_map': 'Mostrando Barcelona por defecto.',
        'all_types_option': 'Todos los tipos',
        'italian_option': 'Italiana',
        'spanish_option': 'Española',
        'japanese_option': 'Japonesa',
        'mexican_option': 'Mexicana',
        'indian_option': 'India',
        'all_zones_option': 'Todas las zonas',
        'gothic_quarter_option': 'Barrio Gótico',
        'eixample_option': 'Eixample',
        'gracia_option': 'Gràcia',
        'barceloneta_option': 'Barceloneta',
        'get_directions_button': 'Obtener Dirección',
        'restaurant_details_rating': 'Calificación:',
        'restaurant_details_reviews': 'opiniones',
        'restaurant_details_address': 'Dirección:',
        'restaurant_details_name_unavailable': 'Nombre no disponible',
        'restaurant_details_address_unavailable': 'Dirección no disponible',
        'restaurant_details_no_reviews': '(Sin opiniones)',
        'user_location_marker_title': 'Tu Ubicación',
        'user_location_updated_marker_title': 'Tu Ubicación Actualizada',
        'restaurant_marker_title_rating_part': 'Calificación:',
        'no_restaurant_selected_alert': 'Por favor, selecciona un restaurante para obtener la dirección.',
        'places_api_zero_results': 'No se encontraron restaurantes en esta área.',
        'places_api_over_query_limit': 'Se ha superado el límite de consultas a la API. Inténtalo más tarde.',
        'places_api_generic_error': 'Error al buscar restaurantes: ',
        'places_api_initial_fetch_success': 'Encontrados {count} restaurantes cercanos.',
        'maps_api_load_error': 'Error: La API de Google Maps no pudo cargarse. Comprueba tu clave API y conexión a internet.',
        'maps_places_load_error': 'Error: No se pudo cargar la API de Google Places. La búsqueda de restaurantes no funcionará.',
        'filters_applied_log': 'Se encontraron {count} restaurantes después de aplicar filtros y búsqueda.',
        'displayed_restaurants_log': 'Mostrando {count} marcadores de restaurantes.', // Translated for consistency
        'no_restaurants_to_display_log': 'No hay restaurantes para mostrar después de filtrar/buscar.', // Translated
        'script_loaded_log': 'Script de Barcelona Restaurant Finder cargado. UI de búsqueda con icono implementada. I18N lista.', // Translated
        'error_console_prefix': 'Error: ',
        'warning_console_prefix': 'Advertencia: ',
    },
    'en': {
        'select_food_type_label': 'Select food type:',
        'select_zone_label': 'Which area of Barcelona are you in?:',
        'search_input_placeholder': 'Search for your next favorite restaurant...',
        'search_icon_label': 'Search',
        'fetching_location': 'Fetching your location...',
        'location_not_supported': 'Geolocation is not supported by your browser. Showing Barcelona by default.',
        'location_error': 'Unable to retrieve your location: ',
        'location_default_map': 'Showing Barcelona by default.',
        'all_types_option': 'All Types',
        'italian_option': 'Italian',
        'spanish_option': 'Spanish',
        'japanese_option': 'Japanese',
        'mexican_option': 'Mexican',
        'indian_option': 'Indian',
        'all_zones_option': 'All Zones',
        'gothic_quarter_option': 'Gothic Quarter',
        'eixample_option': 'Eixample',
        'gracia_option': 'Gràcia',
        'barceloneta_option': 'Barceloneta',
        'get_directions_button': 'Get Directions',
        'restaurant_details_rating': 'Rating:',
        'restaurant_details_reviews': 'reviews',
        'restaurant_details_address': 'Address:',
        'restaurant_details_name_unavailable': 'Name not available',
        'restaurant_details_address_unavailable': 'Address not available',
        'restaurant_details_no_reviews': '(No reviews)',
        'user_location_marker_title': 'Your Location',
        'user_location_updated_marker_title': 'Your Updated Location',
        'restaurant_marker_title_rating_part': 'Rating:',
        'no_restaurant_selected_alert': 'Please select a restaurant to get directions.',
        'places_api_zero_results': 'No restaurants found in this area.',
        'places_api_over_query_limit': 'Places API query limit reached. Please try again later.',
        'places_api_generic_error': 'Error fetching restaurants: ',
        'places_api_initial_fetch_success': 'Found {count} restaurants nearby.',
        'maps_api_load_error': 'Error: Google Maps API failed to load. Check API key and internet connection.',
        'maps_places_load_error': 'Error: Google Places API failed to load. Restaurant search will not work.',
        'filters_applied_log': 'Found {count} restaurants after applying filters and search.',
        'displayed_restaurants_log': 'Displayed {count} restaurant markers.',
        'no_restaurants_to_display_log': 'No restaurants to display after filtering/search.',
        'script_loaded_log': 'Barcelona Restaurant Finder script loaded! Search icon UI implemented. I18N ready.',
        'error_console_prefix': 'Error: ',
        'warning_console_prefix': 'Warning: ',
    }
};

let currentLanguage = 'es';

function detectLanguage() {
    const browserLang = navigator.language.split('-')[0];
    if (languageStrings.hasOwnProperty(browserLang)) {
        currentLanguage = browserLang;
    }
    // console.log(`Current language set to: ${currentLanguage}`); // Debug log, can be removed
}

function translate(key, replacements = {}) {
    const stringSet = languageStrings[currentLanguage] || languageStrings['en'];
    let translatedString = stringSet[key] || `Missing translation for: ${key} (Lang: ${currentLanguage})`;

    for (const placeholder in replacements) {
        translatedString = translatedString.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return translatedString;
}

function updateUIWithTranslations() {
    // console.log("Updating UI with translations for language:", currentLanguage); // Debug log

    const foodTypeLabel = document.querySelector('label[for="food-type-select"]');
    if (foodTypeLabel) foodTypeLabel.textContent = translate('select_food_type_label');

    const zoneLabel = document.querySelector('label[for="zone-select"]');
    if (zoneLabel) zoneLabel.textContent = translate('select_zone_label');

    const searchInputEl = document.getElementById('search-input');
    if (searchInputEl) searchInputEl.placeholder = translate('search_input_placeholder');

    const searchIconEl = document.getElementById('search-icon');
    if (searchIconEl) searchIconEl.title = translate('search_icon_label');

    const locationStatusEl = document.getElementById('location-status');
    if (locationStatusEl && (locationStatusEl.textContent.includes("Buscando") || locationStatusEl.textContent.includes("Fetching"))) {
         locationStatusEl.textContent = translate('fetching_location');
    }

    const directionsButton = document.getElementById('get-directions-button');
    if (directionsButton) directionsButton.textContent = translate('get_directions_button');

    const foodTypeSelect = document.getElementById('food-type-select');
    if (foodTypeSelect && foodTypeSelect.options.length > 0) {
        foodTypeSelect.options[0].textContent = translate('all_types_option');
        const foodTypes = {
            'italian': 'italian_option', 'spanish': 'spanish_option', 'japanese': 'japanese_option',
            'mexican': 'mexican_option', 'indian': 'indian_option'
        };
        for (let i = 1; i < foodTypeSelect.options.length; i++) {
            const val = foodTypeSelect.options[i].value;
            if (foodTypes[val]) {
                foodTypeSelect.options[i].textContent = translate(foodTypes[val]);
            }
        }
    }

    const zoneSelect = document.getElementById('zone-select');
    if (zoneSelect && zoneSelect.options.length > 0) {
        zoneSelect.options[0].textContent = translate('all_zones_option');
        const zoneTypes = {
            'gothic_quarter': 'gothic_quarter_option', 'eixample': 'eixample_option',
            'gracia': 'gracia_option', 'barceloneta': 'barceloneta_option'
        };
         for (let i = 1; i < zoneSelect.options.length; i++) {
            const val = zoneSelect.options[i].value;
            if (zoneTypes[val]) {
                zoneSelect.options[i].textContent = translate(zoneTypes[val]);
            }
        }
    }
}
// --- End I18N Setup ---

function getStarRating(rating) {
    if (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5) { // Added isNaN check
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

function clearRestaurantMarkers() {
    if (!map) return; // Don't try to clear markers if map doesn't exist
    for (let i = 0; i < currentRestaurantMarkers.length; i++) {
        currentRestaurantMarkers[i].setMap(null);
    }
    currentRestaurantMarkers = [];
}

function displayRestaurants(restaurantsToDisplay) {
    if (!map) { // If map is not initialized, cannot display markers
        console.warn(translate('warning_console_prefix') + "Map not available to display restaurant markers.");
        return;
    }
    clearRestaurantMarkers();

    const detailsContainer = document.getElementById('restaurant-details-container');
    const detailNameEl = document.getElementById('detail-name');
    const detailRatingEl = document.getElementById('detail-rating');
    const detailAddressEl = document.getElementById('detail-address');

    if (!restaurantsToDisplay || restaurantsToDisplay.length === 0) {
        // console.log(translate('no_restaurants_to_display_log')); // Log handled by applyFilters now
        if (detailsContainer) detailsContainer.style.display = 'none';
        selectedRestaurantForDetails = null;
        return;
    }

    for (let i = 0; i < restaurantsToDisplay.length; i++) {
        const place = restaurantsToDisplay[i];
        // Ensure place has geometry and location before creating a marker
        if (!place.geometry || !place.geometry.location) {
            console.warn(translate('warning_console_prefix') + `Restaurant "${place.name}" missing geometry.location, cannot create marker.`);
            continue;
        }
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: `${place.name || translate('restaurant_details_name_unavailable')} - ${translate('restaurant_marker_title_rating_part')} ${place.rating || 'N/A'}`
        });

        marker.addListener('click', () => {
            selectedRestaurantForDetails = place;

            if (!detailsContainer || !detailNameEl || !detailRatingEl || !detailAddressEl) {
                console.error(translate('error_console_prefix') + "Detail elements not found in the DOM.");
                return;
            }
            detailNameEl.textContent = place.name || translate('restaurant_details_name_unavailable');

            let ratingText = translate('restaurant_details_rating') + ' ' + getStarRating(place.rating);
            ratingText += (place.rating ? ` (${place.rating.toFixed(1)} / 5)` : ''); // toFixed might fail if rating is not number, getStarRating handles it
            ratingText += (place.user_ratings_total ? ` - ${place.user_ratings_total} ${translate('restaurant_details_reviews')}` : ` ${translate('restaurant_details_no_reviews')}`);
            detailRatingEl.innerHTML = ratingText;

            detailAddressEl.textContent = translate('restaurant_details_address') + ' ' + (place.vicinity || translate('restaurant_details_address_unavailable'));

            detailsContainer.style.display = 'block';
            detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        currentRestaurantMarkers.push(marker);
    }
    // console.log(translate('displayed_restaurants_log', {count: currentRestaurantMarkers.length})); // Can be verbose
}

function applyFilters() {
    const selectedFoodType = document.getElementById('food-type-select')?.value || "";
    const selectedZone = document.getElementById('zone-select')?.value || "";
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

    let filteredRestaurants = allFetchedRestaurants; // Start with all fetched restaurants

    if (!Array.isArray(allFetchedRestaurants) || allFetchedRestaurants.length === 0) {
        // No base restaurants to filter, ensure UI reflects this (e.g., no results message)
        // displayRestaurants will handle empty array, but locationStatus might need update.
        // This is typically handled by fetchNearbyRestaurants if API call fails.
        console.log(translate('no_restaurants_to_display_log')); // Log that there's nothing to filter
    }


    if (selectedFoodType) {
        const foodTypeKeyword = selectedFoodType;
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
            const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(selectedFoodType.toLowerCase());
            const typesMatch = restaurant.types && restaurant.types.some(type => type.toLowerCase().includes(foodTypeKeyword));
            return nameMatch || typesMatch;
        });
    }

    if (selectedZone) {
        const zoneString = selectedZone.toLowerCase().replace("_", " ");
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
            const vicinityMatch = restaurant.vicinity && restaurant.vicinity.toLowerCase().includes(zoneString);
            const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(zoneString);
            return vicinityMatch || nameMatch;
        });
    }

    if (searchTerm) {
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
            const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(searchTerm);
            const typesMatch = restaurant.types && restaurant.types.some(type => type.toLowerCase().includes(searchTerm));
            const vicinityMatch = restaurant.vicinity && restaurant.vicinity.toLowerCase().includes(searchTerm);
            return nameMatch || typesMatch || vicinityMatch;
        });
    }

    // console.log(translate('filters_applied_log', {count: filteredRestaurants.length})); // Can be verbose
    displayRestaurants(filteredRestaurants);

    if (filteredRestaurants.length === 0) {
        const detailsContainer = document.getElementById('restaurant-details-container');
        if (detailsContainer) detailsContainer.style.display = 'none';
        selectedRestaurantForDetails = null;
        // Consider updating locationStatusDiv if it's not already showing a "no results" type message
        // from fetchNearbyRestaurants. This avoids overwriting API error messages.
        const locationStatusDiv = document.getElementById('location-status');
        if (locationStatusDiv && !locationStatusDiv.textContent.includes(translate('places_api_zero_results').substring(0,10))) { // Avoid double "no results"
             // If API call was successful but filters cleared all, show this.
            if (allFetchedRestaurants.length > 0) { // Only if there were restaurants to begin with
                 locationStatusDiv.textContent = translate('places_api_zero_results'); // Or a more filter-specific message
            }
        }
    }
}

function fetchNearbyRestaurants(mapInstance, location) {
    // Ensure Google Places API is available
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.error(translate('error_console_prefix') + translate('maps_places_load_error'));
        const locationStatusDiv = document.getElementById('location-status');
        if (locationStatusDiv) locationStatusDiv.textContent = translate('maps_places_load_error');
        allFetchedRestaurants = []; // Ensure no stale data
        applyFilters(); // Update UI to show no results
        return;
    }
    // Ensure map instance and location are valid
    if (!mapInstance || !location) {
        console.error(translate('error_console_prefix') + "Map instance or location not provided for fetching restaurants.");
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

        const currentGeoLocationMsg = document.getElementById('location-status')?.getAttribute('data-geolocation-msg') || "";
        if (currentGeoLocationMsg) {
            userMessage = currentGeoLocationMsg + " ";
        }


        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            allFetchedRestaurants = results || []; // Ensure it's an array
            // console.log(`Fetched ${allFetchedRestaurants.length} restaurants initially.`); // Dev log
            userMessage += translate('places_api_initial_fetch_success', {count: results.length});

        } else {
            console.error(translate('error_console_prefix') + `PlacesService failed. Status: ${status}`);
            allFetchedRestaurants = [];
            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                userMessage += translate('places_api_zero_results');
            } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                 userMessage += translate('places_api_over_query_limit');
            } else {
                userMessage += translate('places_api_generic_error') + status;
            }
        }

        if (locationStatusDiv) locationStatusDiv.textContent = userMessage.trim();
        applyFilters(); // This will call displayRestaurants
    });
}

function initMap(latitude, longitude) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) {
        console.error(translate('error_console_prefix') + "map div not found.");
        return;
    }
     // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.error(translate('error_console_prefix') + translate('maps_api_load_error'));
        const locationStatusDiv = document.getElementById('location-status');
        if (locationStatusDiv) locationStatusDiv.textContent = translate('maps_api_load_error');
        return; // Cannot initialize map
    }

    if (map && typeof map.getCenter === 'function') {
        // console.log("Map already initialized. Attempting to update center/markers."); // Dev log
        if (latitude !== undefined && longitude !== undefined) {
            const newCenter = new google.maps.LatLng(latitude, longitude); // Use LatLng object
            map.setCenter(newCenter);
            // Consider removing old user marker before adding new one, or updating its position
            new google.maps.Marker({
                position: newCenter,
                map: map,
                title: translate('user_location_updated_marker_title'),
                icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
            });
            fetchNearbyRestaurants(map, newCenter);
        }
        return;
    }

    let mapCenterCoords;
    let addUserMarker = false;

    if (latitude !== undefined && longitude !== undefined) {
        mapCenterCoords = { lat: latitude, lng: longitude };
        addUserMarker = true;
    } else {
        mapCenterCoords = { lat: 41.3851, lng: 2.1734 }; // Default to Barcelona
        // console.log("User location not available or not provided. Defaulting to Barcelona."); // Dev Log
    }

    map = new google.maps.Map(mapDiv, {
        center: mapCenterCoords,
        zoom: 14
    });

    if (addUserMarker) {
        new google.maps.Marker({
            position: mapCenterCoords,
            map: map,
            title: translate('user_location_marker_title'),
            icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
        });
    }

    // Fetch restaurants based on initial map center
    // Defer if Places library might not be ready (though API callback implies it should be)
    if (google.maps.places) {
        fetchNearbyRestaurants(map, map.getCenter());
    } else {
        console.warn(translate('warning_console_prefix') + "Places library not ready when initMap was called. Restaurants might not load immediately.");
        setTimeout(() => {
            if (google.maps.places) {
                fetchNearbyRestaurants(map, map.getCenter());
            } else {
                console.error(translate('error_console_prefix') + translate('maps_places_load_error'));
                 const locationStatusDiv = document.getElementById('location-status');
                 if(locationStatusDiv) locationStatusDiv.textContent = translate('maps_places_load_error');
            }
        }, 1500);
    }
}

// DOMContentLoaded is the main entry point after HTML is parsed
document.addEventListener('DOMContentLoaded', () => {
    detectLanguage();
    updateUIWithTranslations();

    // Get references to all interactive elements
    const locationStatusDiv = document.getElementById('location-status');
    const foodTypeSelect = document.getElementById('food-type-select');
    const zoneSelect = document.getElementById('zone-select');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const getDirectionsButton = document.getElementById('get-directions-button');

    // Attach event listeners if elements exist
    if (foodTypeSelect) foodTypeSelect.addEventListener('change', applyFilters);
    else console.error(translate('error_console_prefix') + "Food type select dropdown not found.");

    if (zoneSelect) zoneSelect.addEventListener('change', applyFilters);
    else console.error(translate('error_console_prefix') + "Zone select dropdown not found.");

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    } else {
        console.error(translate('error_console_prefix') + "Search input field not found.");
    }

    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', () => {
            searchInput.classList.toggle('active');
            if (searchInput.classList.contains('active')) {
                searchInput.focus();
            }
        });
    } else {
        console.error(translate('error_console_prefix') + "Search icon or search input field not found for click listener setup.");
    }

    if (getDirectionsButton) {
        getDirectionsButton.addEventListener('click', () => {
            if (selectedRestaurantForDetails && selectedRestaurantForDetails.geometry && selectedRestaurantForDetails.geometry.location) {
                // Ensure location is a LatLng object or has lat(), lng() methods
                let lat, lng;
                if (typeof selectedRestaurantForDetails.geometry.location.lat === 'function') {
                    lat = selectedRestaurantForDetails.geometry.location.lat();
                    lng = selectedRestaurantForDetails.geometry.location.lng();
                } else { // Fallback if it's a simple {lat: ..., lng: ...} object (less common for Places API)
                    lat = selectedRestaurantForDetails.geometry.location.lat;
                    lng = selectedRestaurantForDetails.geometry.location.lng;
                }

                if (typeof lat === 'number' && typeof lng === 'number') {
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                    window.open(directionsUrl, '_blank');
                } else {
                     console.error(translate('error_console_prefix') + "Invalid location data for directions.");
                     alert(translate('no_restaurant_selected_alert')); // Or a more specific error
                }
            } else {
                console.error(translate('error_console_prefix') + "No restaurant selected or location missing for directions.");
                alert(translate('no_restaurant_selected_alert'));
            }
        });
    } else {
        console.error(translate('error_console_prefix') + "Get Directions button not found.");
    }

    // Function to attempt to get user's current location
    function getUserLocation() {
        const statusDiv = locationStatusDiv || { textContent: "" }; // Graceful fallback if div is missing

        if (!navigator.geolocation) {
            statusDiv.textContent = translate('location_not_supported');
            console.warn(translate('warning_console_prefix') + "Geolocation is not supported by this browser.");
            if (!map && (typeof google !== 'undefined' && google.maps)) initMap(); // Initialize map with default (Barcelona) if not already done
            return;
        }
        // Initial "Fetching location..." message is set by updateUIWithTranslations

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // console.log(`Latitude: ${lat}, Longitude: ${lon}`); // Dev log
                const locationMsg = `${translate('user_location_marker_title').split(' ')[0]}: ${lat.toFixed(4)}, ${translate('user_location_marker_title').split(' ')[1] || 'Longitud'}: ${lon.toFixed(4)}.`;
                statusDiv.textContent = locationMsg;
                statusDiv.setAttribute('data-geolocation-msg', locationMsg); // Store for combining with API results

                if (!map && (typeof google !== 'undefined' && google.maps)) initMap(lat, lon);
                else if (map) { // If map exists, update center and fetch
                    const newCenter = new google.maps.LatLng(lat, lon);
                    map.setCenter(newCenter);
                    new google.maps.Marker({ position: newCenter, map: map, title: translate('user_location_marker_title'), icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }});
                    fetchNearbyRestaurants(map, map.getCenter());
                }
            },
            (error) => {
                console.warn(translate('warning_console_prefix') + `Geolocation error: ${error.message} (Code: ${error.code})`);
                statusDiv.textContent = translate('location_error') + error.message + ". " + translate('location_default_map');
                statusDiv.removeAttribute('data-geolocation-msg');
                if (!map && (typeof google !== 'undefined' && google.maps)) initMap();
            }
        );
    }

    // Google Maps API loading check and initialization flow
    // The Google Maps script in index.html has `async defer` and `callback=initMap`.
    // This means `initMap` will be called by the API once it loads.
    // We still need to handle cases where it might load before or after DOMContentLoaded,
    // and coordinate `getUserLocation`.

    // If `initMap` is the global callback, it will be called automatically.
    // We then call `getUserLocation` from DOMContentLoaded to potentially update the map
    // if user permission is granted after initial map load.
    // If `initMap` hasn't run by the time DOMContentLoaded fires (e.g. API script is slow),
    // then `getUserLocation` can call `initMap`.

    // A simple check: if `map` is not yet defined, Google's callback `initMap` hasn't run or completed.
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        // This case suggests the API script itself hasn't loaded/parsed.
        // The `setTimeout` handles this by re-checking.
        console.warn(translate('warning_console_prefix') + "Google Maps API not immediately available. Will re-check or rely on API callback.");
        setTimeout(() => {
            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                 console.error(translate('error_console_prefix') + translate('maps_api_load_error'));
                 if (locationStatusDiv) locationStatusDiv.textContent = translate('maps_api_load_error');
            } else {
                 // API loaded within the delay. If `initMap` was callback, it should have run.
                 // If not, and map still not there, getUserLocation might trigger it.
                 if (!map) getUserLocation();
            }
        }, 2000); // Increased timeout

    } else { // Google object exists, API script has loaded.
        // console.log("Google Maps API script loaded. `initMap` (if callback) should handle initialization."); // Dev log
        if (!map) {
            // `initMap` (as callback) hasn't run or completed yet, or is not the callback.
            // Call `getUserLocation` which will call `initMap`.
            // console.log("`map` not yet initialized, calling `getUserLocation`."); // Dev log
            getUserLocation();
        } else {
             // `map` already initialized by API callback.
             // Call `getUserLocation` to get actual location and potentially update map center.
             // console.log("`map` already initialized by API callback. Calling `getUserLocation` to refine with live geo-data."); // Dev log
             getUserLocation();
        }
    }
});

// The main script loaded log is now part of i18n and called from within DOMContentLoaded or similar.
// console.log(translate('script_loaded_log')); // This would be too early before detectLanguage
// Final log to confirm script end processing (useful for debugging script load issues)
// console.log("End of script.js processing."); // Dev logThe code review and cleanup for non-map functionality has been performed on `js/script.js`.

Key changes and observations:

1.  **Error Handling for Google Maps Objects:**
    *   `initMap`: Added a check for `google` and `google.maps` at the beginning. If the API script fails to load, `initMap` will now exit early and display an error, preventing further errors from calls to `new google.maps.Map`, etc.
    *   `fetchNearbyRestaurants`: Added a check for `google.maps.places` and `PlacesService` availability. If not available (e.g., `libraries=places` missing or API load issue), it logs an error, updates `locationStatusDiv`, clears `allFetchedRestaurants`, and calls `applyFilters` to ensure the UI reflects the inability to search. Also added checks for `mapInstance` and `location` parameters.
    *   `displayRestaurants`: Added a check if `map` is initialized before trying to display markers.
    *   `clearRestaurantMarkers`: Added a check if `map` exists.
    *   `initMap` uses `new google.maps.LatLng` for `newCenter` when updating map.
    *   `getDirectionsButton` listener: Added checks for `lat` and `lng` being numbers before creating the URL.

2.  **Null Checks for DOM Elements:**
    *   In `applyFilters`, added optional chaining (`?.value`) for `foodTypeSelect` and `zoneSelect` in case they are unexpectedly missing, defaulting to empty strings.
    *   Most critical DOM elements are either checked for existence in `DOMContentLoaded` before listeners are attached or their absence would lead to clear errors that are now mostly caught or logged.

3.  **Filter and Search Logic:**
    *   `applyFilters()`: Added a check if `allFetchedRestaurants` is an array and has items before starting to filter. If it's empty, it logs this.
    *   If filters result in an empty `filteredRestaurants` array, and there were restaurants initially (i.e., API call was successful), it now updates `locationStatusDiv` to indicate no results matched the filter criteria (e.g., using `translate('places_api_zero_results')`). This avoids overwriting specific API error messages.

4.  **Restaurant Details Panel:**
    *   In `displayRestaurants`, when creating a marker, added a check for `place.geometry && place.geometry.location` before attempting to use it, skipping the marker if essential location data is missing.
    *   Used `place.name || translate('restaurant_details_name_unavailable')` for marker titles as well.
    *   `getStarRating` already had good checks; added `isNaN(rating)`.

5.  **i18n Robustness:**
    *   `translate(key)` already falls back to English and then to a "Missing translation" message, which is robust.
    *   Added more translations for console logs and new error states.
    *   In `getUserLocation`, used `setAttribute('data-geolocation-msg', locationMsg)` to store the pure geolocation part of the message, so `fetchNearbyRestaurants` can combine it more reliably with its own status messages.

6.  **Clarity and Comments:**
    *   Reviewed existing comments. Added a few where logic was complex (e.g., message combination in `fetchNearbyRestaurants`).
    *   Variable names are generally descriptive.

7.  **Console Logs:**
    *   Translated several console log messages using `translate()`. Some developer-centric logs remain in English or were commented out/removed if too verbose (e.g., logging every fetched restaurant count in `applyFilters`). Critical errors and warnings now use the `translate('error_console_prefix')` or `translate('warning_console_prefix')`.

8.  **HTML/CSS:** No major issues noted from the brief review, as the focus was JS. The CSS/HTML changes from previous steps were primarily about layout and i18n text which seem fine.

The script should now be more resilient to failures related to the Google Maps API not loading or returning unexpected data, and provides clearer feedback to the user or console in such cases.

I will now submit the subtask report.
