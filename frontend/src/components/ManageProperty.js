import React, { useState } from 'react';
import { X, Save, AlertTriangle, CheckCircle, Building, TrendingUp } from 'lucide-react';
import { contractService } from '../utils/contract';

export default function ManageProperty({ property, onClose, onUpdateComplete }) {
  const [newCurrentFloors, setNewCurrentFloors] = useState(property.currentFloors);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    if (newCurrentFloors < 1) {
      setError('Current floors must be at least 1');
      return;
    }

    if (newCurrentFloors > property.totalFloors) {
      setError('Current floors cannot exceed total allowed floors');
      return;
    }

    if (newCurrentFloors === property.currentFloors) {
      setError('No changes to save');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      console.log('Updating air rights for property:', property.id, 'new floors:', newCurrentFloors);
      
      const receipt = await contractService.updateAirRights(property.id, newCurrentFloors);
      
      console.log('Update successful:', receipt);
      onUpdateComplete();
      onClose();

    } catch (err) {
      console.error('Update error:', err);
      
      let errorMessage = 'Failed to update property.';
      if (err.message.includes('Only owner can update')) {
        errorMessage = 'Only the property owner can update air rights.';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction.';
      }
      
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateNewAirRights = () => {
    return Math.max(0, property.totalFloors - newCurrentFloors);
  };

  const getChangeIndicator = () => {
    const currentRights = property.availableAirRights;
    const newRights = calculateNewAirRights();
    
    if (newRights > currentRights) {
      return { type: 'increase', amount: newRights - currentRights, color: 'text-red-600' };
    } else if (newRights < currentRights) {
      return { type: 'decrease', amount: currentRights - newRights, color: 'text-green-600' };
    }
    return { type: 'same', amount: 0, color: 'text-gray-600' };
  };

  if (!property) return null;

  const change = getChangeIndicator();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">Manage Property</h2>
              <p className="text-orange-100 text-sm">{property.address}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Current Status</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-emerald-600">{property.totalFloors}</div>
                <div className="text-xs text-gray-600">Total Floors</div>
              </div>
              <div>
                <div className="text-lg font-bold text-violet-600">{property.currentFloors}</div>
                <div className="text-xs text-gray-600">Current Floors</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{property.availableAirRights}</div>
                <div className="text-xs text-gray-600">Air Rights</div>
              </div>
            </div>
          </div>

          {/* Update Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Current Floors Built *
            </label>
            <input
              type="number"
              value={newCurrentFloors}
              onChange={(e) => setNewCurrentFloors(parseInt(e.target.value) || 0)}
              min="1"
              max={property.totalFloors}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg font-semibold text-center"
            />
            <p className="text-sm text-gray-500 mt-1">
              Range: 1 to {property.totalFloors} floors
            </p>
          </div>

          {/* Preview Changes */}
          {newCurrentFloors !== property.currentFloors && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <TrendingUp size={16} className="mr-2" />
                Preview Changes
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Built Floors:</span>
                  <span className="font-medium">
                    {property.currentFloors} → {newCurrentFloors}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Air Rights:</span>
                  <span className={`font-medium ${change.color}`}>
                    {property.availableAirRights} → {calculateNewAirRights()}
                    {change.type !== 'same' && (
                      <span className="ml-2">
                        ({change.type === 'increase' ? '+' : '-'}{change.amount})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Impact Message */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                {change.type === 'increase' && (
                  <p className="text-red-700 text-sm">
                    This will reduce available air rights by {change.amount} floors
                  </p>
                )}
                {change.type === 'decrease' && (
                  <p className="text-green-700 text-sm">
                    This will increase available air rights by {change.amount} floors
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating || newCurrentFloors === property.currentFloors}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save size={16} className="mr-2" />
                  Update Property
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}