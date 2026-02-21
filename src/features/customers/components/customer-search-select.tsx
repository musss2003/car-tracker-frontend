import { useEffect, useRef, useState } from 'react';
import { Search, Check, ChevronsUpDown, X } from 'lucide-react';
import { Customer } from '../types/customer.types';
import { Button } from '@/shared/components/ui/button';

interface CustomerSearchSelectProps {
  value: string;
  onChange: (customerId: string) => void;
  customers: Customer[];
  disabled?: boolean;
}

export function CustomerSearchSelect({
  value,
  onChange,
  customers,
  disabled = false,
}: CustomerSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCustomer = customers.find((c) => c.id === value);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (customerId: string) => {
    onChange(customerId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Trigger — unchanged, stays minimal ───────────────────────────── */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={!value ? 'text-muted-foreground' : ''}>
          {selectedCustomer?.name || 'Odaberite kupca'}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
      </button>

      {selectedCustomer && !disabled && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {selectedCustomer.name}
            </p>
            {selectedCustomer.email && (
              <p className="text-xs text-muted-foreground truncate">
                {selectedCustomer.email}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={() => onChange('')}
            className="flex-shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-3 w-3" />
            Ukloni
          </Button>
        </div>
      )}

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border-2 border-border shadow-2xl"
          style={{ backgroundColor: 'hsl(var(--card))' }}
        >
          <div
            className="p-2 border-b-2 border-border"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 border-2 border-border rounded-md"
              style={{ backgroundColor: 'hsl(var(--muted))' }}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pretraži kupce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm text-foreground placeholder:text-muted-foreground"
                style={{ backgroundColor: 'transparent' }}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div
            className="max-h-[300px] overflow-y-auto p-1"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          >
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelect(customer.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
              >
                <div className="text-left min-w-0">
                  <p className="truncate">{customer.name}</p>
                  {customer.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.email}
                    </p>
                  )}
                </div>
                {value === customer.id && (
                  <Check className="h-4 w-4 flex-shrink-0 ml-2" />
                )}
              </button>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nema pronađenih kupaca.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
