import { Fragment, useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";

function App() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [stopInfo, setStopInfo] = useState([]);

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
    const refreshData = () => {
      if (isLoaded && directionsService && userLocation) {
        const markers = getMarkers();
        const sortedMarkers = markers.sort((a, b) => a.order - b.order);
        const waypoints = sortedMarkers.slice(0, -1).map((marker) => ({
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
            const stopInfo = [];
            const promises = legs.map((leg, index) => {
              return reverseGeocode(
                leg.end_location.lat(),
                leg.end_location.lng()
              )
                .then((data) => {
                  const eta = leg.duration.text;
                  const distance = leg.distance.text;
                  const name = `${data?.results[0]?.formatted_address} (${sortedMarkers[index].name})`;
                  const order = sortedMarkers[index].order;
                  stopInfo[index] = { name, eta, order, distance };
                })
                .catch((error) =>
                  console.error("Error getting stop name: ", error)
                );
            });

            Promise.all(promises).then(() => {
              setStopInfo([...stopInfo]);
              setDirectionsResponse(result);
            });
          } else {
            console.error("Directions request failed due to " + status);
          }
        });
      }
    };

    const intervalId = setInterval(refreshData, 30000);

    return () => {
      clearInterval(intervalId);
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
    {
      id: 1,
      name: "Stop B",
      position: { lat: -1.939826787816454, lng: 30.0445426438232 },
      order: 1,
    },
    {
      id: 2,
      name: "Stop C",
      position: { lat: -1.9355377074007851, lng: 30.060163829002217 },
      order: 2,
    },
    {
      id: 3,
      name: "Stop D",
      position: { lat: -1.9358808342336546, lng: 30.08024820994666 },
      order: 3,
    },
    {
      id: 4,
      name: "Stop E",
      position: { lat: -1.9489196023037583, lng: 30.092607828989397 },
      order: 4,
    },
    {
      id: 5,
      name: "Stop F",
      position: { lat: -1.9592132952818164, lng: 30.106684061788073 },
      order: 5,
    },
    {
      id: 6,
      name: "Stop G",
      position: { lat: -1.9487480402200394, lng: 30.126596781356923 },
      order: 6,
    },
    {
      id: 7,
      name: "Stop H",
      position: { lat: -1.9365670876910166, lng: 30.13020167024439 },
      order: 7,
    },
  ];

  return (
    <Fragment>
      <div className="relative">
        <div
          className="absolute top-0 left-0 m-4 p-4 bg-white rounded-md shadow-md z-10 overflow-y-auto"
          style={{ maxWidth: "300px", maxHeight: "calc(100vh - 2rem)" }}
        >
          {stopInfo.map((info, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="bg-gray-200 rounded-md p-2">
                {index === 0 ? (
                  <div className="font-semibold text-green-600">
                    Your Location - {info.name}
                  </div>
                ) : (
                  <div className="font-semibold">
                    {stopInfo[index - 1].name} - {info.name}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Distance: {info.distance}
                </div>
                <div className="text-sm text-gray-600">Time: {info.eta}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          id="map"
          style={{ height: "100vh", width: "100%" }}
          className="w-full h-screen"
        >
          {isLoaded && !loadError && userLocation ? (
            <GoogleMap
              center={userLocation}
              zoom={13}
              mapContainerStyle={{ width: "100%", height: "100vh" }}
            >
              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
              )}
            </GoogleMap>
          ) : (
            <div>Error loading map</div>
          )}
        </div>
      </div>
    </Fragment>
  );
}

export default App;
