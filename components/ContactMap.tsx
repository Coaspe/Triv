"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 37.51982729982202,
  lng: 127.02980518341066,
};

export default function ContactMap() {
  return (
    <div className="h-[400px] bg-gray-100">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={17}
          options={{
            styles: [
              {
                featureType: "all",
                elementType: "all",
                stylers: [],
              },
            ],
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
