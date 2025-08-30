import React, { useState } from 'react';
import { contractService } from '../utils/contract';
import { Lock, Building, MapPin, Construction, ArrowRight, Eye, Rocket, AlertTriangle, CheckCircle, Info, Gamepad2, Sparkles  } from 'lucide-react';

export default function PropertyForm({ connectedAccount, mode, onPropertyRegistered }) {
  const [formData, setFormData] = useState({
    address: '',
    totalFloors: '',
    currentFloors: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

 const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    if (value) {
      setTimeout(() => validateField(name, value), 300);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate address
    if (!formData.address.trim()) {
      errors.address = 'Property address is required';
    } else if (formData.address.length < 10) {
      errors.address = 'Please enter a complete address';
    }
    
    // Validate total floors
    if (!formData.totalFloors || formData.totalFloors < 1) {
      errors.totalFloors = 'Must be at least 1 floor';
    } else if (formData.totalFloors > 200) {
      errors.totalFloors = 'Maximum 200 floors allowed';
    }
    
    // Validate current floors
    if (!formData.currentFloors || formData.currentFloors < 1) {
      errors.currentFloors = 'Must be at least 1 floor';
    } else if (parseInt(formData.currentFloors) > parseInt(formData.totalFloors)) {
      errors.currentFloors = 'Cannot exceed total floors';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Initialize contract service if not already done
      await contractService.init(connectedAccount, mode || 'demo');
      
      console.log('Registering property on blockchain:', formData);
      
      // Call actual smart contract function!
      const receipt = await contractService.registerProperty(
        formData.address,
        formData.totalFloors,
        formData.currentFloors
      );
      
      const airRights = parseInt(formData.totalFloors) - parseInt(formData.currentFloors);
      
      setSuccess(
        `Property registered on blockchain! 
         Transaction: ${receipt.transactionHash}
         Available air rights: ${airRights} floors`
      );
      
      // Reset form
      setFormData({
        address: '',
        totalFloors: '',
        currentFloors: ''
      });
      
      if (onPropertyRegistered) {
        onPropertyRegistered();
      }
      
    } catch (err) {
      console.error('Blockchain error:', err);
      
      let errorMessage = 'Failed to register property on blockchain.';
      
      if (err.message.includes('Property already registered')) {
        errorMessage = 'This property address is already registered!';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAirRights = () => {
    if (formData.totalFloors && formData.currentFloors) {
      const airRights = parseInt(formData.totalFloors) - parseInt(formData.currentFloors);
      return airRights >= 0 ? airRights : 0;
    }
    return 0;
  };

  if (!connectedAccount) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Lock size={48} className="text-yellow-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connect First</h3>
        <p className="text-yellow-700">Please connect your wallet to register properties</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
      <div className="flex items-center mb-6">
        <Building size={32} className="text-emerald-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Register New Property</h2>
          <p className="text-gray-600">Add your property to the blockchain registry</p>
          {mode === 'demo' && (
            <p className="text-emerald-600 text-sm mt-1">
              <Gamepad2 size={14} className="inline mr-1" />
              Demo Mode - Using test blockchain
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            formStep >= 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-300'
          }`}>
            {formStep > 1 ? '✓' : '1'}
          </div>
          <div className={`w-16 h-1 transition-all duration-300 ${
            formStep >= 2 ? 'bg-emerald-500' : 'bg-gray-300'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            formStep >= 2 ? 'bg-violet-500 border-violet-500 text-white' : 'border-gray-300 text-gray-300'
          }`}>
            {formStep > 2 ? '✓' : '2'}
          </div>
          <div className={`w-16 h-1 transition-all duration-300 ${
            formStep >= 3 ? 'bg-violet-500' : 'bg-gray-300'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            formStep >= 3 ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 text-gray-300'
          }`}>
            {formStep > 3 ? '✓' : '3'}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-sm text-gray-600 mb-8">
          <span className={formStep >= 1 ? 'text-emerald-600 font-medium' : ''}>Property Details</span>
          <span className={formStep >= 2 ? 'text-violet-600 font-medium' : ''}>Building Info</span>
          <span className={formStep >= 3 ? 'text-orange-600 font-medium' : ''}>Confirmation</span>
        </div>

        {/* Step 1: Property Address */}
        <div className={`transition-all duration-500 transform ${formStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 hidden'}`}>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              <MapPin size={20} className="inline mr-2" />
              Step 1: Property Address
            </h3>
            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Complete Property Address *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-lg ${
                    validationErrors.address ? 'border-red-300 bg-red-50' : 
                    formData.address.length > 10 ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 123 Main Street, New York, NY 10001"
                />
                {formData.address.length > 10 && !validationErrors.address && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 text-xl">
                    ✓
                  </div>
                )}
              </div>
              {validationErrors.address && (
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {validationErrors.address}
                </p>
              )}
              {formData.address.length > 10 && !validationErrors.address && (
                <p className="text-emerald-600 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  Address looks good!
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!formData.address || validationErrors.address}
              onClick={() => setFormStep(2)}
              className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
            >
              Continue to Building Details <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Step 2: Building Information */}
        <div className={`transition-all duration-500 transform ${formStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 hidden'}`}>
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-violet-800 mb-4">
              <Construction size={20} className="inline mr-2" />
              Step 2: Building Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Floors Allowed *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleInputChange}
                    min="1"
                    max="200"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-lg ${
                      validationErrors.totalFloors ? 'border-red-300 bg-red-50' : 
                      formData.totalFloors > 0 ? 'border-violet-300 bg-violet-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 15"
                  />
                  {formData.totalFloors > 0 && !validationErrors.totalFloors && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-500 text-xl">
                      ✓
                    </div>
                  )}
                </div>
                {validationErrors.totalFloors && (
                  <p className="text-red-600 text-sm mt-1">
                    <AlertTriangle size={16} className="inline mr-1" />
                    {validationErrors.totalFloors}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Floors Built *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="currentFloors"
                    value={formData.currentFloors}
                    onChange={handleInputChange}
                    min="1"
                    max="200"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-lg ${
                      validationErrors.currentFloors ? 'border-red-300 bg-red-50' : 
                      formData.currentFloors > 0 && !validationErrors.currentFloors ? 'border-violet-300 bg-violet-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 8"
                  />
                  {formData.currentFloors > 0 && !validationErrors.currentFloors && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-violet-500 text-xl">
                      ✓
                    </div>
                  )}
                </div>
                {validationErrors.currentFloors && (
                  <p className="text-red-600 text-sm mt-1">
                    <AlertTriangle size={16} className="inline mr-1" />
                    {validationErrors.currentFloors}
                  </p>
                )}
              </div>
            </div>

            {/* Live Air Rights Preview */}
            {formData.totalFloors && formData.currentFloors && !validationErrors.currentFloors && !validationErrors.totalFloors && (
              <div className="mt-6 bg-white border border-violet-300 rounded-xl p-6 transform transition-all duration-500 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-violet-800 text-lg flex items-center">
                      <Sparkles size={20} className="mr-2 text-violet-600" />
                      Available Air Rights
                    </h4>
                    <p className="text-violet-700">
                      <span className="text-3xl font-bold">{calculateAirRights()}</span> floors available for development
                    </p>
                  </div>
                  <div className="text-5xl">
                    {calculateAirRights() === 0 ? (
                      <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                    ) : calculateAirRights() <= 3 ? (
                      <div className="w-12 h-12 bg-orange-500 rounded-full"></div>
                    ) : (
                      <div className="w-12 h-12 bg-emerald-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Built: {formData.currentFloors} floors</span>
                    <span>Available: {calculateAirRights()} floors</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(formData.currentFloors / formData.totalFloors) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!formData.totalFloors || !formData.currentFloors || validationErrors.totalFloors || validationErrors.currentFloors}
                onClick={() => setFormStep(3)}
                className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                Review & Register <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Confirmation */}
        <div className={`transition-all duration-500 transform ${formStep === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 hidden'}`}>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-6">
              <Eye size={20} className="inline mr-2" />
              Step 3: Review & Confirm
            </h3>
            
            {/* Property Summary Card */}
            <div className="bg-white rounded-xl border border-orange-300 p-6 mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Info size={20} className="mr-2 text-orange-600" />
                Property Summary
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Property Address</p>
                    <p className="font-semibold text-gray-800">{formData.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Floors Allowed</p>
                    <p className="font-semibold text-gray-800">{formData.totalFloors} floors</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Floors Built</p>
                    <p className="font-semibold text-gray-800">{formData.currentFloors} floors</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className={`text-center p-6 rounded-xl border-2 ${
                    calculateAirRights() === 0 
                      ? 'border-red-200 bg-red-50' 
                      : calculateAirRights() <= 3
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-emerald-200 bg-emerald-50'
                  }`}>
                    <div className="text-4xl mb-2">
                      {calculateAirRights() === 0 ? (
                        <div className="w-12 h-12 bg-red-500 rounded-full mx-auto"></div>
                      ) : calculateAirRights() <= 3 ? (
                        <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto"></div>
                      ) : (
                        <div className="w-12 h-12 bg-emerald-500 rounded-full mx-auto"></div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      {calculateAirRights()}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      Air Rights Available
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormStep(2)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
              >
                ← Back to Edit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registering on Blockchain...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Rocket size={16} className="mr-2" />
                    Register Property on Blockchain
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <AlertTriangle size={16} className="inline mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl">
            <CheckCircle size={16} className="inline mr-2" />
            {success}
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-800 mb-2 flex items-center">
          <Info size={16} className="mr-2 text-emerald-600" />
          How Air Rights Work
        </h4>
        <p className="text-sm text-emerald-700">
          Air rights represent the unused building potential above your current structure. 
          If you're allowed 15 floors but only built 8, you have 7 floors of air rights 
          that can be sold or transferred to other developers.
        </p>
      </div>
    </div>
  );
}