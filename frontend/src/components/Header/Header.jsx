import { useTranslation } from '../../contexts/TranslationContext';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const { t, language, changeLanguage } = useTranslation();

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">Travelyn</div>
        <nav className="nav-links">
          <Link to="/saber-test">تست Saber</Link>
          <a href="#">{t('support')}</a>
          <a href="#">{t('aboutUs')}</a>
        </nav>
      </div>
      <div className="header-right">
        <button 
          className="lang-toggle"
          onClick={handleLanguageToggle}
          title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        >
          <span className="lang-flag">{language === 'en' ? '🇬🇧' : '🇸🇦'}</span>
          <span className="lang-code">{language === 'en' ? 'EN' : 'AR'}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;

