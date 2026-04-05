import Tag from 'antd/es/tag';
import { useTranslation } from '../../contexts/TranslationContext';
import './TerminalBadge.css';

function TerminalBadge({ terminal, type = 'default' }) {
  const { t } = useTranslation();

  if (!terminal) return null;

  return (
    <Tag className={`terminal-badge terminal-badge-${type}`} color="blue">
      <span className="terminal-label">{t('terminal')}</span>
      <span className="terminal-value">{terminal}</span>
    </Tag>
  );
}

export default TerminalBadge;

