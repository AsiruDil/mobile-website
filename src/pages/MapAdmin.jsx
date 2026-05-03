import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { Trash2, AlertTriangle, MapPin, ShieldAlert, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Green Icon for Admin Points
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
};

const MapAdmin = () => {
  const [sightings, setSightings] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [pointLocations, setPointLocations] = useState([]); 
  
  const [creationMode, setCreationMode] = useState(null); // 'ZONE' | 'POINT' | null
  const [tempCoords, setTempCoords] = useState(null);
  
  const [zoneForm, setZoneForm] = useState({ name: '', radius: 500 });
  // CHANGED: Default type is now an empty string instead of a pre-selected dropdown option
  const [pointForm, setPointForm] = useState({ name: '', type: '' });

  const fetchData = async () => {
    try {
      const [sightingsRes, zonesRes, pointsRes] = await Promise.all([
        api.get('/api/sightings'),
        api.get('/api/danger-zones'),
        api.get('/api/point-locations') 
      ]);
      setSightings(sightingsRes.data);
      setDangerZones(zonesRes.data);
      setPointLocations(pointsRes.data);
    } catch (err) {
      toast.error('Failed to load map data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (type, id) => {
    try {
      if (type === 'sighting') await api.delete(`/api/sightings/admin/${id}`);
      if (type === 'zone') await api.delete(`/api/admin/danger-zones/${id}`);
      if (type === 'point') await api.delete(`/api/admin/point-locations/${id}`); 
      toast.success('Item deleted successfully');
      fetchData();
    } catch (err) { toast.error('Failed to delete item'); }
  };

  const handleMapClick = (latlng) => {
    if (creationMode) setTempCoords({ latitude: latlng.lat, longitude: latlng.lng });
  };

  const saveData = async () => {
    if (!tempCoords) return toast.error('Please click a location on the map.');
    
    try {
      if (creationMode === 'ZONE') {
        if (!zoneForm.name) return toast.error('Zone needs a name');
        await api.post('/api/admin/danger-zones', { ...tempCoords, radius: Number(zoneForm.radius), name: zoneForm.name });
        toast.success('Danger Zone Created');
      } else if (creationMode === 'POINT') {
        if (!pointForm.name) return toast.error('Location needs a name');
        if (!pointForm.type) return toast.error('Please enter a custom type'); // Optional check
        
        await api.post('/api/admin/point-locations', { ...tempCoords, name: pointForm.name, type: pointForm.type });
        toast.success('Location Point Created');
      }
      
      setCreationMode(null);
      setTempCoords(null);
      setZoneForm({ name: '', radius: 500 });
      setPointForm({ name: '', type: '' }); // Reset to empty
      fetchData();
    } catch (err) { toast.error('Failed to save data'); }
  };

  return (
    <div className="max-w-7xl mx-auto h-[85vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="text-emerald-600" /> Live Map Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setCreationMode(creationMode === 'POINT' ? null : 'POINT'); setTempCoords(null); }}
            className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${creationMode === 'POINT' ? 'bg-red-500' : 'bg-blue-600'}`}
          >
            {creationMode === 'POINT' ? 'Cancel' : '+ Add Location Point'}
          </button>
          <button
            onClick={() => { setCreationMode(creationMode === 'ZONE' ? null : 'ZONE'); setTempCoords(null); }}
            className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${creationMode === 'ZONE' ? 'bg-red-500' : 'bg-emerald-600'}`}
          >
            {creationMode === 'ZONE' ? 'Cancel' : '+ Add Danger Zone'}
          </button>
        </div>
      </div>

      {/* Danger Zone Form */}
      {creationMode === 'ZONE' && (
        <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-4 items-end border border-emerald-100">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Zone Name</label>
            <input type="text" value={zoneForm.name} onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:border-emerald-500" placeholder="e.g., Active Crossing Area"/>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Radius (Meters)</label>
            <input type="number" value={zoneForm.radius} onChange={(e) => setZoneForm({...zoneForm, radius: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:border-emerald-500" />
          </div>
          <button onClick={saveData} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold hover:bg-emerald-700">Save Zone</button>
          <p className="text-sm text-gray-500 mb-2 ml-4"><strong>Step 2:</strong> Click map to set center.</p>
        </div>
      )}

      {/* CHANGED: Location Point Form - Replaced <select> with a text input */}
      {creationMode === 'POINT' && (
        <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-4 items-end border border-blue-100">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Location Name</label>
            <input 
              type="text" 
              value={pointForm.name} 
              onChange={(e) => setPointForm({...pointForm, name: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded outline-none focus:border-blue-500" 
              placeholder="e.g., Mahaweli River"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Custom Type</label>
            <input 
              type="text" 
              value={pointForm.type} 
              onChange={(e) => setPointForm({...pointForm, type: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded outline-none focus:border-blue-500" 
              placeholder="e.g., Safe Zone, Water Source, Ranger Post..."
            />
          </div>
          <button onClick={saveData} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Save Point</button>
          <p className="text-sm text-gray-500 mb-2 ml-4"><strong>Step 2:</strong> Click map to place pin.</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-grow rounded-xl overflow-hidden border shadow relative z-0">
          <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <MapClickHandler onMapClick={handleMapClick} />
            
            {/* Previews */}
            {tempCoords && creationMode === 'ZONE' && <Circle center={[tempCoords.latitude, tempCoords.longitude]} radius={Number(zoneForm.radius)} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }} />}
            {tempCoords && creationMode === 'POINT' && <Marker position={[tempCoords.latitude, tempCoords.longitude]} icon={greenIcon} />}

            {dangerZones.map(zone => (
              <Circle key={zone.id} center={[zone.latitude, zone.longitude]} radius={zone.radius} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.3 }}>
                <Popup><div className="font-bold text-red-600 text-center"><AlertTriangle size={16} className="inline mr-1"/>{zone.name}</div></Popup>
              </Circle>
            ))}

            {pointLocations.map(point => (
              <Marker key={point.id} position={[point.latitude, point.longitude]} icon={greenIcon}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-emerald-700">{point.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">Type: {point.type}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {sightings.map(sighting => (
              <Marker key={sighting.id} position={[sighting.latitude, sighting.longitude]}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800"><MapPin size={16} className="inline mr-1"/> Reported Sighting</h3>
                    <p className="text-xs text-gray-500 mb-2">By: {sighting.reportedBy}</p>
                    <button onClick={() => handleDelete('sighting', sighting.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs mt-2 hover:bg-red-200">Delete Pin</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Danger Zones List */}
          <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2"><AlertTriangle className="text-red-500" size={18} /> Danger Zones</h2>
            {dangerZones.length === 0 ? <p className="text-xs text-gray-500 italic">No active zones.</p> : (
              <ul className="space-y-2">
                {dangerZones.map(z => (
                  <li key={z.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-100 shadow-sm">
                    <div>
                      <p className="font-bold text-xs text-red-800">{z.name}</p>
                      <p className="text-[10px] text-red-500 font-medium">Radius: {z.radius}m</p>
                    </div>
                    <button onClick={() => handleDelete('zone', z.id)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Points List */}
          <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2"><Crosshair className="text-blue-500" size={18} /> Location Points</h2>
            {pointLocations.length === 0 ? <p className="text-xs text-gray-500 italic">No active points.</p> : (
              <ul className="space-y-2">
                {pointLocations.map(p => (
                  <li key={p.id} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
                    <div>
                      <p className="font-bold text-xs text-blue-800">{p.name}</p>
                      <p className="text-[10px] text-blue-500 font-medium">{p.type}</p>
                    </div>
                    <button onClick={() => handleDelete('point', p.id)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapAdmin;