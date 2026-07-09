// Initialize the map
const map = L.map("map").setView([53.3824, -1.4685], 14); // Set initial view to a known coordinate

// Set up the map tiles (this example uses OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Add the "Locate Me" button control
L.control
    .locate({
        position: "topleft", // Controls the position (like the zoom buttons)
        follow: true, // Center map on the user's location when it changes
        setView: true, // Automatically zooms in when the location is found
        keepCurrentZoomLevel: true, // Don't zoom out when moving to the location
        icon: "fa fa-location-arrow", // Icon for the locate button
        iconLoading: "fa fa-spinner fa-spin", // Icon when locating
        showPopup: false, // Optional: display popup with the location
    })
    .addTo(map);

// Request user's location and add a blue circle marker
function addUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userCoords = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];

                // Add a blue circle marker for the user
                L.circleMarker(userCoords, {
                    color: "blue", // Border color
                    fillColor: "blue", // Fill color
                    fillOpacity: 0.5,
                    radius: 5, // Adjust size of the circle
                }).addTo(map);

                // Center the map on the user's location
                map.setView(userCoords, 14);
            },
            (error) => {
                console.error("Error getting user location:", error.message);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Call function to request location
addUserLocation();

// Function to calculate seconds ago since data was received
function secondsAgo(timestamp) {
    const now = new Date();
    const dataTime = new Date(timestamp);

    // Check if the timestamp is valid
    if (isNaN(dataTime)) {
        return "Invalid timestamp"; // Handle invalid timestamps
    }

    const diff = now - dataTime; // Time difference in milliseconds
    return Math.floor(diff / 1000); // Convert milliseconds to seconds
}

function getOperatorName(operatorRef) {
  switch ((operatorRef || "").trim().toUpperCase()) {
    case "FSYO":
      return "First South Yorkshire";
    case "SYRK":
      return "Stagecoach Yorkshire";
    default:
      return "Unknown";
  }
}

function getOperatorCode(operatorRef) {
  switch ((operatorRef || "").trim().toUpperCase()) {
    case "FSYO":
      return "first";
    case "SYRK":
      return "stagecoach";
    default:
      return "unknown";
  }
}

function makeFleetKey(operatorCode, fleetNumber) {
    return `${operatorCode}|${fleetNumber}`;
}

function isOperatorSelected(operatorCode) {
  const firstChecked = document.getElementById("firstCheckbox")?.checked ?? true;
  const stagecoachChecked = document.getElementById("stagecoachCheckbox")?.checked ?? true;

  if (operatorCode === "first") return firstChecked;
  if (operatorCode === "stagecoach") return stagecoachChecked;

  return false;
}

function isRequirementVehicle(fleetKey) {
    return (
        rReqIconFleetNumbers.has(fleetKey) ||
        kReqIconFleetNumbers.has(fleetKey) ||
        bothReqIconFleetNumbers.has(fleetKey)
    );
}

// Function to create custom rectangle icons with fleet numbers
function createVehicleIcon(line, fleetKey) {
    const html = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">${line}</div>
  `;

    let iconClass = "newicon";

    if (rReqIconFleetNumbers.has(fleetKey)) {
        iconClass = "r-reqicon";
    } else if (kReqIconFleetNumbers.has(fleetKey)) {
        iconClass = "k-reqicon";
    } else if (bothReqIconFleetNumbers.has(fleetKey)) {
        iconClass = "bothreqicon";
    }

    return L.divIcon({
        iconSize: [32, 13],
        html: html,
        className: iconClass,
        popupAnchor: [0, -5],
    });
}

/// Function to get fleet number (removes depot code if present)
function getFleetNumber(vehicleRef, operatorCode) {
    const cleanRef = (vehicleRef || "").trim().replace(/_/g, "");

    // Stagecoach refs come through like SYRK-12345
    if (operatorCode === "stagecoach") {
        return cleanRef.replace(/^SYRK-/i, "");
    }
	
    if (operatorCode === "first") {
        return cleanRef.replace(/^FSYO-/i, "");
    }	

    const parts = cleanRef.split(" ");
    return parts[parts.length - 1];
}

function getVehicleType(operatorCode, fleetNumber) {

    // ===== NUMERIC FLEET NUMBERS =====

    const num = parseInt(fleetNumber, 10);
    if (Number.isNaN(num)) return "Unknown";


    // Stagecoach
    if (operatorCode === "stagecoach") {
        if (num >= 10655 && num <= 11716) return "ADL E400MMC";
        if (num >= 15190 && num <= 15829) return "Scania E400";
        if (num >= 18303 && num <= 18467) return "ALX400 Trident";
        if (num >= 19105 && num <= 19560) return "ADL E2400";
        if (num >= 26020 && num <= 26087) return "ADL E200MMC";
        if (num >= 27187 && num <= 27570) return "ADL E300";
        if (num >= 36177 && num <= 37186) return "ADL E200";
        if (num >= 37451 && num <= 37615) return "ADL E200MMC";
        if (num >= 39101 && num <= 39118) return "Streetlite";
        if (num >= 47323 && num <= 47867) return "Optare Solo";
		if (num >= 54305 && num <= 54308) return "Volvo Elite";
		if (num >= 54401 && num <= 54412) return "Volvo Levante";
		if (num >= 63128 && num <= 63133) return "Yutong E10";
		if (num >= 73001 && num <= 73088) return "Yutong E12";
		if (num >= 80146 && num <= 80184) return "ADL E400EV";
        return "Unknown";
    }

    // First
    if (operatorCode === "first") {
        if (num >= 35101 && num <= 35938) return "Streetdeck";
		if (num >= 36136 && num <= 36280) return "B9TL Gemini";
		if (num >= 36301 && num <= 36305) return "B5TL EvoSeti";
		if (num >= 36321 && num <= 37756) return "B9TL Gemini";
		if (num >= 44521 && num <= 44524) return "ADL E200";
		if (num >= 47486 && num <= 47490) return "Streetlite";
		if (num >= 53862 && num <= 53864) return "Optare Solo SR";
		if (num >= 63038 && num <= 63913) return "Streetlite";
		if (num >= 69331 && num <= 69539) return "B7RLE Eclipse";
        return "Unknown";
    }

    return "Unknown";
}

const vehicleMarkers = new Map();
let lastOpenedFleetNumber = null; // Store last opened popup's fleet number
let popupWasOpen = false; // Track if a popup was open before refresh

// Function to fetch and display vehicle locations
async function fetchVehicleData() {
  try {
    const feedUrls = [
      "https://global.ross4122-ff0.workers.dev/operator/FSYO",
      "https://global.ross4122-ff0.workers.dev/operator/SYRK"
    ];

    // Fetch all feeds
    const responses = await Promise.all(feedUrls.map(url => fetch(url)));
    const xmlTexts = await Promise.all(
      responses.map(res => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
        return res.text();
      })
    );

    // Parse XML from all feeds
    const parser = new DOMParser();
    const allVehicleActivities = [];

    for (const xmlText of xmlTexts) {
      const xml = parser.parseFromString(xmlText, "application/xml");
      const activities = Array.from(xml.getElementsByTagName("VehicleActivity"));
      allVehicleActivities.push(...activities);
    }

    const showRequirementsOnly = document.getElementById("requirementsCheckbox").checked;

        // Cleanup markers that no longer match the current filters
        vehicleMarkers.forEach((marker, vehicleRef) => {
            const markerFleetKey = marker.options.fleetKey;
            const markerOperatorCode = marker.options.operatorCode;
            const matchesOperator = isOperatorSelected(markerOperatorCode);
            const isReqVehicle = isRequirementVehicle(markerFleetKey);

            const shouldShow =
                matchesOperator &&
                (!showRequirementsOnly || isReqVehicle);

            if (!shouldShow) {
                marker.remove();
                vehicleMarkers.delete(vehicleRef);
            }
        });

        popupWasOpen = !!map._popup;

         allVehicleActivities.forEach((activity) => {
            const line = activity.querySelector("PublishedLineName")?.textContent || "";
            let vehicleRef = activity.querySelector("VehicleRef")?.textContent || "";
            vehicleRef = vehicleRef.replace(/_/g, "");

            const operatorRef = activity.querySelector("OperatorRef")?.textContent || "";
            const operatorName = getOperatorName(operatorRef);
            const operatorCode = getOperatorCode(operatorRef);

            const recordedAtTimeStr = activity.querySelector("RecordedAtTime")?.textContent || "";
            const destination = (activity.querySelector("DestinationName")?.textContent || "").replace(/_/g, " ");

            const lat = parseFloat(activity.querySelector("VehicleLocation > Latitude")?.textContent);
            const lon = parseFloat(activity.querySelector("VehicleLocation > Longitude")?.textContent);

            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

            let fleet_number = getFleetNumber(vehicleRef, operatorCode);
            let vehicleType = getVehicleType(operatorCode, fleet_number);

            const fleetKey = makeFleetKey(operatorCode, fleet_number);

            const recordedAt = new Date(recordedAtTimeStr);
            const now = new Date();
            const timeSinceLastFix = Math.floor((now - recordedAt) / 1000);

            if (timeSinceLastFix > 900) return;

            const operatorSelected = isOperatorSelected(operatorCode);
            const requirementVehicle = isRequirementVehicle(fleetKey);

            if (!operatorSelected) return;
            if (showRequirementsOnly && !requirementVehicle) return;

            let timeAgo = timeSinceLastFix < 60 ?
                `${timeSinceLastFix} seconds ago` :
                timeSinceLastFix < 120 ?
                "1 minute ago" :
                `${Math.floor(timeSinceLastFix / 60)} minutes ago`;

            let popupText = line && destination ?
                `<b>${line}</b> to <b>${destination}</b>` :
                line ?
                `<b>${line}</b>` :
                "Not in Service";

            const popupHtml = `
    ${popupText}<br>
	<b>${operatorName}</b><br>
    <b>${fleet_number}</b> – ${vehicleType}<br>
    <small>${timeAgo}</small>
  `;

            if (vehicleMarkers.has(vehicleRef)) {
                const marker = vehicleMarkers.get(vehicleRef);
                marker.setLatLng([lat, lon]);
                marker.setIcon(createVehicleIcon(line, fleetKey));
                marker.setPopupContent(popupHtml);
                marker.options.fleetKey = fleetKey;
				marker.options.operatorCode = operatorCode;
            } else {
                const marker = L.marker([lat, lon], {
                    icon: createVehicleIcon(line, fleetKey),
                    fleetKey: fleetKey,
                    operatorCode: operatorCode,
                }).addTo(map);

                marker.bindPopup(popupHtml);

                vehicleMarkers.set(vehicleRef, marker);

                marker.on("popupopen", () => {
                    lastOpenedFleetNumber = vehicleRef;
                    popupWasOpen = true;
                });

                marker.on("popupclose", () => {
                    lastOpenedFleetNumber = null;
                    popupWasOpen = false;
                });
            }
        });

        if (
            popupWasOpen &&
            lastOpenedFleetNumber &&
            vehicleMarkers.has(lastOpenedFleetNumber)
        ) {
            vehicleMarkers.get(lastOpenedFleetNumber).openPopup();
        }
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
    }
}

document
    .getElementById("requirementsCheckbox")
    .addEventListener("change", fetchVehicleData);

document
  .getElementById("firstCheckbox")
  .addEventListener("change", fetchVehicleData);

document
  .getElementById("stagecoachCheckbox")
  .addEventListener("change", fetchVehicleData);

// Initial fetch of vehicle locations
fetchVehicleData();

// Poll for updates every 10 seconds
setInterval(fetchVehicleData, 10000);

let fetchTimeout;

// Fetch data after the user stops moving the map for 1 second
map.on("moveend", () => {
    clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(fetchVehicleData, 1000);
});