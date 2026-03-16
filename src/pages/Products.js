import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAdminTheme } from '../theme/ThemeContext';
import { Plus, Edit2, Trash2, Search, Coffee, Tag, DollarSign, Image as ImageIcon, CheckCircle, List, PlusCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';

const Products = () => {
  const { theme } = useAdminTheme();
  const { token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    menuSection: 'General',
    basePrice: '',
    isFeatured: false,
    isAvailable: true,
    variants: [],
    addOns: []
  });

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('https://optimist-backend-api.onrender.com/api/products'),
        axios.get('https://optimist-backend-api.onrender.com/api/categories')
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category?._id || product.category,
        menuSection: product.menuSection || 'General',
        basePrice: product.basePrice,
        isFeatured: product.isFeatured ?? false,
        isAvailable: product.isAvailable ?? true,
        variants: product.variants || [],
        addOns: product.addOns || []
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        name: '',
        description: '',
        category: categories[0]?._id || '',
        menuSection: 'General',
        basePrice: '',
        isFeatured: false,
        isAvailable: true,
        variants: [],
        addOns: []
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: '', price: 0 }]
    });
  };

  const handleRemoveVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = field === 'price' ? parseFloat(value) : value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleAddAddOn = () => {
    setFormData({
      ...formData,
      addOns: [...formData.addOns, { name: '', price: 0 }]
    });
  };

  const handleRemoveAddOn = (index) => {
    const newAddOns = [...formData.addOns];
    newAddOns.splice(index, 1);
    setFormData({ ...formData, addOns: newAddOns });
  };

  const handleAddOnChange = (index, field, value) => {
    const newAddOns = [...formData.addOns];
    newAddOns[index][field] = field === 'price' ? parseFloat(value) : value;
    setFormData({ ...formData, addOns: newAddOns });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('menuSection', formData.menuSection);
    data.append('basePrice', formData.basePrice);
    data.append('isFeatured', formData.isFeatured);
    data.append('isAvailable', formData.isAvailable);
    data.append('variants', JSON.stringify(formData.variants));
    data.append('addOns', JSON.stringify(formData.addOns));
    
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

      if (currentProduct) {
        await axios.put(`https://optimist-backend-api.onrender.com/api/products/${currentProduct._id}`, data, config);
      } else {
        await axios.post('https://optimist-backend-api.onrender.com/api/products', data, config);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://optimist-backend-api.onrender.com/api/products/${currentProduct._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.menuSection?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=100&auto=format&fit=crop';
    
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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

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
            placeholder="Search products, sections..."
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
          Add Product
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
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Product</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Category / Section</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Base Price</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Status</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.border }}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center font-bold opacity-50">Loading products...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center font-bold opacity-50">No products found</td>
                </tr>
              ) : currentItems.map((prod) => (
                <tr key={prod._id} className="hover:bg-opacity-50 transition-colors" style={{ color: theme.text }}>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={getImageUrl(prod.image)} 
                        alt={prod.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover mr-3 md:mr-4 shadow-md flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold block text-sm md:text-base truncate">{prod.name}</span>
                        {prod.isFeatured && (
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col">
                      <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-tighter bg-gray-100 text-gray-700 w-fit mb-1">
                        {prod.category?.name || 'Uncategorized'}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold opacity-60 ml-1 italic truncate">{prod.menuSection}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 font-black text-sm md:text-base" style={{ color: theme.primary }}>${prod.basePrice.toFixed(2)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`flex items-center text-[10px] md:text-xs font-black uppercase tracking-widest ${prod.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                      <CheckCircle size={14} className="mr-1 flex-shrink-0" />
                      {prod.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 md:space-x-2">
                      <button 
                        onClick={() => handleOpenModal(prod)}
                        className="p-1.5 md:p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => { setCurrentProduct(prod); setIsDeleteModalOpen(true); }}
                        className="p-1.5 md:p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            onClick={() => setCurrentPage(prev => prev + 1)}
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
        title={currentProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Product Name</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <Coffee size={18} className="opacity-40 mr-3" />
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
              <label className="text-xs font-black uppercase opacity-60 ml-1">Section (e.g. Hot/Cold)</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <List size={18} className="opacity-40 mr-3" />
                <input
                  type="text"
                  className="bg-transparent border-none outline-none w-full font-semibold"
                  placeholder="Hot, Cold, Sweet..."
                  value={formData.menuSection}
                  onChange={(e) => setFormData({...formData, menuSection: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Category</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <Tag size={18} className="opacity-40 mr-3" />
                <select
                  className="bg-transparent border-none outline-none w-full font-semibold"
                  style={{ color: theme.text }}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Base Price</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <DollarSign size={18} className="opacity-40 mr-3" />
                <input
                  type="number"
                  step="0.01"
                  className="bg-transparent border-none outline-none w-full font-semibold"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Variants (Sizes/Options)</label>
              <button 
                type="button" 
                onClick={handleAddVariant}
                className="text-xs font-black uppercase text-blue-500 flex items-center"
              >
                <PlusCircle size={14} className="mr-1" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex gap-2 animate-in slide-in-from-left-2">
                  <input
                    type="text"
                    placeholder="Size (e.g. Large)"
                    className="flex-1 px-4 py-2 rounded-xl border bg-transparent text-sm font-semibold"
                    style={{ borderColor: theme.border }}
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-24 px-4 py-2 rounded-xl border bg-transparent text-sm font-semibold"
                    style={{ borderColor: theme.border }}
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                  />
                  <button type="button" onClick={() => handleRemoveVariant(index)} className="text-red-500">
                    <XCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Add-ons (Extras)</label>
              <button 
                type="button" 
                onClick={handleAddAddOn}
                className="text-xs font-black uppercase text-blue-500 flex items-center"
              >
                <PlusCircle size={14} className="mr-1" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.addOns.map((addOn, index) => (
                <div key={index} className="flex gap-2 animate-in slide-in-from-left-2">
                  <input
                    type="text"
                    placeholder="Extra (e.g. Oat Milk)"
                    className="flex-1 px-4 py-2 rounded-xl border bg-transparent text-sm font-semibold"
                    style={{ borderColor: theme.border }}
                    value={addOn.name}
                    onChange={(e) => handleAddOnChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-24 px-4 py-2 rounded-xl border bg-transparent text-sm font-semibold"
                    style={{ borderColor: theme.border }}
                    value={addOn.price}
                    onChange={(e) => handleAddOnChange(index, 'price', e.target.value)}
                  />
                  <button type="button" onClick={() => handleRemoveAddOn(index)} className="text-red-500">
                    <XCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Description</label>
            <textarea
              className="w-full px-4 py-3 rounded-2xl border bg-transparent font-semibold outline-none transition-all min-h-[80px]"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center p-4 rounded-2xl border cursor-pointer" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded accent-[#5C4033]"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
              />
              <span className="ml-3 text-xs font-black uppercase">Featured</span>
            </label>
            <label className="flex items-center p-4 rounded-2xl border cursor-pointer" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded accent-[#5C4033]"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
              />
              <span className="ml-3 text-xs font-black uppercase">Available</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Product Image</label>
            <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <ImageIcon size={18} className="opacity-40 mr-3" />
              <input
                type="file"
                accept="image/*"
                className="bg-transparent border-none outline-none w-full font-semibold text-sm"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            {currentProduct?.image && !imageFile && (
              <p className="text-[10px] opacity-50 mt-1 ml-1">Current: {currentProduct.image.split('/').pop()}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            style={{ backgroundColor: theme.primary, color: theme.background }}
          >
            {submitting ? 'Please Wait...' : (currentProduct ? 'Update Product' : 'Create Product')}
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
            Are you sure you want to delete <span className="text-red-500">{currentProduct?.name}</span>?
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

export default Products;