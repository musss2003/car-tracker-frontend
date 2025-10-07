import React from 'react';
import { UserIcon, MailIcon, PhoneIcon, LocationMarkerIcon, IdentificationIcon } from '@heroicons/react/solid';
import { Customer } from '../../../../types/Customer';
import './CustomerInfoSection.css';

interface CustomerInfoSectionProps {
  customer: Customer;
  getValue: (value: string | number | null | undefined, defaultValue?: string) => string | number;
  getFieldValue: (
    newField: string | number | null | undefined,
    legacyField: string | number | null | undefined,
    defaultValue?: string
  ) => string | number;
}

const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  customer,
  getValue,
  getFieldValue,
}) => {
  return (
    <div className="customer-info-section">
      <h3 className="section-title">
        <UserIcon className="section-icon" />
        Lični podaci
      </h3>
      
      <div className="info-grid">
        <div className="info-item">
          <div className="info-item__label">
            <UserIcon className="info-icon" />
            Ime i prezime
          </div>
          <div className="info-item__value">
            {getValue(customer.name)}
          </div>
        </div>

        <div className="info-item">
          <div className="info-item__label">
            <MailIcon className="info-icon" />
            Email adresa
          </div>
          <div className="info-item__value">
            {getValue(customer.email)}
          </div>
        </div>

        <div className="info-item">
          <div className="info-item__label">
            <PhoneIcon className="info-icon" />
            Broj telefona
          </div>
          <div className="info-item__value">
            {getFieldValue(customer.phoneNumber, (customer as any).phone_number)}
          </div>
        </div>

        <div className="info-item">
          <div className="info-item__label">
            <LocationMarkerIcon className="info-icon" />
            Adresa
          </div>
          <div className="info-item__value">
            {getValue(customer.address)}
          </div>
        </div>

        <div className="info-item">
          <div className="info-item__label">
            <IdentificationIcon className="info-icon" />
            Zemlja porijekla
          </div>
          <div className="info-item__value">
            {getFieldValue(customer.countryOfOrigin, (customer as any).country_of_origin)}
          </div>
        </div>

        {/* Bosnia and Herzegovina Additional Fields */}
        {(customer.countryOfOrigin === 'Bosnia and Herzegovina' || (customer as any).country_of_origin === 'Bosnia and Herzegovina') && (
          <>
            {(customer.fatherName || (customer as any).father_name) && (
              <div className="info-item">
                <div className="info-item__label">
                  <UserIcon className="info-icon" />
                  Ime oca
                </div>
                <div className="info-item__value">
                  {getFieldValue(customer.fatherName, (customer as any).father_name)}
                </div>
              </div>
            )}

            {(customer.cityOfResidence || (customer as any).city_of_residence) && (
              <div className="info-item">
                <div className="info-item__label">
                  <LocationMarkerIcon className="info-icon" />
                  Grad prebivališta
                </div>
                <div className="info-item__value">
                  {getFieldValue(customer.cityOfResidence, (customer as any).city_of_residence)}
                </div>
              </div>
            )}

            {(customer.idOfPerson || (customer as any).id_of_person) && (
              <div className="info-item">
                <div className="info-item__label">
                  <IdentificationIcon className="info-icon" />
                  JMBG
                </div>
                <div className="info-item__value">
                  {getFieldValue(customer.idOfPerson, (customer as any).id_of_person)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoSection;