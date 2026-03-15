import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAdminTheme } from '../theme/ThemeContext';
import { UserPlus, Edit2, Trash2, Search, Phone, User as UserIcon } from 'lucide-react';
import Modal from '../components/Modal';

const Users = () => {
  const { theme } = useAdminTheme();
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://optimist-backend-api.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        password: '',
        role: user.role
      });
    } else {
      setCurrentUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        role: 'user'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        await axios.put(`https://optimist-backend-api.onrender.com/api/users/${currentUser._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('https://optimist-backend-api.onrender.com/api/users', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://optimist-backend-api.onrender.com/api/users/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

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
            placeholder="Search users by name or phone..."
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
          <UserPlus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      <div 
        className="rounded-3xl shadow-xl overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead>
              <tr style={{ backgroundColor: theme.surface, color: theme.primary }}>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">User</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Phone</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Role</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.border }}>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center font-bold opacity-50">Loading users...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center font-bold opacity-50">No users found</td>
                </tr>
              ) : currentItems.map((user) => (
                <tr key={user._id} className="hover:bg-opacity-50 transition-colors" style={{ color: theme.text }}>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 shadow-md text-xs md:text-base flex-shrink-0"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {user.firstName[0]}
                      </div>
                      <span className="font-bold text-sm md:text-base truncate">{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 font-semibold opacity-80 text-sm">{user.phone}</td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 md:space-x-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-1.5 md:p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => { setCurrentUser(user); setIsDeleteModalOpen(true); }}
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
        title={currentUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">First Name</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <UserIcon size={18} className="opacity-40 mr-3" />
                <input
                  type="text"
                  className="bg-transparent border-none outline-none w-full font-semibold"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60 ml-1">Last Name</label>
              <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <UserIcon size={18} className="opacity-40 mr-3" />
                <input
                  type="text"
                  className="bg-transparent border-none outline-none w-full font-semibold"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Phone Number</label>
            <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <Phone size={18} className="opacity-40 mr-3" />
              <input
                type="text"
                className="bg-transparent border-none outline-none w-full font-semibold"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Password {currentUser && '(leave blank to keep current)'}</label>
            <div className="flex items-center px-4 py-3 rounded-2xl border transition-all" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <input
                type="password"
                className="bg-transparent border-none outline-none w-full font-semibold"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!currentUser}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60 ml-1">Role</label>
            <select
              className="w-full px-4 py-3 rounded-2xl border bg-transparent font-semibold outline-none transition-all"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: theme.primary, color: theme.background }}
          >
            {currentUser ? 'Update User' : 'Create User'}
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
            Are you sure you want to delete <span className="text-red-500">{currentUser?.firstName} {currentUser?.lastName}</span>?
          </p>
          <p className="opacity-60 text-sm">This action cannot be undone.</p>
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

export default Users;