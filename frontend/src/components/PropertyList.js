import React, { useState, useEffect } from 'react';
import { contractService } from '../utils/contract';
import { Lock, FileText, Search, X, Building, Construction, MapPin, User, Settings, Ban, AlertTriangle, RotateCcw, CheckCircle, TrendingUp, TrendingDown, AlphabeticalIcon, Sparkles } from 'lucide-react';
import PropertyDetails from './PropertyDetails';
import TransferProperty from './TransferProperty';
import ManageProperty from './ManageProperty';

export default function PropertyList({ connectedAccount, mode, refreshTrigger, onStatsUpdate }) {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (connectedAccount) {
      fetchProperties();
    }
  }, [connectedAccount, mode, refreshTrigger]);
  
  const fetchProperties = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Initialize contract service
      await contractService.init(connectedAccount, mode || 'demo');
      
      console.log('Fetching properties from blockchain...');
      
      // Get real blockchain data
      const blockchainProperties = await contractService.getAllProperties();
      
      console.log('Properties from blockchain:', blockchainProperties);
      
      // Format for display
      const formattedProperties = blockchainProperties.map(property => ({
        ...property,
        ownerName: getOwnerName(property.owner),
        registrationDate: new Date(property.registrationDate * 1000).toISOString().split('T')[0]
      }));
      
      setProperties(formattedProperties);

      if (onStatsUpdate) {
        onStatsUpdate(formattedProperties);
      }
      
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties from blockchain: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get friendly names for demo accounts
  const getOwnerName = (address) => {
    const demoAccounts = {
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': 'Alice (Property Owner)',
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': 'Bob (Buyer)',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC': 'Carol (Developer)'
    };
    
    return demoAccounts[address] || `User (${formatAddress(address)})`;
  };

  const filteredAndSortedProperties = React.useMemo(() => {
    let filtered = properties.filter(property => {
      // Text search
      const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      let matchesFilter = true;
      switch (filterBy) {
        case 'available':
          matchesFilter = property.availableAirRights > 0;
          break;
        case 'none':
          matchesFilter = property.availableAirRights === 0;
          break;
        case 'mine':
          matchesFilter = property.owner.toLowerCase() === connectedAccount.toLowerCase();
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });

    // Sort the results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.registrationDate) - new Date(b.registrationDate);
        case 'newest':
          return new Date(b.registrationDate) - new Date(a.registrationDate);
        case 'most-rights':
          return b.availableAirRights - a.availableAirRights;
        case 'least-rights':
          return a.availableAirRights - b.availableAirRights;
        case 'alphabetical':
          return a.address.localeCompare(b.address);
        default:
          return 0;
      }
    });

    return filtered;
  }, [properties, searchTerm, filterBy, sortBy, connectedAccount]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!connectedAccount) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Lock size={48} className="text-yellow-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connect First</h3>
        <p className="text-yellow-700">Please connect your wallet to view registered properties</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText size={32} className="text-emerald-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Registered Properties</h2>
            <p className="text-gray-600">
              {properties.length} properties found on blockchain
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchProperties}
          disabled={isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 
            <RotateCcw size={16} className="animate-spin" /> : 
            <RotateCcw size={16} />
          } Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Search by address or owner..."
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
                    <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 h-16"></div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-gray-100 rounded-xl p-6 w-full h-48"></div>
                </div>
              </div>
            </div>
          ))}
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 text-emerald-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
              <span className="font-medium">Loading properties from blockchain...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <AlertTriangle size={16} className="inline mr-2" />
          {error}
        </div>
      )}

      {/* Enhanced Search & Filters */}
      <div className="bg-white rounded-xl shadow-md border border-emerald-200 p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Search by address or owner..."
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdown */}
          <div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="all">All Properties</option>
              <option value="available">Air Rights Available</option>
              <option value="none">No Air Rights</option>
              <option value="mine">My Properties</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-rights">Most Air Rights</option>
              <option value="least-rights">Least Air Rights</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>

        {/* Filter Results Summary */}
        {(searchTerm || filterBy !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Showing {filteredAndSortedProperties.length} of {properties.length} properties</span>
                {searchTerm && (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
                {filterBy !== 'all' && (
                  <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs">
                    Filter: {filterBy}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                  setSortBy('newest');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Properties Grid */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredAndSortedProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? 'No Properties Found' : 'No Properties Registered'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Register your first property to get started!'
                }
              </p>
            </div>
          ) : (
            filteredAndSortedProperties.map((property) => (
              <div
                key={property.id}
                className="border border-emerald-200 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Property Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {property.address}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                            ID #{property.id}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={16} className="text-gray-400" /> {property.registrationDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Building Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-emerald-600 font-medium">Total Floors</p>
                            <p className="text-2xl font-bold text-emerald-800">{property.totalFloors}</p>
                          </div>
                          <div className="text-2xl">
                            <Construction size={24} className="text-emerald-600" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-violet-600 font-medium">Built Floors</p>
                            <p className="text-2xl font-bold text-violet-800">{property.currentFloors}</p>
                          </div>
                          <div className="text-2xl">
                            <Building size={24} className="text-violet-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {property.ownerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{property.ownerName}</p>
                        <p className="text-xs text-gray-500 font-mono">{formatAddress(property.owner)}</p>
                      </div>
                      {property.owner.toLowerCase() === connectedAccount.toLowerCase() && (
                        <span className="ml-auto bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                          Your Property
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Air Rights Display */}
                  <div className="flex items-center justify-center">
                    <div className={`relative text-center p-6 rounded-xl border-2 ${
                      property.availableAirRights === 0 
                        ? 'border-red-200 bg-red-50' 
                        : property.availableAirRights <= 3
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-emerald-200 bg-emerald-50'
                    }`}>
                      {property.availableAirRights > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                      
                      <div className="text-4xl mb-3">
                        {property.availableAirRights === 0 ? (
                          <div className="w-10 h-10 bg-red-500 rounded-full mx-auto"></div>
                        ) : property.availableAirRights <= 3 ? (
                          <div className="w-10 h-10 bg-orange-500 rounded-full mx-auto"></div>
                        ) : (
                          <div className="w-10 h-10 bg-emerald-500 rounded-full mx-auto"></div>
                        )}
                      </div>
                      
                      <div className="text-3xl font-bold mb-2 text-gray-800">
                        {property.availableAirRights}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Air Rights Available
                      </div>
                      <div className="text-xs text-gray-600">
                        {property.availableAirRights === 0 
                          ? (
                              <div className="flex items-center justify-center">
                                <Ban size={12} className="mr-1" />
                                Fully Utilized
                              </div>
                            )
                          : (
                              <div className="flex items-center justify-center">
                                <Sparkles size={12} className="mr-1" />
                                {property.availableAirRights} floors to build
                              </div>
                            )
                        }
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(property.currentFloors / property.totalFloors) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((property.currentFloors / property.totalFloors) * 100)}% built
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setSelectedProperty(property);
                      setActiveModal('details');
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-sm font-semibold"
                  >
                    <FileText size={16} className="mr-1" />
                    Details
                  </button>
                  {property.availableAirRights > 0 ? (
                    <button 
                      onClick={() => {
                        setSelectedProperty(property);
                        setActiveModal('transfer');
                      }}
                      className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-sm font-semibold"
                    >
                      <Construction size={16} className="mr-1" />
                      Transfer
                    </button>
                  ) : (
                    <button className="bg-gray-300 text-gray-500 py-3 px-4 rounded-lg text-sm font-semibold cursor-not-allowed">
                        <Ban size={16} className="mr-1" />
                        No Rights
                    </button>
                  )}
                  {property.owner.toLowerCase() === connectedAccount.toLowerCase() ? (
                    <button 
                      onClick={() => {
                        setSelectedProperty(property);
                        setActiveModal('manage');
                      }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-sm font-semibold"
                    >
                      <Settings size={16} className="mr-1" />
                      Manage
                    </button>
                  ) : (
                    <button className="bg-gray-100 text-gray-400 py-3 px-4 rounded-lg text-sm font-semibold cursor-not-allowed">
                      <User size={16} className="mr-1" />
                      Not Owner
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stats Footer */}
      {filteredAndSortedProperties.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {filteredAndSortedProperties.length}
              </div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">
                {filteredAndSortedProperties.reduce((sum, p) => sum + p.availableAirRights, 0)}
              </div>
              <div className="text-sm text-gray-600">Available Air Rights</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredAndSortedProperties.filter(p => p.availableAirRights > 0).length}
              </div>
              <div className="text-sm text-gray-600">Available for Transfer</div>
            </div>
          </div>
        </div>
      )}

    {/* Modals */}
    {activeModal === 'details' && (
      <PropertyDetails 
        property={selectedProperty} 
        onClose={() => {
          setActiveModal(null);
          setSelectedProperty(null);
        }} 
      />
    )}

    {activeModal === 'transfer' && (
      <TransferProperty 
        property={selectedProperty} 
        onClose={() => {
          setActiveModal(null);
          setSelectedProperty(null);
        }}
        onTransferComplete={() => {
          fetchProperties(); // Refresh the list
        }}
      />
    )}

    {activeModal === 'manage' && (
      <ManageProperty 
        property={selectedProperty} 
        onClose={() => {
          setActiveModal(null);
          setSelectedProperty(null);
        }}
        onUpdateComplete={() => {
          fetchProperties(); // Refresh the list
        }}
      />
    )}
    </div>
  );
}