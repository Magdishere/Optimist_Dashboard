import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAdminTheme } from '../theme/ThemeContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle,
  Navigation,
  Info,
  ChevronDown,
  ChevronUp,
  Map as MapIcon
} from 'lucide-react';
import Modal from '../components/Modal';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  const map = useMap();
  
  const eventHandlers = React.useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
};

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

const Locations = () => {
  const { theme } = useAdminTheme();
  const { token } = useSelector((state) => state.auth);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const initialHours = {
    open: '09:00',
    close: '21:00',
    isClosed: false
  };

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    coordinates: { lat: 33.8938, lng: 35.5018 },
    services: { dineIn: false, pickup: false, delivery: false },
    operatingHours: {
      monday: { ...initialHours },
      tuesday: { ...initialHours },
      wednesday: { ...initialHours },
      thursday: { ...initialHours },
      friday: { ...initialHours },
      saturday: { ...initialHours },
      sunday: { ...initialHours }
    }
  });

  const [mapCenter, setMapCenter] = useState([33.8938, 35.5018]);

  const fetchData = async () => {
    try {
      const res = await axios.get('https://optimist-backend-api.onrender.com/api/locations');
      setLocations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (location = null) => {
    if (location) {
      setCurrentLocation(location);
      const coords = { 
        lat: parseFloat(location.coordinates?.lat) || 33.8938, 
        lng: parseFloat(location.coordinates?.lng) || 35.5018 
      };
      setFormData({
        name: location.name,
        address: location.address,
        phone: location.phone,
        coordinates: coords,
        services: { 
          dineIn: location.services?.dineIn || false, 
          pickup: location.services?.pickup || false, 
          delivery: location.services?.delivery || false 
        },
        operatingHours: location.operatingHours || {
          monday: { ...initialHours },
          tuesday: { ...initialHours },
          wednesday: { ...initialHours },
          thursday: { ...initialHours },
          friday: { ...initialHours },
          saturday: { ...initialHours },
          sunday: { ...initialHours }
        }
      });
      setMapCenter([coords.lat, coords.lng]);
    } else {
      setCurrentLocation(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        coordinates: { lat: 33.8938, lng: 35.5018 },
        services: { dineIn: false, pickup: false, delivery: false },
        operatingHours: {
          monday: { ...initialHours },
          tuesday: { ...initialHours },
          wednesday: { ...initialHours },
          thursday: { ...initialHours },
          friday: { ...initialHours },
          saturday: { ...initialHours },
          sunday: { ...initialHours }
        }
      });
      setMapCenter([33.8938, 35.5018]);
    }
    setIsModalOpen(true);
  };

  const handleMapClick = (latlng) => {
    setFormData({
      ...formData,
      coordinates: { lat: latlng.lat, lng: latlng.lng }
    });
  };

  const handleHourChange = (day, field, value) => {
    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day],
          [field]: field === 'isClosed' ? value : value
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (currentLocation) {
        await axios.put(`https://optimist-backend-api.onrender.com/api/locations/${currentLocation._id}`, formData, config);
      } else {
        await axios.post('https://optimist-backend-api.onrender.com/api/locations', formData, config);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://optimist-backend-api.onrender.com/api/locations/${currentLocation._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div 
          className="flex items-center px-4 py-3 rounded-2xl border transition-all duration-300 w-full md:max-w-md shadow-sm"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Search size={20} className="opacity-40 mr-3" style={{ color: theme.text }} />
          <input
            type="text"
            placeholder="Search locations..."
            className="bg-transparent border-none outline-none w-full font-semibold"
            style={{ color: theme.text }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: theme.primary, color: theme.background }}
        >
          <Plus size={20} className="mr-2" />
          Add Location
        </button>
      </div>

      <div 
        className="rounded-3xl shadow-xl overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
            <thead>
              <tr style={{ backgroundColor: theme.surface, color: theme.primary }}>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Branch</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Contact</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Services</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Today's Hours</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.border }}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center font-bold opacity-50">Loading locations...</td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center font-bold opacity-50">No locations found</td>
                </tr>
              ) : filteredLocations.map((loc) => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const todayHours = loc.operatingHours?.[today];
                
                return (
                  <tr key={loc._id} className="hover:bg-opacity-50 transition-colors" style={{ color: theme.text }}>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-start">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 mr-3 shadow-sm">
                          <MapPin size={20} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold block text-sm md:text-base">{loc.name}</span>
                          <span className="text-[10px] md:text-xs opacity-60 line-clamp-1">{loc.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center text-xs md:text-sm font-semibold opacity-80">
                        <Phone size={14} className="mr-2 opacity-40" />
                        {loc.phone}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {loc.services?.dineIn && (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter" style={{ backgroundColor: '#D7CCC8', color: '#3E2723' }}>Dine-in</span>
                        )}
                        {loc.services?.pickup && (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter" style={{ backgroundColor: '#EFEBE9', color: '#5D4037' }}>Pickup</span>
                        )}
                        {loc.services?.delivery && (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter" style={{ backgroundColor: '#F5F5F5', color: '#8D6E63' }}>Delivery</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {todayHours?.isClosed ? (
                        <span className="text-red-500 font-black text-[10px] uppercase">Closed Today</span>
                      ) : (
                        <div className="flex items-center text-xs font-bold opacity-80">
                          <Clock size={14} className="mr-2 opacity-40" />
                          {todayHours?.open} - {todayHours?.close}
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 md:space-x-2">
                        <button 
                          onClick={() => handleOpenModal(loc)}
                          className="p-1.5 md:p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => { setCurrentLocation(loc); setIsDeleteModalOpen(true); }}
                          className="p-1.5 md:p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentLocation ? 'Edit Location' : 'Add New Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest opacity-40 border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase opacity-60 ml-1">Branch Name</label>
                <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <Info size={18} className="opacity-40 mr-3" />
                  <input
                    type="text"
                    className="bg-transparent border-none outline-none w-full font-semibold"
                    placeholder="e.g. Downtown Branch"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase opacity-60 ml-1">Phone Number</label>
                <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <Phone size={18} className="opacity-40 mr-3" />
                  <input
                    type="text"
                    className="bg-transparent border-none outline-none w-full font-semibold"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Address</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <MapPin size={18} className="opacity-40 mr-3" />
                <input
                  type="text"
                  className="bg-transparent border-none outline-none w-full font-semibold"
                  placeholder="Street Address, City, Zip"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase opacity-60 ml-1">Latitude</label>
                <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <Navigation size={18} className="opacity-40 mr-3 rotate-45" />
                  <input
                    type="number"
                    step="any"
                    className="bg-transparent border-none outline-none w-full font-semibold"
                    placeholder="40.7128"
                    value={formData.coordinates.lat}
                    onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, lat: parseFloat(e.target.value) || 0}})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase opacity-60 ml-1">Longitude</label>
                <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <Navigation size={18} className="opacity-40 mr-3 rotate-[135deg]" />
                  <input
                    type="number"
                    step="any"
                    className="bg-transparent border-none outline-none w-full font-semibold"
                    placeholder="-74.0060"
                    value={formData.coordinates.lng}
                    onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, lng: parseFloat(e.target.value) || 0}})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black uppercase opacity-60">Select from Map</label>
                <div className="flex items-center text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <MapIcon size={12} className="mr-1" /> Click map to pin
                </div>
              </div>
              <div className="h-64 rounded-2xl overflow-hidden border shadow-inner" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <MapContainer 
                  center={mapCenter} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker 
                    position={formData.coordinates} 
                    setPosition={handleMapClick} 
                  />
                  <ChangeView center={mapCenter} />
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest opacity-40 border-b pb-2">Available Services</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, services: {...formData.services, dineIn: !formData.services.dineIn}})}
                className={`p-3 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                  formData.services.dineIn ? 'bg-green-50 border-green-200 text-green-600 shadow-sm' : 'opacity-40 border-dashed'
                }`}
                style={{ borderColor: formData.services.dineIn ? undefined : theme.border }}
              >
                Dine-In
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, services: {...formData.services, pickup: !formData.services.pickup}})}
                className={`p-3 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                  formData.services.pickup ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-sm' : 'opacity-40 border-dashed'
                }`}
                style={{ borderColor: formData.services.pickup ? undefined : theme.border }}
              >
                Pickup
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, services: {...formData.services, delivery: !formData.services.delivery}})}
                className={`p-3 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                  formData.services.delivery ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'opacity-40 border-dashed'
                }`}
                style={{ borderColor: formData.services.delivery ? undefined : theme.border }}
              >
                Delivery
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest opacity-40 border-b pb-2">Operating Hours</h4>
            <div className="space-y-3">
              {days.map(day => (
                <div key={day} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-2xl bg-gray-50/50 border gap-3" style={{ borderColor: theme.border }}>
                  <div className="flex items-center justify-between md:justify-start">
                    <span className="w-24 font-black uppercase text-[10px] tracking-widest">{day}</span>
                    <label className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.operatingHours[day].isClosed}
                        onChange={(e) => handleHourChange(day, 'isClosed', e.target.checked)}
                      />
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${
                        formData.operatingHours[day].isClosed ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400 group-hover:bg-gray-300'
                      }`}>
                        {formData.operatingHours[day].isClosed ? 'Closed' : 'Open'}
                      </div>
                    </label>
                  </div>
                  
                  {!formData.operatingHours[day].isClosed && (
                    <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2">
                      <input
                        type="time"
                        className="bg-white border rounded-lg px-2 py-1 text-xs font-bold outline-none shadow-sm"
                        style={{ borderColor: theme.border }}
                        value={formData.operatingHours[day].open}
                        onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                      />
                      <span className="text-[10px] font-black opacity-30">TO</span>
                      <input
                        type="time"
                        className="bg-white border rounded-lg px-2 py-1 text-xs font-bold outline-none shadow-sm"
                        style={{ borderColor: theme.border }}
                        value={formData.operatingHours[day].close}
                        onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 sticky bottom-0 z-10"
            style={{ backgroundColor: theme.primary, color: theme.background }}
          >
            {currentLocation ? 'Update Location' : 'Create Location'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={40} />
          </div>
          <p className="font-bold text-lg" style={{ color: theme.text }}>
            Are you sure you want to delete branch <span className="text-red-500">{currentLocation?.name}</span>?
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest border transition-colors"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest bg-red-500 text-white shadow-lg active:scale-95 transition-transform"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Locations;
