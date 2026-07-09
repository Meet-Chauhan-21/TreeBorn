import React, { useState, useEffect } from 'react';
import { Search, Edit, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';
import { useAuth } from '../../context/AuthContext';

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { accessToken } = useAuth();

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        toast.success(`User "${userName}" deleted successfully`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken) return;
      
      try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (item: any) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold">
            {item.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: any) => (
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          item.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {item.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="active" />,
    },
    { key: 'phone', header: 'Phone' },
    { key: 'orders', header: 'Orders' },
    { 
      key: 'joined', 
      header: 'Joined',
      render: (item: any) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (item: any) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/admin/users/${item._id}`)} />
          <Button variant="ghost" size="sm" icon={Edit} onClick={() => navigate(`/admin/users/${item._id}`)} />
          <Button
            variant="ghost"
            size="sm"
            className="!text-red-600 hover:!text-red-700 hover:!bg-red-50"
            icon={Trash2}
            onClick={() => handleDeleteUser(item._id, item.name)}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
          <p className="text-gray-500">Manage user accounts</p>
        </div>

        <Card>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
            keyExtractor={(item: any) => item._id}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UsersList;
