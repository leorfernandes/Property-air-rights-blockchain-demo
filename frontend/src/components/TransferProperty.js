import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle, User, ArrowRight } from 'lucide-react';
import { contractService } from '../utils/contract';

export default function TransferProperty({ property, onClose, onTransferComplete }) {
  const [transferData, setTransferData] = useState({
    newOwner: '',
    reason: ''
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Enter details, 2: Confirm

  // Demo accounts for easy selection
  const DEMO_ACCOUNTS = [
    {
      name: 'Alice (Property Owner)',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    },
    {
      name: 'Bob (Buyer)',
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    },
    {
      name: 'Carol (Developer)',
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    }
  ];

  const availableAccounts = DEMO_ACCOUNTS.filter(acc => 
    acc.address.toLowerCase() !== property.owner.toLowerCase()
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleTransfer = async () => {
    if (!transferData.newOwner || !transferData.reason) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidAddress(transferData.newOwner)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    if (transferData.newOwner.toLowerCase() === property.owner.toLowerCase()) {
      setError('Cannot transfer to the same owner');
      return;
    }

    setIsTransferring(true);
    setError('');

    try {
      console.log('Transferring property:', property.id, 'to:', transferData.newOwner);
      
      const receipt = await contractService.transferOwnership(
        property.id,
        transferData.newOwner,
        transferData.reason
      );

      console.log('Transfer successful:', receipt);
      onTransferComplete();
      onClose();

    } catch (err) {
      console.error('Transfer error:', err);
      
      let errorMessage = 'Failed to transfer property.';
      if (err.message.includes('Only owner can transfer')) {
        errorMessage = 'Only the property owner can initiate transfers.';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction.';
      }
      
      setError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">Transfer Property</h2>
              <p className="text-violet-100 text-sm">{property.address}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-violet-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to Address *
                </label>
                <input
                  type="text"
                  name="newOwner"
                  value={transferData.newOwner}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                  placeholder="0x..."
                />
              </div>

              {/* Quick Select Demo Accounts */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Or select a demo account:</p>
                <div className="space-y-2">
                  {availableAccounts.map((account, index) => (
                    <button
                      key={index}
                      onClick={() => setTransferData(prev => ({ ...prev, newOwner: account.address }))}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-violet-50 hover:border-violet-300 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{account.name}</div>
                      <div className="text-sm font-mono text-gray-500">{formatAddress(account.address)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Transfer *
                </label>
                <textarea
                  name="reason"
                  value={transferData.reason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
                  rows="3"
                  placeholder="e.g., Sale of property, Gift to family member, Business transfer..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {error}
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!transferData.newOwner || !transferData.reason || !isValidAddress(transferData.newOwner)}
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                Review Transfer <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <h3 className="font-semibold text-violet-800 mb-3">Transfer Confirmation</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Property:</span>
                    <div className="font-medium text-gray-800">{property.address}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">From:</span>
                    <div className="font-medium text-gray-800">{property.ownerName}</div>
                    <div className="font-mono text-gray-500">{formatAddress(property.owner)}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">To:</span>
                    <div className="font-medium text-gray-800">{formatAddress(transferData.newOwner)}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <div className="font-medium text-gray-800">{transferData.reason}</div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Air Rights Included:</span>
                    <div className="font-medium text-orange-600">{property.availableAirRights} floors</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle size={16} className="text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> This action cannot be undone. The new owner will have full control over the property and its air rights.
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={isTransferring}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransferring ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Transferring...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send size={16} className="mr-2" />
                      Confirm Transfer
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}