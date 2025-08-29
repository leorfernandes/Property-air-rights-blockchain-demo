import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import PropertyForm from './components/PropertyForm';
import PropertyList from './components/PropertyList';
import Toast from './components/Toast'
import { Building2, Sparkles, Users, BarChart3, CheckCircle, Gamepad2, Chrome } from 'lucide-react';

function App() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [connectionMode, setConnectionMode] = useState('');
  const [refreshProperties, setRefreshProperties] = useState(0);
  const [globalStats, setGlobalStats] = useState({
    totalProperties: 0,
    totalAirRights: 0,
    activeOwners: 0,
    avgAirRights: 0
  });
  const [toast, setToast] = useState({ message: '', type: '' });

  // Function to show toast notifications
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Function to update global stats
  const updateGlobalStats = (properties) => {
    if (properties.length === 0) {
      setGlobalStats({ totalProperties: 0, totalAirRights: 0, activeOwners: 0, avgAirRights: 0 });
      return;
    }
    
    const totalAirRights = properties.reduce((sum, p) => sum + p.availableAirRights, 0);
    const uniqueOwners = new Set(properties.map(p => p.owner)).size;
    const avgAirRights = Math.round(totalAirRights / properties.length * 10) / 10;
    
    setGlobalStats({
      totalProperties: properties.length,
      totalAirRights,
      activeOwners: uniqueOwners,
      avgAirRights
    });
  };

  const handleWalletConnected = (account, mode = 'demo') => {
    setConnectedAccount(account);
    setConnectionMode(mode);
    showToast(`Connected with ${mode === 'demo' ? 'Demo Account' : 'MetaMask'}!`, 'success');
    console.log('Wallet connected:', account, 'Mode:', mode);
  };

  const handlePropertyRegistered = () => {
    setRefreshProperties(prev => prev + 1);
    showToast('Property registered successfully on blockchain!', 'success');
    console.log('Property registered successfully!');
  };  

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-900 via-green-800 to-violet-900 ">
      <header className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-violet-400 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-orange-400 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Main Title Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-5xl font-bold text-white">
                Property Air Rights
              </h1>
            </div>
            <p className="text-xl text-emerald-100 mb-2">
              Blockchain-Powered Real Estate Development Platform
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-200">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live on Blockchain</span>
            </div>
          </div>

          {/* Connection Status */}
          {connectedAccount && (
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full px-6 py-3 border border-emerald-300 border-opacity-30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">
                    {connectionMode === 'demo' ? (
                      <div className="flex items-center gap-2">
                        <Gamepad2 size={16} />
                        Demo Mode
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Chrome size={16} />
                        MetaMask Connected
                      </div>
                    )}
                  </span>
                  <span className="text-emerald-200 text-sm font-mono">
                    {connectedAccount.substring(0, 6)}...{connectedAccount.substring(connectedAccount.length - 4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live Stats Dashboard */}
          {connectedAccount && globalStats.totalProperties > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-emerald-300 border-opacity-20 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <Building2 size={32} className="text-emerald-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{globalStats.totalProperties}</div>
                  <div className="text-sm text-emerald-200">Properties</div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-violet-300 border-opacity-20 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <Sparkles size={32} className="text-violet-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{globalStats.totalAirRights}</div>
                  <div className="text-sm text-violet-200">Air Rights</div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-emerald-300 border-opacity-20 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <Users size={32} className="text-emerald-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{globalStats.activeOwners}</div>
                  <div className="text-sm text-emerald-200">Owners</div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-orange-300 border-opacity-20 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <BarChart3 size={32} className="text-orange-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{globalStats.avgAirRights}</div>
                  <div className="text-sm text-orange-200">Avg Rights</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
        
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <ConnectWallet onWalletConnected={handleWalletConnected} />
        
        <PropertyForm 
          connectedAccount={connectedAccount}
          mode={connectionMode}
          onPropertyRegistered={handlePropertyRegistered}
        />
        
        <PropertyList 
          connectedAccount={connectedAccount}
          mode={connectionMode}
          refreshTrigger={refreshProperties}
          onStatsUpdate={updateGlobalStats}
        />
      </main>
      
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  );
}

export default App;