import React, { useState, useEffect } from 'react';
import { Save, Image, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { API_BASE_URL } from '../../config';
import { getPublicIdFromUrl, deleteCloudinaryAsset } from '../../services/cloudinary';

const HomepageImages: React.FC = () => {
  const { accessToken } = useAuth();
  const { settings, updateLocalSettings } = useStore();
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [images, setImages] = useState({
    spotlight: '',
    aboutMain: '',
    aboutSecondary: '',
  });

  const [spotlightText, setSpotlightText] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
  });

  useEffect(() => {
    const loadSettings = () => {
      if (settings) {
        setImages({
          spotlight: settings.homepageImages?.spotlight || 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop',
          aboutMain: settings.homepageImages?.about?.main || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
          aboutSecondary: settings.homepageImages?.about?.secondary || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
        });
        setSpotlightText({
          name: settings.homepageImages?.spotlightName || 'Restorative Peptide Serum',
          description: settings.homepageImages?.spotlightDescription || 'A concentrated multi-peptide serum designed to target visible signs of aging, restore firmness, and deeply hydrate the skin.',
          price: (settings.homepageImages?.spotlightPrice !== undefined ? settings.homepageImages.spotlightPrice : 85).toString(),
          oldPrice: (settings.homepageImages?.spotlightOldPrice !== undefined ? settings.homepageImages.spotlightOldPrice : 110).toString(),
        });
      }
      setLoading(false);
    };
    loadSettings();
  }, [settings]);

  const handleImageUpload = async (file: File, field: 'spotlight' | 'aboutMain' | 'aboutSecondary') => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WEBP image uploads are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be less than 5MB.');
      return;
    }

    setUploadingField(field);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        const oldUrl = images[field];
        const oldPublicId = getPublicIdFromUrl(oldUrl);
        if (oldPublicId && accessToken) {
          await deleteCloudinaryAsset(oldPublicId, accessToken);
        }
        setImages((prev) => ({ ...prev, [field]: data.url }));
        toast.success(`${field === 'spotlight' ? 'Spotlight' : 'About Section'} image uploaded successfully!`);
      } else {
        const err = await response.json();
        toast.error(err.message || 'Image upload failed.');
      }
    } catch (error) {
      console.error('Image Upload Error:', error);
      toast.error('Image upload failed.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    if (!accessToken) return;

    try {
      const payload = {
        ...settings,
        homepageImages: {
          spotlight: images.spotlight,
          spotlightName: spotlightText.name,
          spotlightDescription: spotlightText.description,
          spotlightPrice: parseFloat(spotlightText.price) || 0,
          spotlightOldPrice: spotlightText.oldPrice ? parseFloat(spotlightText.oldPrice) : null,
          about: {
            main: images.aboutMain,
            secondary: images.aboutSecondary,
          },
        },
      };

      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        updateLocalSettings(data.settings);
        toast.success('Homepage images updated successfully!');
      } else {
        toast.error('Failed to update homepage images.');
      }
    } catch (error) {
      console.error('Error updating homepage images:', error);
      toast.error('Failed to update homepage images.');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Homepage Content">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Homepage Images">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Homepage Images</h2>
            <p className="text-gray-500">Configure Spotlight Formulation and About section editorial images</p>
          </div>
          <Button icon={Save} onClick={handleSave} className="py-3 px-5 text-sm font-bold shadow-lg shadow-indigo-500/10">
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Spotlight Formulation Image Card */}
          <Card title="Spotlight Formulation Image" icon={Image}>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                This image displays inside the flagship product close-up section (Spotlight Formulation) on the homepage.
              </p>

              {/* Preview Block */}
              <div className="relative aspect-[16/10] bg-slate-50 border rounded-2xl overflow-hidden flex items-center justify-center border-slate-100 shadow-inner group">
                <img
                  src={images.spotlight}
                  alt="Spotlight Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).src = 'https://placehold.co/800x500?text=Spotlight+Image+Preview';
                  }}
                />
                {/* Clickable Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                  <label className="text-white text-xs font-semibold cursor-pointer px-4 py-2 bg-black/60 rounded-full hover:bg-black/80 transition flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'spotlight');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingField === 'spotlight' && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw size={24} className="animate-spin" />
                    <span className="text-xs font-bold font-sans">Uploading Cover...</span>
                  </div>
                )}
              </div>

              {/* File upload / url inputs */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={images.spotlight}
                    onChange={(e) => setImages({ ...images, spotlight: e.target.value })}
                    placeholder="Enter spotlight image URL..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                  />
                  <label className="px-4 py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:bg-slate-800 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'spotlight');
                      }}
                      className="hidden"
                    />
                    <Upload size={14} />
                    Upload
                  </label>
                </div>

                {/* Product Text Details */}
                <div className="space-y-4 pt-3 border-t border-slate-100 mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Spotlight Product Name</label>
                    <input
                      type="text"
                      value={spotlightText.name}
                      onChange={(e) => setSpotlightText({ ...spotlightText, name: e.target.value })}
                      placeholder="e.g. Restorative Peptide Serum"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm animate-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={spotlightText.description}
                      onChange={(e) => setSpotlightText({ ...spotlightText, description: e.target.value })}
                      placeholder="Enter product description..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={spotlightText.price}
                        onChange={(e) => setSpotlightText({ ...spotlightText, price: e.target.value })}
                        placeholder="85.00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Compare At Price (₹)</label>
                      <input
                        type="number"
                        value={spotlightText.oldPrice}
                        onChange={(e) => setSpotlightText({ ...spotlightText, oldPrice: e.target.value })}
                        placeholder="110.00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* About Section Main Editorial Image Card */}
          <Card title="About Section — Main Image" icon={Image}>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                This represents the large portrait image displayed inside the "About Tree Born" editorial block on the homepage.
              </p>

              {/* Preview Block */}
              <div className="relative aspect-[16/10] bg-slate-50 border rounded-2xl overflow-hidden flex items-center justify-center border-slate-100 shadow-inner group">
                <img
                  src={images.aboutMain}
                  alt="About Main Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).src = 'https://placehold.co/800x500?text=About+Main+Image+Preview';
                  }}
                />
                {/* Clickable Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                  <label className="text-white text-xs font-semibold cursor-pointer px-4 py-2 bg-black/60 rounded-full hover:bg-black/80 transition flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'aboutMain');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingField === 'aboutMain' && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw size={24} className="animate-spin" />
                    <span className="text-xs font-bold font-sans">Uploading Cover...</span>
                  </div>
                )}
              </div>

              {/* File upload / url inputs */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={images.aboutMain}
                    onChange={(e) => setImages({ ...images, aboutMain: e.target.value })}
                    placeholder="Enter main about image URL..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                  />
                  <label className="px-4 py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:bg-slate-800 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'aboutMain');
                      }}
                      className="hidden"
                    />
                    <Upload size={14} />
                    Upload
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* About Section Secondary/Overlapping Image Card */}
          <Card title="About Section — Secondary Overlapping Image" icon={Image}>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                This represents the small overlapping square image at the bottom left of the editorial about block.
              </p>

              {/* Preview Block */}
              <div className="relative aspect-[16/10] bg-slate-50 border rounded-2xl overflow-hidden flex items-center justify-center border-slate-100 shadow-inner group">
                <img
                  src={images.aboutSecondary}
                  alt="About Secondary Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).src = 'https://placehold.co/800x500?text=About+Secondary+Image+Preview';
                  }}
                />
                {/* Clickable Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                  <label className="text-white text-xs font-semibold cursor-pointer px-4 py-2 bg-black/60 rounded-full hover:bg-black/80 transition flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'aboutSecondary');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingField === 'aboutSecondary' && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw size={24} className="animate-spin" />
                    <span className="text-xs font-bold font-sans">Uploading Cover...</span>
                  </div>
                )}
              </div>

              {/* File upload / url inputs */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={images.aboutSecondary}
                    onChange={(e) => setImages({ ...images, aboutSecondary: e.target.value })}
                    placeholder="Enter secondary about image URL..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                  />
                  <label className="px-4 py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:bg-slate-800 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'aboutSecondary');
                      }}
                      className="hidden"
                    />
                    <Upload size={14} />
                    Upload
                  </label>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
};

export default HomepageImages;
