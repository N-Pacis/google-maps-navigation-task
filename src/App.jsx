import { Fragment, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

function App() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [currentPositionName, setCurrentPositionName] = useState("");
  const [stopNames, setStopNames] = useState([]);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user's location: ", error);
      }
    );
  }, []);

  useEffect(() => {
    if (isLoaded && !loadError) {
      setDirectionsService(new window.google.maps.DirectionsService());
    }
  }, [isLoaded, loadError]);

  useEffect(() => {
    if (isLoaded && directionsService && userLocation) {
      const markers = getMarkers();
      const sortedMarkers = markers.slice().sort((a, b) => a.order - b.order);
      const waypoints = sortedMarkers.slice(1, -1).map((marker) => ({
        location: marker.position,
        stopover: true,
      }));

      const origin = userLocation;
      const destination = sortedMarkers[sortedMarkers.length - 1].position;

      const request = {
        origin,
        destination,
        waypoints,
        travelMode: "DRIVING",
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          const legs = result.routes[0].legs;
          const routes = [];
          const stopNames = [];

          legs.forEach((leg, index) => {
            if (index === 0) {
              reverseGeocode(leg.start_location.lat(), leg.start_location.lng())
                .then((data) =>
                  setCurrentPositionName(data.results[0].formatted_address)
                )
                .catch((error) =>
                  console.error("Error getting current position name: ", error)
                );
            }

            reverseGeocode(leg.end_location.lat(), leg.end_location.lng())
              .then((data) => {
                stopNames[index] = data.results[0].formatted_address;
                setStopNames([...stopNames]);
              })
              .catch((error) =>
                console.error("Error getting stop name: ", error)
              );

            routes[index] = { distance: leg.distance.value, duration: leg.duration.value };
          });

          setDirectionsResponse(result);
        } else {
          console.error("Directions request failed due to " + status);
        }
      });
    }
  }, [directionsService, userLocation]);

  const reverseGeocode = async (lat, lng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
        import.meta.env.VITE_MAP_API_KEY
      }`
    );
    const data = await response.json();
    return data;
  };

  const getMarkers = () => [
    userLocation && {
      id: 1,
      name: "Your Location",
      position: userLocation,
      order: 0,
    },
    {
      id: 2,
      name: "Stop A",
      position: { lat: -1.939826787816454, lng: 30.0445426438232 },
      order: 1,
    },
    {
      id: 3,
      name: "Stop B",
      position: { lat: -1.9355377074007851, lng: 30.060163829002217 },
      order: 2,
    },
    {
      id: 4,
      name: "Stop C",
      position: { lat: -1.9358808342336546, lng: 30.08024820994666 },
      order: 3,
    },
    {
      id: 5,
      name: "Stop D",
      position: { lat: -1.9489196023037583, lng: 30.092607828989397 },
      order: 4,
    },
    {
      id: 6,
      name: "Stop E",
      position: { lat: -1.9592132952818164, lng: 30.106684061788073 },
      order: 5,
    },
    {
      id: 7,
      name: "Stop F",
      position: { lat: -1.9487480402200394, lng: 30.126596781356923 },
      order: 6,
    },
    {
      id: 8,
      name: "Stop G",
      position: { lat: -1.9365670876910166, lng: 30.13020167024439 },
      order: 7,
    }
  ];

  return (
    <Fragment>
      <div style={{ margin: "1% 5%" }}>
        {stopNames.map((name, index) => (
          <div key={index}>
            <div>
              {index === 0
                ? `${currentPositionName} - ${name}`
                : `${stopNames[index - 1]} - ${name}`}
            </div>
          </div>
        ))}
      </div>
      <div id="map" style={{ height: "80vh", width: "90%", margin: "1% 5%" }}>
        {isLoaded && !loadError && userLocation ? (
          <GoogleMap
            center={userLocation}
            zoom={15}
            mapContainerStyle={{ width: "100%", height: "80vh" }}
          >
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
        ) : (
          <div>Error loading map</div>
        )}
      </div>
    </Fragment>
  );
}

export default App;