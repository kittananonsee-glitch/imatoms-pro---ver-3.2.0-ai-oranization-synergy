
import React, { useState, useEffect } from 'react';
import { AppView, User, Language, Theme } from './types';
import MainDashboard from './components/MainDashboard';
import AssetManager from './components/AssetManager';
import WorkOrderManager from './components/WorkOrderManager';
import MorningBriefManager from './components/MorningBriefManager';
import PPMManager from './components/PPMManager';
import AdminManager from './components/AdminManager';
import InventoryManager from './components/InventoryManager';
import AIAnalytics from './components/AIAnalytics';
import MobileAppHub from './components/MobileAppHub';
import DashboardMonitor from './components/DashboardMonitor';
import Login from './components/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAIN);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('EN');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('imatoms_theme');
    return (saved as Theme) || 'DIGITAL';
  });

  useEffect(() => {
    document.body.className = `h-full overflow-hidden theme-${theme.toLowerCase()}`;
  }, [theme]);

  const handleLanguageToggle = (l: Language) => {
    setLang(l);
    localStorage.setItem('imatoms_lang', l);
  };

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('imatoms_theme', t);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView(AppView.MAIN);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} lang={lang} setLang={handleLanguageToggle} />;
  }

  const renderView = () => {
    const props = { 
      lang, 
      setLang: handleLanguageToggle,
      theme,
      setTheme: handleThemeChange
    };

    switch (currentView) {
      case AppView.ASSET:
        return <AssetManager onBack={() => setCurrentView(AppView.MAIN)} />;
      case AppView.MORNING_BRIEF:
        return <MorningBriefManager onBack={() => setCurrentView(AppView.MAIN)} {...props} />;
      case AppView.WORK_ORDER:
        return <WorkOrderManager onBack={() => setCurrentView(AppView.MAIN)} {...props} />;
      case AppView.PPM:
        return <PPMManager onBack={() => setCurrentView(AppView.MAIN)} user={user!} {...props} />;
      case AppView.ADMIN:
        return <AdminManager onBack={() => setCurrentView(AppView.MAIN)} />;
      case AppView.INVENTORY:
        return <InventoryManager onBack={() => setCurrentView(AppView.MAIN)} user={user!} />;
      case AppView.AI_ANALYTICS:
        return <AIAnalytics onBack={() => setCurrentView(AppView.MAIN)} user={user!} {...props} />;
      case AppView.MOBILE_APPS:
        return <MobileAppHub onBack={() => setCurrentView(AppView.MAIN)} user={user!} />;
      case AppView.DASHBOARD_MONITOR:
        return <DashboardMonitor onBack={() => setCurrentView(AppView.MAIN)} />;
      case AppView.MAIN:
      default:
        return (
          <MainDashboard 
            user={user!} 
            onNavigate={(view) => setCurrentView(view)} 
            onLogout={handleLogout}
            {...props}
          />
        );
    }
  };

  return (
    <div className="h-full bg-transparent overflow-hidden">
      {renderView()}
    </div>
  );
};

export default App;
