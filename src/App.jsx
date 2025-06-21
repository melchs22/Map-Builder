// Required dependencies:
// react, react-dom, react-leaflet, leaflet, react-leaflet-draw, tailwindcss, file-saver

import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { saveAs } from "file-saver";
import L from "leaflet";

const UGANDA_LOCATIONS = [
  // Cities
  "Kampala City", "Arua City", "Fort Portal City", "Gulu City", "Hoima City",
  "Jinja City", "Lira City", "Masaka City", "Mbale City", "Mbarara City", "Soroti City",
  // Districts
  "Abim", "Adjumani", "Agago", "Alebtong", "Amolatar", "Amudat", "Amuria", "Amuru", "Apac", "Arua",
  "Budaka", "Bududa", "Bugiri", "Bugweri", "Buhweju", "Buikwe", "Bukedea", "Bukomansimbi", "Bukwo",
  "Bulambuli", "Buliisa", "Bundibugyo", "Bunyangabu", "Bushenyi", "Busia", "Butaleja", "Butambala",
  "Butebo", "Buvuma", "Buyende", "Dokolo", "Gomba", "Gulu", "Hoima", "Ibanda", "Iganga", "Isingiro",
  "Jinja", "Kaabong", "Kabale", "Kabarole", "Kaberamaido", "Kagadi", "Kakingol", "Kakumiro", "Kalangala",
  "Kaliro", "Kalungu", "Kamuli", "Kamwenge", "Kanungu", "Kapchorwa", "Karenga", "Kasanda", "Kasese",
  "Katakwi", "Kayunga", "Kibaale", "Kiboga", "Kibuku", "Kikuube", "Kiruhura", "Kiryandongo", "Kisoro",
  "Kitagwenda", "Kitgum", "Koboko", "Kole", "Kotido", "Kumi", "Kwania", "Kween", "Kyankwanzi",
  "Kyegegwa", "Kyenjojo", "Kyotera", "Lamwo", "Lira", "Luuka", "Luwero", "Lwengo", "Lyantonde",
  "Madi-Okollo", "Manafwa", "Maracha", "Masaka", "Masindi", "Mayuge", "Mbale", "Mbarara", "Mitooma",
  "Mityana", "Moroto", "Moyo", "Mpigi", "Mubende", "Mukono", "Nabilatuk", "Nakapiripirit", "Nakaseke",
  "Nakasongola", "Namayingo", "Namisindwa", "Namutumba", "Napak", "Nebbi", "Ngora", "Ntoroko",
  "Ntungamo", "Nwoya", "Obongi", "Omoro", "Otuke", "Oyam", "Pader", "Pakwach", "Pallisa", "Rakai",
  "Rubanda", "Rubirizi", "Rukiga", "Rukungiri", "Rwampara", "Serere", "Sheema", "Sironko", "Soroti",
  "Tororo", "Wakiso", "Yumbe", "Zombo"
];

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(UGANDA_LOCATIONS[0]);
  const [geoData, setGeoData] = useState({});
  const [pasteText, setPasteText] = useState("");
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const featureGroupRef = useRef();

  const onCreated = (e) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();
    setGeoData(prev => ({ ...prev, [selectedLocation]: geoJson.geometry }));
  };

  const onDeleted = () => {
    setGeoData(prev => {
      const updated = { ...prev };
      delete updated[selectedLocation];
      return updated;
    });
  };

  const handlePasteGeometry = () => {
    try {
      const parsed = JSON.parse(pasteText);
      
      // Validate that it's a valid MultiPolygon or Polygon geometry
      if (parsed.type === "MultiPolygon" || parsed.type === "Polygon") {
        setGeoData(prev => ({ ...prev, [selectedLocation]: parsed }));
        setPasteText("");
        setShowPasteDialog(false);
        
        // Clear existing layers for this location and add the new one
        if (featureGroupRef.current) {
          featureGroupRef.current.clearLayers();
          const geoJsonLayer = L.geoJSON(parsed);
          featureGroupRef.current.addLayer(geoJsonLayer);
        }
      } else {
        alert("Please paste a valid Polygon or MultiPolygon geometry");
      }
    } catch (error) {
      alert("Invalid JSON format. Please check your input.");
    }
  };

  const clearCurrentGeometry = () => {
    setGeoData(prev => {
      const updated = { ...prev };
      delete updated[selectedLocation];
      return updated;
    });
    
    // Clear the map layers
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
  };

  const downloadJSON = () => {
    const data = UGANDA_LOCATIONS.map(name => ({
      name,
      geometry: geoData[name] || null
    }));
    const blob = new Blob([JSON.stringify({ districts: data }, null, 2)], {
      type: "application/json"
    });
    saveAs(blob, "uganda_districts_with_cities.json");
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 overflow-y-scroll bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Uganda Districts & Cities</h2>
        <div className="space-y-1">
          {UGANDA_LOCATIONS.map((loc) => (
            <button
              key={loc}
              className={`block w-full text-left px-2 py-1 rounded ${
                geoData[loc] ? "bg-green-200" : "bg-white"
              } hover:bg-blue-100`}
              onClick={() => setSelectedLocation(loc)}
            >
              {loc}
            </button>
          ))}
        </div>
        <button
          onClick={downloadJSON}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Download JSON
        </button>
        
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setShowPasteDialog(true)}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Paste Coordinates
          </button>
          
          <button
            onClick={clearCurrentGeometry}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Clear Current
          </button>
        </div>
        
        {geoData[selectedLocation] && (
          <div className="mt-4 p-2 bg-blue-50 rounded">
            <p className="text-sm font-semibold">Current geometry:</p>
            <p className="text-xs text-gray-600">{geoData[selectedLocation].type}</p>
          </div>
        )}
      </div>
      <div className="flex-1 relative">
        <MapContainer center={[1.3733, 32.2903]} zoom={7} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={onCreated}
              onDeleted={onDeleted}
              draw={{
                polyline: false,
                circle: false,
                marker: false,
                circlemarker: false,
                rectangle: false,
                polygon: true,
              }}
            />
            {/* Display existing geometry for current location */}
            {geoData[selectedLocation] && (
              <GeoJSON key={selectedLocation} data={geoData[selectedLocation]} />
            )}
          </FeatureGroup>
        </MapContainer>
        
        {/* Paste Dialog */}
        {showPasteDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-96">
              <h3 className="text-lg font-bold mb-4">Paste MultiPolygon/Polygon Coordinates</h3>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder='Paste GeoJSON geometry like:
{
  "type": "MultiPolygon",
  "coordinates": [[[[lng,lat],[lng,lat]...]]]
}'
                className="w-full h-40 p-2 border border-gray-300 rounded text-xs"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handlePasteGeometry}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setShowPasteDialog(false);
                    setPasteText("");
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
