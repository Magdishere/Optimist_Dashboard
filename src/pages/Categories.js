import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAdminTheme } from '../theme/ThemeContext';
import { Plus, Edit2, Trash2, Search, Type, Hash, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/Modal';

const Categories = () => {
  const { theme } = useAdminTheme();
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      const res = await axios.get('https://optimist-backend-api.onrender.com/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive ?? true
      });
    } else {
      setCurrentCategory(null);
      setFormData({
        name: '',
        description: '',
        displayOrder: 0,
        isActive: true
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('displayOrder', formData.displayOrder);
    data.append('isActive', formData.isActive);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (currentCategory) {
        await axios.put(`https://optimist-backend-api.onrender.com/api/categories/${currentCategory._id}`, data, config);
      } else {
        await axios.post('https://optimist-backend-api.onrender.com/api/categories', data, config);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`https://optimist-backend-api.onrender.com/api/categories/${currentCategory._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop';
    
    // Check if it already contains a protocol or double slash
    if (imagePath.includes('//')) {
      // If it's malformed like "https//", fix it to "https://"
      if (imagePath.startsWith('http') && !imagePath.includes('://')) {
        return imagePath.replace('http', 'http:').replace('https:', 'https://').replace('http:', 'http://');
      }
      return imagePath;
    }
    
    return `https://optimist-backend-api.onrender.com${imagePath}`;
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
            placeholder="Search categories..."
            className="bg-transparent border-none outline-none w-full font-semibold"
            style={{ color: theme.text }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: theme.primary, color: theme.background }}
        >
          <Plus size={20} className="mr-2" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center font-bold opacity-50">Loading categories...</div>
        ) : currentItems.length === 0 ? (
          <div className="col-span-full py-20 text-center font-bold opacity-50">No categories found</div>
        ) : currentItems.map((cat) => (
          <div 
            key={cat._id} 
            className="group rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
          >
            <div className="h-40 overflow-hidden relative">
              <img 
                src={getImageUrl(cat.image)} 
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={() => handleOpenModal(cat)}
                  className="p-2 rounded-xl bg-white/90 text-blue-500 shadow-lg hover:bg-white transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => { setCurrentCategory(cat); setIsDeleteModalOpen(true); }}
                  className="p-2 rounded-xl bg-white/90 text-red-500 shadow-lg hover:bg-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {!cat.isActive && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest">
                  Inactive
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black uppercase tracking-widest" style={{ color: theme.primary }}>{cat.name}</h3>
                <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: theme.surface }}>Order: {cat.displayOrder}</span>
              </div>
              <p className="text-sm opacity-60 line-clamp-2" style={{ color: theme.text }}>{cat.description || 'No description provided.'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.surface, color: theme.text }}
          >
            Prev
          </button>
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className="w-10 h-10 rounded-xl font-black transition-all"
                style={{ 
                  backgroundColor: currentPage === i + 1 ? theme.primary : theme.surface,
                  color: currentPage === i + 1 ? theme.background : theme.text
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.surface, color: theme.text }}
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Category Name</label>
            <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <Type size={18} className="opacity-40 mr-3" />
              <input
                type="text"
                className="bg-transparent border-none outline-none w-full font-semibold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Description</label>
            <textarea
              className="w-full px-4 py-3 rounded-2xl border bg-transparent font-semibold outline-none transition-all min-h-[100px]"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Display Order</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <Hash size={18} className="opacity-40 mr-3" />
                <input
                  type="number"
                  className="bg-transparent border-none outline-none w-full font-semibold"
                  value={formData.displayOrder || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: e.target.value === "" ? 0 : parseInt(e.target.value)
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Status</label>
              <select
                className="w-full px-4 py-3 rounded-2xl border bg-transparent font-semibold outline-none transition-all"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                value={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Category Image</label>
            <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <ImageIcon size={18} className="opacity-40 mr-3" />
              <input
                type="file"
                accept="image/*"
                className="bg-transparent border-none outline-none w-full font-semibold text-sm"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            {currentCategory?.image && !imageFile && (
              <p className="text-[10px] opacity-50 mt-1 ml-1">Current: {currentCategory.image.split('/').pop()}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            style={{ backgroundColor: theme.primary, color: theme.background }}
          >
            {submitting ? 'Please Wait...' : (currentCategory ? 'Update Category' : 'Create Category')}
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
            Are you sure you want to delete <span className="text-red-500">{currentCategory?.name}</span>?
          </p>
          <p className="opacity-60 text-sm">This category and all its associated products might be affected.</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
              className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest border transition-colors disabled:opacity-50"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest bg-red-500 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;