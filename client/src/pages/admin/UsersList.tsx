import React, { useState, useEffect } from 'react';
import { Search, Trash2, Users, ShieldAlert, UserCheck, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatsCard from '../../components/admin/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(15);

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const { accessToken } = useAuth();

  const handleDeleteTrigger = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
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
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
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

  // Pagination Calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

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
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
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
          <Button
            variant="ghost"
            size="sm"
            className="!text-rose-600 hover:!text-rose-750 hover:!bg-rose-50"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTrigger(item._id, item.name);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pt-2">
        {/* Small Data Cards (Stats widgets) related to Users tab - 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Users"
            value={users.length}
            icon={Users}
            color="primary"
          />
          <StatsCard
            title="Administrators"
            value={users.filter((u: any) => u.role?.toLowerCase() === 'admin').length}
            icon={ShieldAlert}
            color="purple"
          />
          <StatsCard
            title="Customer Profiles"
            value={users.filter((u: any) => u.role?.toLowerCase() !== 'admin').length}
            icon={UserCheck}
            color="green"
          />
          <StatsCard
            title="Verified Contacts"
            value={users.filter((u: any) => u.phone).length}
            icon={Phone}
            color="blue"
          />
        </div>

        <Card>
          <div className="mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500 text-slate-800 placeholder-slate-400 text-sm h-10"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={currentRecords}
            loading={loading}
            keyExtractor={(item: any) => item._id}
            onRowClick={(item: any) => navigate(`/admin/users/${item._id}`)}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredUsers.length}
            recordsPerPage={recordsPerPage}
            onPageChange={setCurrentPage}
            onRecordsPerPageChange={(limit) => {
              const setLimit = (val: number) => {
                (setRecordsPerPage as any)(val);
              };
              setLimit(limit);
            }}
            indexOfFirstRecord={indexOfFirstRecord}
            indexOfLastRecord={indexOfLastRecord}
          />
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete user "{userToDelete?.name}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (userToDelete) {
                    await confirmDeleteUser(userToDelete.id, userToDelete.name);
                  }
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-750 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersList;
