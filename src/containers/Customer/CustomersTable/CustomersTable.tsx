'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  addCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../../../services/customerService';
import { toast } from 'react-toastify';
import {
  SortAscendingIcon,
  SortDescendingIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusCircleIcon,
  SearchIcon,
  DownloadIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/solid';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CustomerDetails from '../../../components/Customer/CustomerDetails/CustomerDetails';
import EditCustomerForm from '../../../components/Customer/EditCustomerForm/EditCustomerForm';
import { Customer } from '../../../types/Customer';
import CreateCustomerForm from '../../../components/Customer/CreateCustomerForm/CreateCustomerForm';

const CustomersTable = () => {
  // State management
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer;
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fetch customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCustomers();
        setCustomers(response);
      } catch (err) {
        console.error('Failed to load customers!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    // First, filter the customers
    let result = [...customers];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (customer) =>
          (customer.name &&
            customer.name.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.driverLicenseNumber &&
            customer.driverLicenseNumber
              .toLowerCase()
              .includes(lowerSearchTerm)) ||
          (customer.passportNumber &&
            customer.passportNumber.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.email &&
            customer.email.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.phoneNumber &&
            customer.phoneNumber.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.address &&
            customer.address.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.countryOfOrigin &&
            customer.countryOfOrigin.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Then, sort the filtered results
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        // Handle null or undefined values
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        // Fallback if types mismatch
        return 0;
      });
    }

    return result;
  }, [customers, searchTerm, sortConfig]);

  // Pagination logic
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCustomers.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedCustomers.length / itemsPerPage
  );

  // Event handlers
  const handleSort = (key: keyof Customer) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Jeste li sigurni da želite izbrisati ovog korisnika?'
    );
    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      await deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
      setSelectedCustomer(null);
      toast.success('Korisnik uspješno izbrisan');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Neuspješno izbrisan korisnik');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedCustomer: Customer) => {
    try {
      setLoading(true);
      const response = await updateCustomer(
        updatedCustomer.id ?? '',
        updatedCustomer
      );
      setCustomers(customers.map((c) => (c.id === response.id ? response : c)));
      setIsEditing(false);
      toast.success('Korisnik uspješno ažuriran!');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Neuspješno ažuriranje korisnika!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newCustomer: Customer) => {
    try {
      setLoading(true);
      const response = await addCustomer(newCustomer);
      setCustomers([...customers, response]);
      setIsCreating(false);
      toast.success('Korisnici uspješno dodani!');
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Neuspješno dodavanje korisnika!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setIsEditing(true);
    setEditCustomer(customer);
    setSelectedCustomer(null);
  };

  const closeEditForm = () => {
    setIsEditing(false);
    setEditCustomer(null);
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      const worksheetData = filteredAndSortedCustomers.map((customer) => ({
        Ime: customer.name || 'N/A',
        'Vozačka dozvola': customer.driverLicenseNumber || 'N/A',
        'Broj pasoša': customer.passportNumber || 'N/A',
        Email: customer.email || 'N/A',
        Telefon: customer.phoneNumber || 'N/A',
        Adresa: customer.address || 'N/A',
        'Zemlja porijekla': customer.countryOfOrigin || 'N/A',
        'Datum kreiranja': customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString()
          : 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Korisnici');
      XLSX.writeFile(workbook, 'korisnici.xlsx');
      toast.success('Excel uspješno izvezen');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Excel neuspješno izvezen');
    }
  };

  // Render table header with sort indicators
  const renderTableHeader = (label: string, key: keyof Customer) => {
    const isSorted = sortConfig.key === key;
    const SortIcon =
      sortConfig.direction === 'asc' ? SortAscendingIcon : SortDescendingIcon;

    return (
      <TableHead
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isSorted ? (
            <SortIcon className="w-4 h-4" />
          ) : (
            <SortAscendingIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </TableHead>
    );
  };



  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Korisnici</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Upravljanje korisnicima sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportToExcel}
                disabled={loading || customers.length === 0}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Izvoz Excel
              </Button>
              <Button onClick={() => setIsCreating(true)}>
                <PlusCircleIcon className="w-4 h-4 mr-2" />
                Dodaj novog korisnika
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pretraži korisnike..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Učitavanje korisnika...</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && customers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <PlusCircleIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nema pronađenih korisnika
              </h3>
              <p className="text-muted-foreground mb-4">
                Počnite dodavanjem vašeg prvog korisnika
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <PlusCircleIcon className="w-4 h-4 mr-2" />
                Dodaj novog korisnika
              </Button>
            </div>
          )}

          {/* Customer table */}
          {!loading && customers.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {renderTableHeader('Ime', 'name')}
                      {renderTableHeader(
                        'Vozačka dozvola',
                        'driverLicenseNumber'
                      )}
                      {renderTableHeader('Broj pasoša', 'passportNumber')}
                      {renderTableHeader('Email', 'email')}
                      {renderTableHeader('Telefon', 'phoneNumber')}
                      {renderTableHeader('Zemlja', 'countryOfOrigin')}
                      <TableHead className="text-center">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.length > 0 ? (
                      paginatedCustomers.map((customer, index) => (
                        <TableRow key={customer.id || index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {customer.name
                                  ? customer.name.charAt(0).toUpperCase()
                                  : '?'}
                              </div>
                              <span>{customer.name || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {customer.driverLicenseNumber || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {customer.passportNumber || 'N/A'}
                          </TableCell>
                          <TableCell>{customer.email || 'N/A'}</TableCell>
                          <TableCell>{customer.phoneNumber || 'N/A'}</TableCell>
                          <TableCell>
                            {customer.countryOfOrigin || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomer(customer);
                                }}
                                title="Prikaži detalje"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(customer);
                                }}
                                title="Uredi korisnika"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(customer.id ?? '');
                                }}
                                title="Izbriši korisnika"
                                className="text-destructive hover:text-destructive"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          Nema korisnika koji odgovaraju vašim kriterijima
                          pretrage
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Prikazuje {(currentPage - 1) * itemsPerPage + 1} do{' '}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAndSortedCustomers.length
                  )}{' '}
                  od {filteredAndSortedCustomers.length} rezultata
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Customer Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dodaj novog korisnika</DialogTitle>
          </DialogHeader>
          <CreateCustomerForm
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && closeEditForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uredi korisnika</DialogTitle>
          </DialogHeader>
          {editCustomer && (
            <EditCustomerForm
              customer={editCustomer}
              onSave={handleSave}
              onCancel={closeEditForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && closeCustomerDetails()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalji korisnika</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerDetails
              customer={selectedCustomer}
              onEdit={() => handleEdit(selectedCustomer)}
              onDelete={() =>
                selectedCustomer?.id && handleDelete(selectedCustomer.id)
              }
              onClose={closeCustomerDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersTable;
