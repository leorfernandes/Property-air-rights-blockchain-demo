import React from 'react';
import { X, MapPin, Building, Construction, Calendar, User, Hash, Clock, TrendingUp } from 'lucide-react';

export default function PropertyDetails({ property, onClose }) {
  if (!property) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const utilizationPercentage = Math.round((property.currentFloors / property.totalFloors) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-violet-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Property Details</h2>
              <p className="text-emerald-100 flex items-center">
                <MapPin size={16} className="mr-2" />
                {property.address}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Property ID and Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Hash size={16} />
                <span className="font-medium">Property ID</span>
              </div>
              <p className="text-2xl font-bold text-emerald-800">#{property.id}</p>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-violet-600 mb-2">
                <User size={16} />
                <span className="font-medium">Owner</span>
              </div>
              <p className="font-semibold text-violet-800">{property.ownerName}</p>
              <p className="text-xs font-mono text-violet-600 mt-1">{formatAddress(property.owner)}</p>
            </div>
          </div>

          {/* Building Statistics */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building size={20} className="mr-2" />
              Building Information
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{property.totalFloors}</div>
                <div className="text-sm text-gray-600">Total Floors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-600">{property.currentFloors}</div>
                <div className="text-sm text-gray-600">Built Floors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{property.availableAirRights}</div>
                <div className="text-sm text-gray-600">Air Rights</div>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Building Utilization</span>
                <span>{utilizationPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-violet-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${utilizationPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                property.availableAirRights === 0 
                  ? 'bg-red-100 text-red-700'
                  : property.availableAirRights <= 3
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}>
                {property.availableAirRights === 0 
                  ? 'Fully Developed'
                  : `${property.availableAirRights} Floors Available for Development`
                }
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Calendar size={16} />
              <span className="font-medium">Registration Details</span>
            </div>
            <p className="text-blue-800">
              Registered on {formatDate(property.registrationDate)}
            </p>
          </div>

          {/* Development Potential */}
          {property.availableAirRights > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp size={16} />
                <span className="font-medium">Development Potential</span>
              </div>
              <p className="text-green-800">
                This property has <strong>{property.availableAirRights} floors</strong> of unused air rights 
                that can be developed or transferred to other properties.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}