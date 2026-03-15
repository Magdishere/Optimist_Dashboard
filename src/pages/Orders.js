import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAdminTheme } from '../theme/ThemeContext';
import { ShoppingBag, Search, Clock, CheckCircle, XCircle, Eye, MapPin, CreditCard, Package } from 'lucide-react';

const Orders = () => {
  const { theme } = useAdminTheme();
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 5;

  const fetchOrders = async () => {
    try {
      const res = await axios.get('https://optimist-backend-api.onrender.com/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`https://optimist-backend-api.onrender.com/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setShowModal(false);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'awaiting_payment': return 'bg-orange-100 text-orange-700';
      case 'paid': return 'bg-teal-100 text-teal-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'delivering': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.user?.firstName + ' ' + order.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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
            placeholder="Search orders by ID or user name..."
            className="bg-transparent border-none outline-none w-full font-semibold"
            style={{ color: theme.text }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div 
        className="rounded-3xl shadow-xl overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
            <thead>
              <tr style={{ backgroundColor: theme.surface, color: theme.primary }}>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Order ID</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Customer</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Total</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs">Status</th>
                <th className="px-4 md:px-6 py-4 font-black uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.border }}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center font-bold opacity-50">Loading orders...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center font-bold opacity-50">No orders found</td>
                </tr>
              ) : currentItems.map((order) => (
                <tr key={order._id} className="hover:bg-opacity-50 transition-colors" style={{ color: theme.text }}>
                  <td className="px-4 md:px-6 py-4 font-mono text-[10px] md:text-xs font-bold opacity-70">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="font-bold text-sm md:text-base truncate">{order.user?.firstName} {order.user?.lastName}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 font-black text-sm md:text-base" style={{ color: theme.primary }}>${order.totalPrice.toFixed(2)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 md:space-x-2">
                      <button 
                        onClick={() => openOrderDetails(order)}
                        className="p-1.5 md:p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          className="p-1.5 md:p-2 rounded-xl bg-green-50 text-green-500 hover:bg-green-100 transition-colors"
                          title="Confirm Order"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {['pending', 'confirmed', 'preparing', 'awaiting_payment'].includes(order.status) && (
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          className="p-1.5 md:p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Cancel Order"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            style={{ backgroundColor: theme.card }}
          >
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black" style={{ color: theme.text }}>Order Details</h2>
                  <p className="font-mono text-sm opacity-50">#{selectedOrder._id}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-opacity-10 bg-gray-500 bg-opacity-0 transition-colors"
                  style={{ color: theme.text }}
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs opacity-50" style={{ color: theme.text }}>
                    <Package size={16} /> Items
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-opacity-5" style={{ backgroundColor: theme.surface }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: theme.text }}>{item.quantity}x {item.name}</p>
                          <p className="text-[10px] opacity-60" style={{ color: theme.text }}>{item.variant?.name || 'Standard'}</p>
                        </div>
                        <p className="font-black text-sm" style={{ color: theme.primary }}>${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                  {/* Shipping */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs opacity-50" style={{ color: theme.text }}>
                      <MapPin size={16} /> {selectedOrder.orderType === 'delivery' ? 'Shipping' : 'Pickup'}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: theme.text }}>
                      {selectedOrder.orderType === 'delivery' ? (
                        <>
                          <p>{selectedOrder.shippingAddress?.street}</p>
                          <p>{selectedOrder.shippingAddress?.city}</p>
                          <p className="opacity-60">{selectedOrder.shippingAddress?.phone}</p>
                        </>
                      ) : (
                        <p>Customer will pick up from store.</p>
                      )}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs opacity-50" style={{ color: theme.text }}>
                      <CreditCard size={16} /> Payment
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-gray-100" style={{ color: theme.text }}>
                        {selectedOrder.paymentMethod}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder.isPaid ? 'text-green-500' : 'text-orange-500'}`}>
                        {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-6 border-t flex flex-wrap gap-2" style={{ borderColor: theme.border }}>
                {['pending', 'confirmed'].includes(selectedOrder.status) && (
                  <button onClick={() => updateOrderStatus(selectedOrder._id, 'preparing')} className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition-all">Start Preparing</button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button onClick={() => updateOrderStatus(selectedOrder._id, 'ready')} className="px-4 py-2 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-all">Mark Ready</button>
                )}
                {selectedOrder.status === 'ready' && selectedOrder.orderType === 'delivery' && (
                  <button onClick={() => updateOrderStatus(selectedOrder._id, 'delivering')} className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-all">Out for Delivery</button>
                )}
                {['ready', 'delivering'].includes(selectedOrder.status) && (
                  <button onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')} className="px-4 py-2 rounded-xl bg-gray-800 text-white font-bold text-sm hover:bg-black transition-all">Complete Order</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Orders;