const socket = io();

// Prompt for mobile number
const mobileNumber = prompt("Enter your mobile number:");
if (!mobileNumber) {
    alert("Mobile number is required to share your location.");
    throw new Error("No mobile number entered.");
}

// Real-time geolocation tracking
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Send mobile number along with location
            socket.emit("send-location", { mobileNumber, latitude, longitude });
        },
        (error) => {
            console.error("Error fetching location:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// Initialize Leaflet map
const map = L.map("map").setView([0, 0], 16); // Default center
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Real-Time Tracker",
}).addTo(map);

// Track markers by mobile numbers
const markers = {};

// Handle location updates
socket.on("receive-location", (data) => {
    const { mobileNumber, latitude, longitude } = data;

    // Update the map with the user's location
    if (markers[mobileNumber]) {
        markers[mobileNumber].setLatLng([latitude, longitude]);
    } else {
        markers[mobileNumber] = L.marker([latitude, longitude])
            .bindPopup(`Mobile: ${mobileNumber}`)
            .addTo(map);
    }
    map.setView([latitude, longitude]); // Center map on last location
});

// Handle disconnections
socket.on("user-disconnected", (mobileNumber) => {
    if (markers[mobileNumber]) {
        map.removeLayer(markers[mobileNumber]); // Remove marker from map
        delete markers[mobileNumber]; // Remove from local store
    }
});
