// frontend/src/pages/dashboard/owner/AddListing.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { createListing } from '../../../services/listings.service';
import { uploadImage } from '../../../services/storage.service';
import LocationPicker from '../../../components/LocationPicker';
import ImageUpload from '../../../components/ImageUpload';
import AvailabilityCalendar from '../../../components/AvailabilityCalendar';

const AddListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    description: '',
    listingType: 'rent', // rent, sale, both
    // Step 2
    pricePerDay: '',
    pricePerHour: '',
    salePrice: '',
    driverAvailable: false,
    driverFeePerDay: '',
    horsePower: '',
    weight: '',
    fuelType: '',
    capacity: '',
    // Step 3
    location: null,
    images: [],
    unavailableDates: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('addListingDraft');
    if (draft) {
      const parsed = JSON.parse(draft);
      if (window.confirm('Load saved draft?')) {
        setFormData(parsed);
      }
    }
  }, []);

  // Save draft to localStorage on form change
  useEffect(() => {
    localStorage.setItem('addListingDraft', JSON.stringify(formData));
  }, [formData]);

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
      if (!formData.brand) newErrors.brand = 'Brand required';
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
    if (validateStep()) {
      setStep(step + 1);
    }
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
      const vehicleData = {
        ...formData,
        ownerId: user.uid,
        status: 'active',
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        driverFeePerDay: formData.driverFeePerDay ? parseFloat(formData.driverFeePerDay) : null,
        year: parseInt(formData.year),
        // Ensure location is GeoPoint compatible
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng,
          address: formData.location.address,
        },
        bookedDates: formData.unavailableDates,
      };
      await createListing(vehicleData);
      localStorage.removeItem('addListingDraft');
      navigate('/dashboard/owner/listings', { state: { toast: 'Listing added successfully!' } });
    } catch (err) {
      alert('Failed to create listing: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Add New Listing</h1>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 relative">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                s <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {s}
              </div>
              <div className="text-xs text-center mt-1">
                {s === 1 && 'Basic Info'}
                {s === 2 && 'Pricing & Specs'}
                {s === 3 && 'Location & Images'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {step === 1 && (
          <div className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Vehicle Name*" className="w-full border rounded p-2" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Type*</option>
              <option>Excavator</option><option>Bulldozer</option><option>Crane</option><option>Loader</option><option>Backhoe</option>
              <option>Dump Truck</option><option>Forklift</option><option>Grader</option><option>Roller</option>
            </select>
            <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand*" className="w-full border rounded p-2" />
            <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" className="w-full border rounded p-2" />
            <input name="year" value={formData.year} onChange={handleChange} placeholder="Year" type="number" className="w-full border rounded p-2" />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="3" className="w-full border rounded p-2" />
            <select name="listingType" value={formData.listingType} onChange={handleChange} className="w-full border rounded p-2">
              <option value="rent">For Rent Only</option>
              <option value="sale">For Sale Only</option>
              <option value="both">Both Rent and Sale</option>
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {(formData.listingType === 'rent' || formData.listingType === 'both') && (
              <>
                <input name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="Daily Rent (₹)*" type="number" className="w-full border rounded p-2" />
                <input name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} placeholder="Hourly Rent (optional)" type="number" className="w-full border rounded p-2" />
              </>
            )}
            {(formData.listingType === 'sale' || formData.listingType === 'both') && (
              <input name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="Sale Price (₹)*" type="number" className="w-full border rounded p-2" />
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" name="driverAvailable" checked={formData.driverAvailable} onChange={handleChange} />
              Driver Available
            </label>
            {formData.driverAvailable && (
              <input name="driverFeePerDay" value={formData.driverFeePerDay} onChange={handleChange} placeholder="Driver Fee per Day (₹)" type="number" className="w-full border rounded p-2" />
            )}
            <input name="horsePower" value={formData.horsePower} onChange={handleChange} placeholder="Horsepower (HP)" className="w-full border rounded p-2" />
            <input name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="w-full border rounded p-2" />
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Fuel Type</option><option>Diesel</option><option>Petrol</option><option>Electric</option><option>Hybrid</option>
            </select>
            <input name="capacity" value={formData.capacity} onChange={handleChange} placeholder="Capacity (tons/liters)" className="w-full border rounded p-2" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Pickup Location</h3>
              <LocationPicker onLocationSelect={(loc) => setFormData(prev => ({ ...prev, location: loc }))} />
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Upload Images</h3>
              <ImageUpload onUpload={handleImageUpload} multiple />
              {uploadProgress > 0 && <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>}
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt="preview" className="h-20 w-20 object-cover rounded" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
                  </div>
                ))}
              </div>
              {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Mark Unavailable Dates (Optional)</h3>
              <AvailabilityCalendar onDateSelect={(dates) => setFormData(prev => ({ ...prev, unavailableDates: dates }))} />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && <button type="button" onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded">Back</button>}
          {step < 3 && <button type="button" onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>}
          {step === 3 && <button type="button" onClick={handleSubmit} disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">{submitting ? 'Creating...' : 'Submit Listing'}</button>}
        </div>
      </form>
    </div>
  );
};

export default AddListing;