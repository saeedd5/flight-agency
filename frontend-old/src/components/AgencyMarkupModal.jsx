import React, { useState, useEffect } from 'react';
import { Modal, InputNumber, message } from 'antd';
import { saveAgencyFlight } from '../services/agencyApi'; // فقط همین ایمپورت کافیست

export default function AgencyMarkupModal({ isOpen, onClose, flight }) {
  const [markup, setMarkup] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (flight) {
      setFinalPrice(flight.price + (flight.price * (markup / 100)));
    }
  }, [markup, flight]);

const handleSave = async () => {
    if (!flight) return;
    setLoading(true);
    try {
      // --- تغییر بسیار مهم: پیدا کردن تاریخ دقیق پرواز ---
      // اگر flight.departureTime خالی بود، از اولین سگمنت پرواز (legs) تاریخ را برمی‌داریم
      const firstSegment = flight.legs ? flight.legs[0] : null;
      const actualDepartureTime = flight.departureTime || (firstSegment ? firstSegment.departureTime : null);
      
      if (!actualDepartureTime) {
        message.error('خطا: تاریخ پرواز در اطلاعات یافت نشد!');
        setLoading(false);
        return;
      }
      // ---------------------------------------------------

      await saveAgencyFlight({
        FlightKey: flight.id || flight.key,
        Airline: flight.airline,
        FlightNumber: flight.flightNumber || 'N/A',
        Origin: flight.origin,
        Destination: flight.destination,
        // --- از تاریخ تصحیح شده استفاده می‌کنیم ---
        DepartureTime: actualDepartureTime, 
        BasePrice: flight.price,
        MarkupPercentage: markup,
        Currency: flight.currency || 'USD',
        RawFlightData: JSON.stringify(flight) 
      });
      message.success('بلیط با موفقیت به پنل شما اضافه شد.');
      onClose();
    } catch (error) {
      message.error(error.message || 'خطا در ذخیره بلیط.');
    } finally {
      setLoading(false);
    }
  };

  if (!flight) return null;

  return (
    <Modal
      title="Add to My Tickets (Agency Markup)"
      open={isOpen}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Save to Panel"
    >
      <div className="flex flex-col gap-4 my-4">
        <p><strong>Flight:</strong> {flight.origin} ➔ {flight.destination} ({flight.airline})</p>
        <p><strong>Base Price:</strong> {flight.price} {flight.currency}</p>
        
        <div>
          <label className="block mb-2 font-bold">Markup Percentage (%):</label>
          <InputNumber 
            min={0} 
            max={100} 
            value={markup} 
            onChange={(val) => setMarkup(val || 0)} 
            className="w-full"
            size="large"
          />
        </div>

        <div className="bg-green-100 p-3 rounded-md text-green-800 text-lg font-bold text-center mt-2">
          Final Price: {finalPrice.toFixed(2)} {flight.currency}
        </div>
      </div>
    </Modal>
  );
}