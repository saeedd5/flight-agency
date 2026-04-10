import { useState } from 'react';
import Popover from 'antd/es/popover';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '../../contexts/TranslationContext';
import './TravelersSelector.css';

function TravelersSelector({ value, onChange }) {
  const { t, language, direction } = useTranslation();
  const [adults, setAdults] = useState(value?.adults || 1);
  const [children, setChildren] = useState(value?.children || 0);
  const [infants, setInfants] = useState(value?.infants || 0);
  const [open, setOpen] = useState(false);

  const handleIncrement = (type) => {
    if (type === 'adults') {
      const newValue = Math.min(adults + 1, 9);
      setAdults(newValue);
      onChange({ adults: newValue, children, infants });
    } else if (type === 'children') {
      const newValue = Math.min(children + 1, 9);
      setChildren(newValue);
      onChange({ adults, children: newValue, infants });
    } else if (type === 'infants') {
      const newValue = Math.min(infants + 1, 9);
      setInfants(newValue);
      onChange({ adults, children, infants: newValue });
    }
  };

  const handleDecrement = (type) => {
    if (type === 'adults') {
      const newValue = Math.max(adults - 1, 1);
      setAdults(newValue);
      onChange({ adults: newValue, children, infants });
    } else if (type === 'children') {
      const newValue = Math.max(children - 1, 0);
      setChildren(newValue);
      onChange({ adults, children: newValue, infants });
    } else if (type === 'infants') {
      const newValue = Math.max(infants - 1, 0);
      setInfants(newValue);
      onChange({ adults, children, infants: newValue });
    }
  };

  const totalTravelers = adults + children + infants;
  const displayText = totalTravelers === 1 
    ? `1 ${t('traveler') || 'Traveler'}`
    : `${totalTravelers} ${t('travelers') || 'Travelers'}`;

  const content = (
    <div className="travelers-selector-content" dir={direction}>
      <div className="traveler-row">
        <div className="traveler-info">
          <div className="traveler-label">{t('adult') || 'Adult'}</div>
          <div className="traveler-age">{t('adultAge') || '12+ years'}</div>
        </div>
        <div className="traveler-controls">
          {direction === 'rtl' ? (
            <>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleIncrement('adults')}
                disabled={adults >= 9}
                className="traveler-btn"
              />
              <span className="traveler-count">{adults}</span>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={() => handleDecrement('adults')}
                disabled={adults <= 1}
                className="traveler-btn"
              />
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={() => handleDecrement('adults')}
                disabled={adults <= 1}
                className="traveler-btn"
              />
              <span className="traveler-count">{adults}</span>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleIncrement('adults')}
                disabled={adults >= 9}
                className="traveler-btn"
              />
            </>
          )}
        </div>
      </div>

      <div className="traveler-row">
        <div className="traveler-info">
          <div className="traveler-label">{t('child') || 'Child'}</div>
          <div className="traveler-age">{t('childAge') || '2-11 years'}</div>
        </div>
        <div className="traveler-controls">
          {direction === 'rtl' ? (
            <>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleIncrement('children')}
                disabled={children >= 9}
                className="traveler-btn"
              />
              <span className="traveler-count">{children}</span>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={() => handleDecrement('children')}
                disabled={children <= 0}
                className="traveler-btn"
              />
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={() => handleDecrement('children')}
                disabled={children <= 0}
                className="traveler-btn"
              />
              <span className="traveler-count">{children}</span>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleIncrement('children')}
                disabled={children >= 9}
                className="traveler-btn"
              />
            </>
          )}
        </div>
      </div>

      <div className="traveler-row">
        <div className="traveler-info">
          <div className="traveler-label">{t('infant') || 'Infant'}</div>
          <div className="traveler-age">{t('infantAge') || '0-2 years'}</div>
        </div>
        <div className="traveler-controls">
          {direction === 'rtl' ? (
            <>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleIncrement('infants')}
                disabled={infants >= 9}
                className="traveler-btn"
              />
              <span className="traveler-count">{infants}</span>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={() => handleDecrement('infants')}
                disabled={infants <= 0}
                className="traveler-btn"
              />
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={() => handleDecrement('infants')}
                disabled={infants <= 0}
                className="traveler-btn"
              />
              <span className="traveler-count">{infants}</span>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleIncrement('infants')}
                disabled={infants >= 9}
                className="traveler-btn"
              />
            </>
          )}
        </div>
      </div>

      <div className="travelers-footer">
        <Button 
          type="primary" 
          block 
          onClick={() => setOpen(false)}
          className="travelers-done-btn"
        >
          {t('done') || 'Done'}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement={language === 'ar' ? 'bottomLeft' : 'bottomRight'}
      overlayClassName={`travelers-popover travelers-popover-${direction}`}
      overlayStyle={{ direction: direction }}
    >
      <Button 
        size="large" 
        className="travelers-trigger" 
        style={{ width: '100%', textAlign: direction === 'rtl' ? 'right' : 'left' }}
        dir={direction}
      >
        {displayText}
      </Button>
    </Popover>
  );
}

export default TravelersSelector;

