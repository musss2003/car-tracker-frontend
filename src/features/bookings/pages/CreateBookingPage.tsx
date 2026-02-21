import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { PageHeader } from '@/shared/components/ui/page-header';
import { FormSection } from '@/shared/components/ui/form-section';
import { FormField } from '@/shared/components/ui/form-field';
import { LocationPicker } from '@/shared/components/ui/location-picker';
import { CustomerSearchSelect } from '@/features/customers/components/customer-search-select';
import { CarAvailabilitySelect } from '@/shared/components/ui/car-availability-select';
import { DashboardLayout } from '@/shared/components/layout';
import { useCreateBooking, BOOKING_EXTRAS } from '../hooks/useCreateBooking';
import type { BookingExtraType } from '../types/booking.types';
import {
  UserIcon,
  TruckIcon,
  CalendarIcon,
  LocationMarkerIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClipboardListIcon,
} from '@heroicons/react/solid';

const CreateBookingPage = () => {
  const { state, actions } = useCreateBooking();

  const hasExtras = BOOKING_EXTRAS.some(
    (e) => state.extrasQuantities[e.type as BookingExtraType] > 0
  );

  return (
    <>
      <PageHeader
        title="Nova rezervacija"
        subtitle="Kreirajte rezervaciju vozila za kupca"
        onBack={actions.goBack}
      />

      <DashboardLayout spacing="space-y-6" padding="py-6">
        <form
          id="create-booking-form"
          onSubmit={actions.handleSubmit}
          className="space-y-6"
        >
          {/* ── Customer ──────────────────────────────────────────────────── */}
          <FormSection title="Kupac" icon={<UserIcon className="w-5 h-5" />}>
            <FormField
              label="Kupac"
              id="customerId"
              error={state.errors.customerId}
              helperText={
                state.loadingCustomers ? 'Učitavanje kupaca...' : undefined
              }
            >
              <CustomerSearchSelect
                value={state.customerId}
                onChange={actions.handleCustomerChange}
                customers={state.customers}
                disabled={state.loadingCustomers}
              />
            </FormField>
          </FormSection>

          {/* ── Dates ────────────────────────────────────────────────────── */}
          <FormSection
            title="Period rezervacije"
            icon={<CalendarIcon className="w-5 h-5" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Datum početka"
                id="startDate"
                required
                error={state.errors.startDate}
              >
                <Input
                  id="startDate"
                  type="date"
                  value={state.startDate}
                  onChange={(e) =>
                    actions.handleStartDateChange(e.target.value)
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField
                label="Datum završetka"
                id="endDate"
                required
                error={state.errors.endDate}
              >
                <Input
                  id="endDate"
                  type="date"
                  value={state.endDate}
                  onChange={(e) => actions.handleEndDateChange(e.target.value)}
                  min={
                    state.startDate || new Date().toISOString().split('T')[0]
                  }
                />
              </FormField>
            </div>

            {state.totalDays > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 mt-2">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {state.totalDays} {state.totalDays === 1 ? 'dan' : 'dana'}
                </span>
              </div>
            )}
          </FormSection>

          {/* ── Vehicle ──────────────────────────────────────────────────── */}
          <FormSection title="Vozilo" icon={<TruckIcon className="w-5 h-5" />}>
            <CarAvailabilitySelect
              value={state.carId}
              onChange={actions.handleCarChange}
              startDate={state.startDate}
              endDate={state.endDate}
              required
              onPriceCalculated={actions.handlePriceCalculated}
              error={state.errors.carId}
            />
          </FormSection>

          {/* ── Locations ────────────────────────────────────────────────── */}
          <FormSection
            title="Lokacije"
            icon={<LocationMarkerIcon className="w-5 h-5" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LocationPicker
                label="Lokacija preuzimanja"
                placeholder="Pretraži adresu..."
                notesPlaceholder="npr. Glavni ured — kod recepcije"
                value={state.pickupLocation}
                onChange={actions.setPickupLocation}
              />
              <LocationPicker
                label="Lokacija vraćanja"
                placeholder="Pretraži adresu..."
                notesPlaceholder="npr. Aerodromski terminal 1 — parking B"
                value={state.dropoffLocation}
                onChange={actions.setDropoffLocation}
              />
            </div>
          </FormSection>

          {/* ── Extras ───────────────────────────────────────────────────── */}
          <FormSection
            title="Dodaci"
            icon={<ClipboardListIcon className="w-5 h-5" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOOKING_EXTRAS.map((extra) => {
                const qty =
                  state.extrasQuantities[extra.type as BookingExtraType];
                const checked = qty > 0;
                const isKasko = extra.type === 'kasko_insurance';
                return (
                  <div
                    key={extra.type}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      checked
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <label
                      htmlFor={extra.type}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <Checkbox
                        id={extra.type}
                        checked={checked}
                        onCheckedChange={(val) =>
                          actions.handleExtraToggle(
                            extra.type as BookingExtraType,
                            val === true
                          )
                        }
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {extra.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {extra.pricePerDay} KM / dan
                        </p>
                      </div>
                    </label>

                    {checked && !isKasko && (
                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            actions.handleExtraQuantityChange(
                              extra.type as BookingExtraType,
                              Math.max(1, qty - 1)
                            )
                          }
                          className="w-6 h-6 rounded border border-input bg-background hover:bg-muted flex items-center justify-center text-sm font-bold leading-none transition-colors"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm font-semibold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            actions.handleExtraQuantityChange(
                              extra.type as BookingExtraType,
                              qty + 1
                            )
                          }
                          className="w-6 h-6 rounded border border-input bg-background hover:bg-muted flex items-center justify-center text-sm font-bold leading-none transition-colors"
                        >
                          +
                        </button>
                      </div>
                    )}
                    {checked && isKasko && (
                      <span className="w-4 text-center text-sm font-semibold tabular-nums ml-2">
                        1
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </FormSection>

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <FormSection
            title="Napomene"
            icon={<DocumentTextIcon className="w-5 h-5" />}
          >
            <FormField
              label="Napomene"
              id="notes"
              helperText="Posebni zahtjevi ili napomene za ovu rezervaciju (opcionalno)"
            >
              <Textarea
                id="notes"
                placeholder="Dodajte posebne zahtjeve ili napomene..."
                value={state.notes}
                onChange={(e) => actions.setNotes(e.target.value)}
                rows={4}
              />
            </FormField>
          </FormSection>

          {/* ── Cost summary ─────────────────────────────────────────────── */}
          {state.totalCost > 0 && (
            <FormSection
              title="Pregled troškova"
              icon={<CreditCardIcon className="w-5 h-5" />}
            >
              <div className="space-y-2">
                {/* Base */}
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-muted-foreground">
                    Iznajmljivanje vozila
                    {state.totalDays > 0 && (
                      <span className="ml-1 text-xs">
                        ({state.totalDays}{' '}
                        {state.totalDays === 1 ? 'dan' : 'dana'})
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {state.carCost.toFixed(2)} KM
                  </span>
                </div>

                {/* Per-extra rows */}
                {hasExtras &&
                  BOOKING_EXTRAS.filter(
                    (e) =>
                      state.extrasQuantities[e.type as BookingExtraType] > 0
                  ).map((e) => {
                    const qty =
                      state.extrasQuantities[e.type as BookingExtraType];
                    return (
                      <div
                        key={e.type}
                        className="flex justify-between items-center py-1 pl-4"
                      >
                        <span className="text-sm text-muted-foreground">
                          {e.label}
                          {qty > 1 && (
                            <span className="text-muted-foreground/60 ml-1">
                              ×{qty}
                            </span>
                          )}
                        </span>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {(e.pricePerDay * qty * state.totalDays).toFixed(2)}{' '}
                          KM
                        </span>
                      </div>
                    );
                  })}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-base font-semibold">Ukupna cijena</span>
                  <span className="text-lg font-bold tabular-nums">
                    {state.totalCost.toFixed(2)} KM
                  </span>
                </div>

                {/* Deposit callout */}
                <div className="flex items-center justify-between rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 px-4 py-3 mt-1">
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      Depozit (20%)
                    </p>
                    <p className="text-xs text-orange-600/70 dark:text-orange-500 mt-0.5">
                      Naplaćuje se pri preuzimanju vozila
                    </p>
                  </div>
                  <span className="text-base font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                    {state.depositAmount.toFixed(2)} KM
                  </span>
                </div>
              </div>
            </FormSection>
          )}

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={actions.cancelBooking}
              disabled={state.loading}
              className="w-full sm:w-auto"
            >
              Otkaži
            </Button>
            <Button
              type="submit"
              disabled={state.loading}
              className="gap-2 w-full sm:w-auto"
            >
              <PlusCircleIcon className="w-4 h-4" />
              {state.loading ? 'Kreiranje...' : 'Kreiraj rezervaciju'}
            </Button>
          </div>
        </form>
      </DashboardLayout>
    </>
  );
};

export default CreateBookingPage;
