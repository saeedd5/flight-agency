import { useTranslation } from '../../contexts/TranslationContext';
import { ClockCircleOutlined } from '@ant-design/icons';
import './LayoverIndicator.css';

function LayoverIndicator({ layoverMinutes, airport }) {
  const { t } = useTranslation();

  if (!layoverMinutes || layoverMinutes <= 0) return null;

  const hours = Math.floor(layoverMinutes / 60);
  const minutes = layoverMinutes % 60;
  const formattedTime = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim()
    : `${minutes}m`;

  return (
    <div className="layover-indicator">
      <div className="layover-line"></div>
      <div className="layover-content">
        <ClockCircleOutlined className="layover-icon" />
        <div className="layover-info">
          <span className="layover-label">{t('layover')}</span>
          <span className="layover-time">{formattedTime}</span>
          {airport && <span className="layover-airport">{airport}</span>}
        </div>
      </div>
      <div className="layover-line"></div>
    </div>
  );
}

export default LayoverIndicator;

