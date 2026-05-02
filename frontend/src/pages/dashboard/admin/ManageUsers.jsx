import { useEffect, useState } from "react";
import { deleteUser, getAllUsers, updateUserProfile } from "../../../services/users.service";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        alert("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const updated = await updateUserProfile(userId, { role: newRole, activeRole: newRole });
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      alert("Role updated");
    } catch (err) {
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 border rounded p-2"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm">{user.displayName || "N/A"}</td>
                <td className="px-4 py-3 text-sm">{user.email}</td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={user.role || "renter"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className="border rounded p-1 text-sm"
                  >
                    <option value="renter">Renter</option>
                    <option value="owner">Owner</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={async () => {
                      if (confirm("Delete this user? This action is irreversible.")) {
                        await deleteUser(user.id);
                        setUsers((prev) => prev.filter((item) => item.id !== user.id));
                      }
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
