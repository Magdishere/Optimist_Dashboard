import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminTheme } from '../theme/ThemeContext';
import SalesCharts from '../components/SalesCharts';
import { 
  Users, 
  Coffee, 
  ShoppingCart, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';

const Dashboard = () => {
  const { theme } = useAdminTheme();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    products: 0,
    orders: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, categories, products, ordersRes] = await Promise.all([
          axios.get('https://optimist-backend-api.onrender.com/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('https://optimist-backend-api.onrender.com/api/categories'),
          axios.get('https://optimist-backend-api.onrender.com/api/products'),
          axios.get('https://optimist-backend-api.onrender.com/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const orders = ordersRes.data.data || [];
        
        // Filter for valid sales: Must be paid AND not cancelled
        const validSalesOrders = orders.filter(order => order.isPaid && order.status !== 'cancelled');

        const totalRevenue = validSalesOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        setStats({
          users: users.data.count,
          revenue: totalRevenue,
          products: products.data.count,
          orders: ordersRes.data.count // Keeping total order count, but could also filter if preferred
        });

        // Calculate Recent Activity (All recent orders for awareness)
        const activity = orders.slice(0, 3).map(order => ({
          userName: `${order.user?.firstName || 'Customer'} ${order.user?.lastName || ''}`,
          amount: order.totalPrice,
          time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(order.createdAt).toLocaleDateString(),
          id: order._id
        }));
        setRecentActivity(activity);

        // Calculate Top Products (Using valid sales only)
        const productSales = {};
        validSalesOrders.forEach(order => {
          order.orderItems.forEach(item => {
            if (!productSales[item.name]) {
              productSales[item.name] = { name: item.name, sales: 0, price: item.priceAtPurchase };
            }
            productSales[item.name].sales += item.quantity;
          });
        });

        const top = Object.values(productSales)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 3);
        
        setTopProducts(top);

        // Calculate Monthly Sales (Using valid sales only)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map(m => ({ name: m, sales: 0 }));
        
        // Calculate Daily Sales (for current month, using valid sales only)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({ name: (i + 1).toString(), sales: 0 }));

        validSalesOrders.forEach(order => {
          const date = new Date(order.createdAt);
          const orderMonth = date.getMonth();
          const orderYear = date.getFullYear();
          const orderDay = date.getDate();

          // Add to monthly if same year
          if (orderYear === currentYear) {
            monthlyData[orderMonth].sales += order.totalPrice;
          }

          // Add to daily if same month and year
          if (orderMonth === currentMonth && orderYear === currentYear) {
            dailyData[orderDay - 1].sales += order.totalPrice;
          }
        });

        setMonthlySales(monthlyData);
        setDailySales(dailyData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Products', value: stats.products, icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-widest" style={{ color: theme.primary }}>
            Overview
          </h1>
          <p className="text-sm font-semibold opacity-60 uppercase tracking-widest mt-1">
            Real-time business statistics
          </p>
        </div>
        <div 
          className="flex items-center px-4 py-2 rounded-2xl shadow-sm border"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Clock size={18} className="mr-2 opacity-50" />
          <span className="text-sm font-bold uppercase tracking-tighter opacity-70">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="p-8 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 border"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon size={28} />
              </div>
              <div className="flex items-center text-green-500 font-black text-xs uppercase tracking-tighter bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp size={14} className="mr-1" />
                +12%
              </div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-1">{stat.title}</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-4xl font-black" style={{ color: theme.text }}>
                {loading ? '...' : stat.value}
              </p>
              <ArrowUpRight size={20} className="opacity-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Sales Charts */}
      {!loading && (
        <SalesCharts monthlyData={monthlySales} dailyData={dailySales} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div 
          className="p-8 rounded-3xl shadow-xl border"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest" style={{ color: theme.primary }}>Recent Activity</h2>
            <button 
              onClick={() => navigate('/orders')}
              className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              View All
            </button>
          </div>
          <div className="space-y-6">
            {loading ? (
              <p className="text-center opacity-50 font-bold">Loading activity...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-center opacity-50 font-bold">No recent orders</p>
            ) : recentActivity.map((activity, i) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl transition-colors hover:bg-opacity-5" style={{ backgroundColor: theme.surface }}>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 mr-4 overflow-hidden flex items-center justify-center">
                    <img src={`https://i.pravatar.cc/150?u=${activity.id}`} alt="avatar" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: theme.text }}>Order by {activity.userName}</p>
                    <p className="text-xs opacity-50 font-semibold">{activity.time} • {activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm" style={{ color: theme.primary }}>${activity.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-8 rounded-3xl shadow-xl border"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest" style={{ color: theme.primary }}>Top Products</h2>
            <button 
              onClick={() => navigate('/categories')}
              className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              Full Menu
            </button>
          </div>
          <div className="space-y-6">
            {loading ? (
              <p className="text-center opacity-50 font-bold">Loading products...</p>
            ) : topProducts.length === 0 ? (
              <p className="text-center opacity-50 font-bold">No sales data yet</p>
            ) : topProducts.map((prod, i) => (
              <div key={prod.name} className="flex items-center justify-between p-4 rounded-2xl transition-colors hover:bg-opacity-5" style={{ backgroundColor: theme.surface }}>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mr-4">
                    <Coffee size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: theme.text }}>{prod.name}</p>
                    <p className="text-xs opacity-50 font-semibold">{prod.sales} total sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm" style={{ color: theme.primary }}>${prod.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
