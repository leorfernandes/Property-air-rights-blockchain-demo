import React, { useState, useEffect } from 'react';
import { Link2, Gamepad2, Chrome, Lock, Plug, RotateCcw } from 'lucide-react';

export default function ConnectWallet({ onWalletConnected }) {
  const [account, setAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('');
  const [mode, setMode] = useState(''); // 'demo' or 'metamask'

  // Demo accounts (from Hardhat's default accounts)
  const DEMO_ACCOUNTS = [
    {
      name: 'Alice (Property Owner)',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      balance: '10000.0000',
      role: 'Property Owner'
    },
    {
      name: 'Bob (Buyer)',
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      balance: '10000.0000',
      role: 'Buyer'
    },
    {
      name: 'Carol (Developer)',
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      balance: '10000.0000',
      role: 'Developer'
    }
  ];

  const [selectedDemoAccount, setSelectedDemoAccount] = useState(0);

  useEffect(() => {
    if (mode === 'metamask') {
      checkIfWalletConnected();
    }
  }, [mode]);

  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask not detected. Please install MetaMask or use Demo Mode!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await getBalance(accounts[0]);
        onWalletConnected(accounts[0]);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
      setError('Error checking wallet connection');
    }
  };

  const connectMetaMask = async () => {
    try {
      setIsConnecting(true);
      setError('');

      if (!window.ethereum) {
        setError('MetaMask not detected. Please install MetaMask or use Demo Mode!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await getBalance(accounts[0]);
        onWalletConnected(accounts[0], 'metamask');
        await switchToLocalhost();
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again or use Demo Mode.');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectDemoAccount = (accountIndex) => {
    const demoAccount = DEMO_ACCOUNTS[accountIndex];
    setAccount(demoAccount.address);
    setBalance(demoAccount.balance);
    setSelectedDemoAccount(accountIndex);
    setMode('demo');
    setError('');
    onWalletConnected(demoAccount.address, 'demo');
  };

  const getBalance = async (address) => {
    try {
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
      setBalance(balanceEth.toFixed(4));
    } catch (err) {
      console.error('Error getting balance:', err);
    }
  };

  const switchToLocalhost = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x539',
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://localhost:8545'],
            }]
          });
        } catch (addError) {
          console.error('Error adding localhost network:', addError);
        }
      }
    }
  };

  const disconnect = () => {
    setAccount('');
    setBalance('');
    setError('');
    setMode('');
    onWalletConnected('');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getCurrentAccountName = () => {
    if (mode === 'demo') {
      return DEMO_ACCOUNTS[selectedDemoAccount].name;
    }
    return 'MetaMask Account';
  };

  return (
    <div className="my-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 max-w-4xl mx-auto">
        {!account ? (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-3">
                Connect to Blockchain
              </h3>
              <p className="text-gray-600 text-lg">Choose how you'd like to interact with the Property Registry</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Demo Mode */}
              <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <div className="text-center mb-4">
                    <Gamepad2 size={48} className="text-blue-500 mx-auto mb-2" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Demo Mode</h4>
                  <p className="text-gray-600 text-sm mb-4">Perfect for demonstrations - no wallet needed!</p>
                </div>

                <div className="space-y-3">
                  {DEMO_ACCOUNTS.map((account, index) => (
                    <button
                      key={index}
                      onClick={() => connectDemoAccount(index)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-semibold text-gray-800">{account.name}</div>
                      <div className="text-sm text-gray-600">{account.role}</div>
                      <div className="text-xs font-mono text-gray-500 mt-1">
                        {formatAddress(account.address)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* MetaMask Mode */}
              <div className="border-2 border-orange-200 rounded-lg p-6 hover:border-orange-400 transition-colors">
                <div className="text-center mb-4">
                  <Chrome size={48} className="text-orange-500 mx-auto mb-2" />
                  <h4 className="text-xl font-bold text-gray-800 mb-2">MetaMask</h4>
                  <p className="text-gray-600 text-sm mb-4">Use your own wallet for real transactions</p>
                </div>

                {error && !error.includes('Demo Mode') && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    ⚠️ {error}
                    {error.includes('MetaMask not detected') && (
                      <div className="mt-2">
                        <a 
                          href="https://metamask.io/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Install MetaMask Extension
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={() => {
                    setMode('metamask');
                    connectMetaMask();
                  }}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <div className="flex items-center justify-center">
                      <RotateCcw size={16} className="animate-spin mr-2" />
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Chrome size={16} className="mr-2" />
                      Connect MetaMask
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Connected state
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {mode === 'demo' ? 
                  <Gamepad2 size={24} className="text-blue-600" /> : 
                  <Chrome size={24} className="text-orange-500" />
                }
                <div>
                  <div className="font-bold text-gray-800 text-lg">{getCurrentAccountName()}</div>
                  <div className="text-sm text-gray-600">
                    {mode === 'demo' ? 'Demo Account' : 'MetaMask Account'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">Address:</span>
                <span className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-gray-700">
                  {formatAddress(account)}
                </span>
              </div>
              
              {balance && (
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-700">Balance:</span>
                  <span className="text-green-600 font-bold text-lg">{balance} ETH</span>
                </div>
              )}
            </div>
            
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              onClick={disconnect}
            >
              <Plug size={16} className="mr-2" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}