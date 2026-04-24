// frontend/src/pages/dashboard/owner/EditListing.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { getVehicleById, updateListing } from '../../../services/listings.service';
import { uploadImage } from '../../../services/storage.service';
import LocationPicker from '../../../components/LocationPicker';
import ImageUpload from '../../../components/ImageUpload';
import AvailabilityCalendar from '../../../components/AvailabilityCalendar';

const EditListing = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const vehicle = await getVehicleById(vehicleId);
        if (vehicle.ownerId !== user.uid) {
          alert('Unauthorized');
          navigate('/dashboard/owner/listings');
          return;
        }
        setFormData({
          name: vehicle.name,
          type: vehicle.type,
          brand: vehicle.brand,
          model: vehicle.model || '',
          year: vehicle.year || '',
          description: vehicle.description || '',
          listingType: vehicle.listingType,
          pricePerDay: vehicle.pricePerDay || '',
          pricePerHour: vehicle.pricePerHour || '',
          salePrice: vehicle.salePrice || '',
          driverAvailable: vehicle.driverAvailable || false,
          driverFeePerDay: vehicle.driverFeePerDay || '',
          horsePower: vehicle.horsePower || '',
          weight: vehicle.weight || '',
          fuelType: vehicle.fuelType || '',
          capacity: vehicle.capacity || '',
          location: vehicle.location,
          images: vehicle.images || [],
          unavailableDates: vehicle.bookedDates || [],
        });
      } catch (err) {
        alert('Failed to load vehicle');
        navigate('/dashboard/owner/listings');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleId, user.uid, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name required';
      if (!formData.type) newErrors.type = 'Type required';
      if (!formData.listingType) newErrors.listingType = 'Listing type required';
    } else if (step === 2) {
      if (formData.listingType === 'rent' || formData.listingType === 'both') {
        if (!formData.pricePerDay) newErrors.pricePerDay = 'Daily price required';
      }
      if (formData.listingType === 'sale' || formData.listingType === 'both') {
        if (!formData.salePrice) newErrors.salePrice = 'Sale price required';
      }
      if (formData.driverAvailable && !formData.driverFeePerDay) {
        newErrors.driverFeePerDay = 'Driver fee required';
      }
    } else if (step === 3) {
      if (!formData.location || !formData.location.lat) newErrors.location = 'Pickup location required';
      if (formData.images.length === 0) newErrors.images = 'At least one image required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleImageUpload = async (files) => {
    const urls = [];
    for (const file of files) {
      const url = await uploadImage(file, `vehicles/${user.uid}/${Date.now()}_${file.name}`);
      urls.push(url);
      setUploadProgress((urls.length / files.length) * 100);
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploadProgress(0);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const updateData = {
        ...formData,
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        driverFeePerDay: formData.driverFeePerDay ? parseFloat(formData.driverFeePerDay) : null,
        year: parseInt(formData.year) || null,
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng,
          address: formData.location.address,
        },
        bookedDates: formData.unavailableDates,
      };
      await updateListing(vehicleId, updateData);
      navigate('/dashboard/owner/listings', { state: { toast: 'Listing updated!' } });
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  if (!formData) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 text-center ${s <= step ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${s <= step ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>{s}</div>
              <div className="text-xs mt-1">{s===1?'Basic':s===2?'Pricing':'Media'}</div>
            </div>
          ))}
        </div>
      </div>
      <form>
        {step===1 && (
          <div className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" />
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border p-2 rounded">
              <option>Excavator</option><option>Bulldozer</option><option>Crane</option><option>Loader</option><option>Backhoe</option>
            </select>
            <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" className="w-full border p-2 rounded" />
            <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" className="w-full border p-2 rounded" />
            <input name="year" value={formData.year} onChange={handleChange} placeholder="Year" className="w-full border p-2 rounded" />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="3" className="w-full border p-2 rounded" />
            <select name="listingType" value={formData.listingType} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="rent">For Rent</option><option value="sale">For Sale</option><option value="both">Both</option>
            </select>
          </div>
        )}
        {step===2 && (
          <div className="space-y-4">
            {(formData.listingType==='rent'||formData.listingType==='both') && (
              <input name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="Daily Rent (₹)" type="number" className="w-full border p-2 rounded" />
            )}
            {(formData.listingType==='sale'||formData.listingType==='both') && (
              <input name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="Sale Price (₹)" type="number" className="w-full border p-2 rounded" />
            )}
            <label className="flex items-center gap-2"><input type="checkbox" name="driverAvailable" checked={formData.driverAvailable} onChange={handleChange} /> Driver Available</label>
            {formData.driverAvailable && <input name="driverFeePerDay" value={formData.driverFeePerDay} onChange={handleChange} placeholder="Driver Fee/Day" type="number" className="w-full border p-2 rounded" />}
            <input name="horsePower" value={formData.horsePower} onChange={handleChange} placeholder="HP" className="w-full border p-2 rounded" />
            <input name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="w-full border p-2 rounded" />
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border p-2 rounded">
              <option>Diesel</option><option>Petrol</option><option>Electric</option>
            </select>
            <input name="capacity" value={formData.capacity} onChange={handleChange} placeholder="Capacity" className="w-full border p-2 rounded" />
          </div>
        )}
        {step===3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Location</h3>
              <LocationPicker initialLocation={formData.location} onLocationSelect={(loc) => setFormData(prev => ({...prev, location: loc}))} />
            </div>
            <div>
              <h3 className="font-semibold">Images</h3>
              <ImageUpload onUpload={handleImageUpload} multiple />
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.images.map((img,i)=>(
                  <div key={i} className="relative"><img src={img} className="h-20 w-20 object-cover rounded" /><button onClick={()=>removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button></div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Unavailable Dates</h3>
              <AvailabilityCalendar selectedDates={formData.unavailableDates} onDateSelect={(dates) => setFormData(prev => ({...prev, unavailableDates: dates}))} />
            </div>
          </div>
        )}
        <div className="flex justify-between mt-6">
          {step>1 && <button type="button" onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded">Back</button>}
          {step<3 && <button type="button" onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>}
          {step===3 && <button type="button" onClick={handleSubmit} disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">{submitting ? 'Saving...' : 'Update Listing'}</button>}
        </div>
      </form>
    </div>
  );
};

export default EditListing;