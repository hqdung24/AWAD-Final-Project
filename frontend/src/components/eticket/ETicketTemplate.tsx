import { forwardRef } from 'react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Passenger {
  fullName: string;
  seatCode: string;
  documentId: string;
}

interface ETicketTemplateProps {
  bookingReference: string;
  bookingId: string;
  status: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime?: Date;
  passengers: Passenger[];
  totalAmount: number;
  ticketVerifyUrl?: string;
  name: string;
  email: string;
  phone: string;
  pickupPoint?: string;
  dropoffPoint?: string;
}

const ETicketTemplate = forwardRef<HTMLDivElement, ETicketTemplateProps>(
  (props, ref) => {
    const {
      bookingReference,
      origin,
      destination,
      departureTime,
      arrivalTime,
      passengers,
      totalAmount,
      ticketVerifyUrl,
      name,
      email,
      phone,
      status,
      pickupPoint,
      dropoffPoint,
    } = props;

    const statusColor =
      {
        paid: '#10b981',
        pending: '#f59e0b',
        cancelled: '#ef4444',
        expired: '#6b7280',
      }[status] || '#111827';

    const departureDate = new Date(departureTime);
    const arrivalDate = arrivalTime ? new Date(arrivalTime) : null;

    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          color: '#111827',
          boxSizing: 'border-box',
        }}
      >
        {/* ================= HEADER ================= */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `3px solid ${statusColor}`,
            paddingBottom: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '26px',
                letterSpacing: '1px',
              }}
            >
              E-TICKET
            </h1>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              Bus Ticket Booking
            </p>
          </div>
        </div>

        {/* ================= BOOKING + QR ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '24px',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '6px',
              }}
            >
              BOOKING REFERENCE
            </p>
            <p
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                letterSpacing: '3px',
                margin: 0,
              }}
            >
              {bookingReference}
            </p>
          </div>

          {ticketVerifyUrl && (
            <div
              style={{
                padding: '12px',
                border: '1px dashed #d1d5db',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <QRCode value={ticketVerifyUrl} size={110} />
              <p
                style={{
                  marginTop: '6px',
                  fontSize: '9px',
                  color: '#6b7280',
                }}
              >
                Scan at boarding
              </p>
            </div>
          )}
        </div>

        {/* ================= TRIP DETAILS ================= */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '10px',
            marginBottom: '28px',
          }}
        >
          <h2
            style={{
              margin: '0 0 14px 0',
              fontSize: '13px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Trip Details
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* FROM */}
            <div>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>FROM</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{origin}</p>
              <p style={{ fontSize: '12px', color: '#374151' }}>
                {format(departureDate, 'HH:mm · dd MMM yyyy', { locale: vi })}
              </p>
            </div>

            {/* ARROW */}
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#9ca3af',
              }}
            >
              →
            </div>

            {/* TO */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>TO</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {destination}
              </p>
              {arrivalDate && (
                <p style={{ fontSize: '12px', color: '#374151' }}>
                  {format(arrivalDate, 'HH:mm · dd MMM yyyy', { locale: vi })}
                </p>
              )}
            </div>
          </div>

          {(pickupPoint || dropoffPoint) && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              {pickupPoint && (
                <div>
                  <p style={{ fontSize: '10px', color: '#6b7280' }}>
                    PICKUP POINT
                  </p>
                  <p style={{ fontSize: '12px' }}>{pickupPoint}</p>
                </div>
              )}
              {dropoffPoint && (
                <div>
                  <p style={{ fontSize: '10px', color: '#6b7280' }}>
                    DROPOFF POINT
                  </p>
                  <p style={{ fontSize: '12px' }}>{dropoffPoint}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= PASSENGERS ================= */}
        <div style={{ marginBottom: '28px' }}>
          <h2
            style={{
              marginBottom: '12px',
              fontSize: '13px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Passengers ({passengers.length})
          </h2>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '11px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Seat</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>
                  Document ID
                </th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px' }}>{p.fullName}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <span
                      style={{
                        backgroundColor: '#f3f4f6',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                      }}
                    >
                      {p.seatCode}
                    </span>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {p.documentId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= CONTACT + TOTAL ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          <div>
            <h3
              style={{
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              Contact Information
            </h3>
            <p style={{ fontSize: '11px' }}>Name: {name}</p>
            <p style={{ fontSize: '11px' }}>Email: {email}</p>
            <p style={{ fontSize: '11px' }}>Phone: {phone}</p>
          </div>

          <div
            style={{
              backgroundColor: statusColor,
              color: '#ffffff',
              padding: '16px',
              borderRadius: '10px',
              textAlign: 'right',
            }}
          >
            <p style={{ fontSize: '11px', opacity: 0.9 }}>Total Amount</p>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(totalAmount)}
            </p>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px',
            textAlign: 'center',
            fontSize: '10px',
            color: '#6b7280',
          }}
        >
          <p>This is a digital ticket. Please keep it safe.</p>
          <p>Support: support@vatimotravel.com</p>
          <p style={{ fontSize: '9px', color: '#9ca3af' }}>
            Generated on{' '}
            {format(new Date(), 'dd MMM yyyy HH:mm', { locale: vi })}
          </p>
        </div>
      </div>
    );
  }
);

ETicketTemplate.displayName = 'ETicketTemplate';

export default ETicketTemplate;
