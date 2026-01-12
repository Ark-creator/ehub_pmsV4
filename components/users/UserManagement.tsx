import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserPlus, Mail, Phone, Shield, Eye, EyeOff, /* Edit, Trash2, */ Save, X } from 'lucide-react';
import { SupervisorSignupForm } from '../auth/SupervisorSignupForm';
import { User } from '../../types';

interface UserManagementProps {
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User;
}

export function UserManagement({ users, setUsers, currentUser }: UserManagementProps) {
  const [showSupervisorForm, setShowSupervisorForm] = useState(false);
  const [showSecureIds, setShowSecureIds] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleCreateSupervisor = (newSupervisor: User) => {
    setUsers([...users, newSupervisor]);
    setShowSupervisorForm(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setShowEditDialog(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setShowEditDialog(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingUser(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'supervisor':
        return 'default';
      case 'fabricator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const canManageUsers = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>User Management</h2>
        {canManageUsers && (
          <Button onClick={() => setShowSupervisorForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Supervisor
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>System Users</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecureIds(!showSecureIds)}
            >
              {showSecureIds ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSecureIds ? 'Hide' : 'Show'} Secure IDs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>School/Institution</TableHead>
                <TableHead>Contact</TableHead>
                {showSecureIds && <TableHead>Secure ID</TableHead>}
                <TableHead>Employee #</TableHead>
                {currentUser.role === 'admin' && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div>{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.school}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.gcashNumber && (
                        <div className="text-sm text-muted-foreground">
                          GCash: {user.gcashNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {showSecureIds && (
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {user.secureId}
                      </code>
                    </TableCell>
                  )}
                  <TableCell>
                    <code className="text-xs">
                      {user.employeeNumber}
                    </code>
                  </TableCell>
                  {currentUser.role === 'admin' && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          Edit
                        </Button>
                        {user.id !== currentUser.id && (
                          <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!canManageUsers && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg mb-2">Limited Access</h3>
              <p className="text-muted-foreground">
                Only administrators can manage users and create supervisor accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {showSupervisorForm && (
        <SupervisorSignupForm
          onSignup={handleCreateSupervisor}
          onClose={() => setShowSupervisorForm(false)}
        />
      )}

      {showEditDialog && editingUser && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gcashNumber">GCash Number</Label>
                  <Input
                    id="gcashNumber"
                    value={editingUser.gcashNumber || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, gcashNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="school">School/Institution</Label>
                  <Input
                    id="school"
                    value={editingUser.school || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, school: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value as User['role'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="fabricator">Fabricator</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="secureId">Secure ID</Label>
                  <Input
                    id="secureId"
                    value={editingUser.secureId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, secureId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="employeeNumber">Employee #</Label>
                  <Input
                    id="employeeNumber"
                    value={editingUser.employeeNumber || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, employeeNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveUser}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}