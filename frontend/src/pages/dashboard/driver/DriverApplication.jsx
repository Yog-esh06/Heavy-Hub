// frontend/src/pages/dashboard/driver/DriverApplication.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { applyAsDriver, getDriverProfile } from '../../../services/drivers.service';
import { uploadImage } from '../../../services/storage.service';
import LocationPicker from '../../../components/LocationPicker';
import ImageUpload from '../../../components/ImageUpload';

const DriverApplication = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    yearsOfExperience: '',
    vehicleTypes: [],
    feePerDay: '',
    currentLocation: null,
    documents: {
      licensePhoto: null,
      aadharPhoto: null,
      profilePhoto: null,
    },
  });
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getDriverProfile(user.uid);
        if (profile) {
          setApplicationStatus(profile.applicationStatus);
          setRejectionReason(profile.rejectionReason || '');
          if (profile.applicationStatus === 'approved') {
            // Already approved, but this component shouldn't render
          } else if (profile.applicationStatus === 'pending' || profile.applicationStatus === 'rejected') {
            // Pre-fill existing data
            setFormData({
              fullName: profile.fullName || '',
              phone: profile.phone || '',
              licenseNumber: profile.licenseNumber || '',
              licenseExpiry: profile.licenseExpiry || '',
              yearsOfExperience: profile.yearsOfExperience || '',
              vehicleTypes: profile.vehicleTypes || [],
              feePerDay: profile.feePerDay || '',
              currentLocation: profile.currentLocation || null,
              documents: {
                licensePhoto: profile.documents?.licensePhoto || null,
                aadharPhoto: profile.documents?.aadharPhoto || null,
                profilePhoto: profile.documents?.profilePhoto || null,
              },
            });
          }
        } else {
          setApplicationStatus('not_applied');
        }
      } catch (err) {
        console.error(err);
        setApplicationStatus('not_applied');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.uid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const vehicleTypes = formData.vehicleTypes.includes(value)
        ? formData.vehicleTypes.filter(v => v !== value)
        : [...formData.vehicleTypes, value];
      setFormData(prev => ({ ...prev, vehicleTypes }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({ ...prev, currentLocation: location }));
  };

  const handleDocumentUpload = async (file, docType) => {
    if (!file) return;
    try {
      setUploadProgress(prev => ({ ...prev, [docType]: 0 }));
      const url = await uploadImage(file, `drivers/${user.uid}/${docType}_${Date.now()}`);
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [docType]: url },
      }));
      setUploadProgress(prev => ({ ...prev, [docType]: 100 }));
      setTimeout(() => setUploadProgress(prev => ({ ...prev, [docType]: 0 })), 1000);
    } catch (err) {
      alert(`Failed to upload ${docType}`);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name required';
    if (!formData.phone) newErrors.phone = 'Phone number required';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number required';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date required';
    if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience required';
    if (formData.vehicleTypes.length === 0) newErrors.vehicleTypes = 'Select at least one vehicle type';
    if (!formData.feePerDay) newErrors.feePerDay = 'Daily fee required';
    if (!formData.currentLocation) newErrors.currentLocation = 'Current location required';
    if (!formData.documents.licensePhoto) newErrors.licensePhoto = 'License photo required';
    if (!formData.documents.aadharPhoto) newErrors.aadharPhoto = 'Aadhar photo required';
    if (!formData.documents.profilePhoto) newErrors.profilePhoto = 'Profile photo required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await applyAsDriver({
        userId: user.uid,
        email: user.email,
        ...formData,
        feePerDay: parseFloat(formData.feePerDay),
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        applicationStatus: 'pending',
        appliedAt: new Date().toISOString(),
      });
      setApplicationStatus('pending');
      alert('Application submitted successfully! We will review it shortly.');
    } catch (err) {
      alert('Failed to submit application: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReapply = () => {
    setApplicationStatus('not_applied');
    setFormData({
      fullName: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      yearsOfExperience: '',
      vehicleTypes: [],
      feePerDay: '',
      currentLocation: null,
      documents: { licensePhoto: null, aadharPhoto: null, profilePhoto: null },
    });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  // Pending state
  if (applicationStatus === 'pending') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Application Under Review</h2>
          <p className="text-yellow-700">Your driver application has been submitted. Our team will review your documents and get back to you within 2-3 business days.</p>
        </div>
      </div>
    );
  }

  // Rejected state
  if (applicationStatus === 'rejected') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Application Rejected</h2>
          <p className="text-red-700 mb-4">{rejectionReason || 'Your application did not meet our requirements.'}</p>
          <button onClick={handleReapply} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Reapply
          </button>
        </div>
      </div>
    );
  }

  // Application form
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Driver Application</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded p-2" />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded p-2" />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
        </div>

        {/* License Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">License Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">License Number *</label>
            <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full border rounded p-2" />
            {errors.licenseNumber && <p className="text-red-500 text-sm">{errors.licenseNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">License Expiry Date *</label>
            <input name="licenseExpiry" type="date" value={formData.licenseExpiry} onChange={handleChange} className="w-full border rounded p-2" />
            {errors.licenseExpiry && <p className="text-red-500 text-sm">{errors.licenseExpiry}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Years of Experience *</label>
            <input name="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleChange} className="w-full border rounded p-2" />
            {errors.yearsOfExperience && <p className="text-red-500 text-sm">{errors.yearsOfExperience}</p>}
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Vehicle Types Experienced *</h2>
          <div className="grid grid-cols-2 gap-2">
            {['tractor', 'harvester', 'jcb', 'excavator', 'bulldozer', 'crane', 'loader', 'forklift'].map(type => (
              <label key={type} className="flex items-center gap-2">
                <input type="checkbox" value={type} checked={formData.vehicleTypes.includes(type)} onChange={handleChange} />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
          {errors.vehicleTypes && <p className="text-red-500 text-sm">{errors.vehicleTypes}</p>}
        </div>

        {/* Fee & Location */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Service Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Daily Fee (₹) *</label>
            <input name="feePerDay" type="number" value={formData.feePerDay} onChange={handleChange} className="w-full border rounded p-2" />
            {errors.feePerDay && <p className="text-red-500 text-sm">{errors.feePerDay}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Location *</label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
            {errors.currentLocation && <p className="text-red-500 text-sm">{errors.currentLocation}</p>}
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Driving License Photo *</label>
            <ImageUpload onUpload={(files) => handleDocumentUpload(files[0], 'licensePhoto')} single />
            {uploadProgress.licensePhoto > 0 && <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress.licensePhoto}%` }}></div></div>}
            {formData.documents.licensePhoto && <img src={formData.documents.licensePhoto} alt="License" className="h-20 mt-2 rounded" />}
            {errors.licensePhoto && <p className="text-red-500 text-sm">{errors.licensePhoto}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Aadhar Card Photo *</label>
            <ImageUpload onUpload={(files) => handleDocumentUpload(files[0], 'aadharPhoto')} single />
            {uploadProgress.aadharPhoto > 0 && <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress.aadharPhoto}%` }}></div></div>}
            {formData.documents.aadharPhoto && <img src={formData.documents.aadharPhoto} alt="Aadhar" className="h-20 mt-2 rounded" />}
            {errors.aadharPhoto && <p className="text-red-500 text-sm">{errors.aadharPhoto}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profile Photo *</label>
            <ImageUpload onUpload={(files) => handleDocumentUpload(files[0], 'profilePhoto')} single />
            {uploadProgress.profilePhoto > 0 && <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress.profilePhoto}%` }}></div></div>}
            {formData.documents.profilePhoto && <img src={formData.documents.profilePhoto} alt="Profile" className="h-20 w-20 object-cover rounded-full mt-2" />}
            {errors.profilePhoto && <p className="text-red-500 text-sm">{errors.profilePhoto}</p>}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default DriverApplication;