import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserCog, Plus, Edit, Trash2, Key, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { User } from '../types/user.types';
import * as userService from '../services/userService';
import { OnlineStatus } from '../components/OnlineStatus';
import { getUsersWithStatus, UserWithStatus } from '../services/activityService';
import { socketService } from '@/shared/services/socketService';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // AlertDialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    fetchUsers();

    // Listen for real-time user status changes via WebSocket
    socketService.onUserStatusChange((data) => {
      console.log('User status changed:', data);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === data.userId
            ? { ...user, isOnline: data.isOnline, lastActiveAt: new Date().toISOString() }
            : user
        )
      );
    });

    // Cleanup
    return () => {
      socketService.offUserStatusChange();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersWithStatus();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Greška pri učitavanju korisnika');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (id: string, username: string) => {
    setSelectedUser({ id, username });
    setDeleteDialogOpen(true);
  };

  const openResetPasswordDialog = (id: string, username: string) => {
    setSelectedUser({ id, username });
    setResetPasswordDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeletingId(selectedUser.id);
      await userService.deleteUser(selectedUser.id);
      toast.success('Korisnik je uspješno obrisan');
      fetchUsers();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Greška pri brisanju korisnika');
    } finally {
      setDeletingId(null);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const newPassword = Math.random().toString(36).slice(-12);
      await userService.resetUserPassword(selectedUser.id, newPassword, true);
      toast.success('Nova lozinka je poslana na email korisnika');
      setResetPasswordDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Greška pri resetovanju lozinke');
    } finally {
      setSelectedUser(null);
    }
  };

  const filteredUsers = (users || []).filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      user: 'bg-blue-100 text-blue-800 border-blue-200',
      employee: 'bg-green-100 text-green-800 border-green-200',
    };
    
    const labels: Record<string, string> = {
      admin: 'Administrator',
      user: 'Korisnik',
      employee: 'Zaposleni',
    };

    return (
      <Badge variant="outline" className={colors[role] || ''}>
        {labels[role] || role}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="w-8 h-8 text-primary" />
            Upravljanje korisnicima
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kreirajte i upravljajte korisničkim nalozima
          </p>
        </div>
        <Button onClick={() => navigate('/users/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj korisnika
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po imenu, korisničkom imenu ili emailu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Korisnici ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista svih korisnika u sistemu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Učitavanje korisnika...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nema korisnika za prikaz</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Ime</TableHead>
                    <TableHead>Korisničko ime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Posljednja prijava</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <OnlineStatus 
                          isOnline={user.isOnline} 
                          lastActiveAt={user.lastActiveAt}
                          showText
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString('bs-BA')
                          : 'Nikad'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResetPasswordDialog(user.id, user.username)}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user.id, user.username)}
                            disabled={deletingId === user.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Brisanje korisnika</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite obrisati korisnika <strong>{selectedUser?.username}</strong>?
              <br />
              Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Odustani
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetovanje lozinke</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite resetovati lozinku za korisnika <strong>{selectedUser?.username}</strong>?
              <br />
              Nova lozinka će biti generisana i poslata na email korisnika.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Odustani
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              Resetuj lozinku
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
