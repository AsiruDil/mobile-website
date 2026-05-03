import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const BUCKET_NAME = 'report_incident_images';

const uploadImageToSupabase = async (file) => {
  const fileName = `news/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Image upload failed: ${err}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
};

const deleteImageFromSupabase = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const marker = `/object/public/${BUCKET_NAME}/`;
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return;
    const filePath = imageUrl.substring(idx + marker.length);
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
    });
  } catch (e) {
    console.warn('Could not delete old image:', e);
  }
};

const ManageNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/news');
      setNewsList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to load news', { position: "top-center" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields', { position: "top-center" });
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl = editingNews?.imageUrl || null;

      // පින්තූරයක් තෝරා තිබේ නම් පමණක් Upload කරන්න (Logic Fixed)
      if (imageFile) {
        toast.loading('Uploading image...', { id: 'img-upload', position: "top-center" });
        
        // පරණ පින්තූරය මකා දැමීම
        if (editingNews?.imageUrl) {
          await deleteImageFromSupabase(editingNews.imageUrl);
        }
        
        imageUrl = await uploadImageToSupabase(imageFile);
        toast.dismiss('img-upload');
      }

      // පින්තූරය ඉවත් කර ඇත්නම් URL එක null කිරීම
      if (!imagePreview && !imageFile && editingNews?.imageUrl) {
        await deleteImageFromSupabase(editingNews.imageUrl);
        imageUrl = null;
      }

      const payload = { title: formData.title, description: formData.description, imageUrl };

      if (editingNews) {
        await api.put(`/api/admin/news/${editingNews.id}`, payload);
        toast.success('News updated successfully', { position: "top-center" });
      } else {
        await api.post('/api/admin/news', payload);
        toast.success('News created successfully', { position: "top-center" });
      }

      resetForm();
      fetchNews();
    } catch (error) {
      toast.dismiss('img-upload');
      toast.error(error.response?.data?.message || error.message || 'An error occurred', { position: "top-center" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (news) => {
    try {
      await api.delete(`/api/admin/news/${news.id}`);
      if (news.imageUrl) await deleteImageFromSupabase(news.imageUrl);
      toast.success('News deleted successfully', { position: "top-center" });
      setModalConfig({ isOpen: false });
      fetchNews();
    } catch (error) {
      toast.error('Failed to delete news', { position: "top-center" });
    }
  };

  const handleToggleStatus = async (newsId, currentStatus) => {
    try {
      await api.patch(`/api/admin/news/${newsId}/status`, { enabled: !currentStatus });
      toast.success(`News ${!currentStatus ? 'enabled' : 'disabled'} successfully`, { position: "top-center" });
      setModalConfig({ isOpen: false });
      fetchNews();
    } catch (error) {
      toast.error('Failed to update news status', { position: "top-center" });
    }
  };

  const handleEdit = (news) => {
    setEditingNews(news);
    setFormData({ title: news.title, description: news.description });
    setImagePreview(news.imageUrl || null);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setImagePreview(null);
    setImageFile(null);
    setEditingNews(null);
    setIsFormOpen(false);
  };

  const filteredNews = newsList.filter(news =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manage News</h1>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Post New News
        </button>
      </div>

      <div className="relative w-72 mb-6">
        <input
          type="text"
          placeholder="Search title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingNews ? 'Edit News' : 'Post New News'}
            </h2>
            <button onClick={resetForm} className="p-1 hover:bg-gray-200 rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">News Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">News Image</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : 'Click to upload image'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                {imagePreview && (
                  <div className="w-24 h-24 relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg border" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
                {isSubmitting ? 'Saving...' : editingNews ? 'Update News' : 'Post News'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Title</th>
              <th className="p-4 font-semibold text-gray-600">Description</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : filteredNews.map((news) => (
              <tr key={news.id} className="border-b hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {news.imageUrl ? <img src={news.imageUrl} className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center"><Upload className="w-4 h-4 text-gray-400" /></div>}
                    <span className="truncate max-w-[200px]">{news.title}</span>
                  </div>
                </td>
                <td className="p-4 max-w-xs truncate text-gray-600">{news.description}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${news.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                    {news.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEdit(news)} className="p-2 text-blue-600"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(news)} className="p-2 text-red-600"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        isDanger={modalConfig.isDanger}
      />
    </div>
  );
};

export default ManageNews;