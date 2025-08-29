import { ethers } from 'ethers';

// Your contract ABI (we'll get this from the compiled contract)
const CONTRACT_ABI = [
    "function registerProperty(string memory _propertyAddress, uint256 _totalFloors, uint256 _currentFloors) external",
    "function getPropertyInfo(uint256 _propertyId) external view returns (address owner, string memory propertyAddress, uint256 totalFloors, uint256 currentFloors, uint256 availableAirRights, uint256 registrationDate)", // Fixed order
    "function getPropertyByAddress(string memory _propertyAddress) external view returns (uint256 propertyId, address owner, uint256 totalFloors, uint256 currentFloors, uint256 availableAirRights)", // Fixed order
    "function transferOwnership(uint256 _propertyId, address _newOwner, string memory _reason) external",
    "function getPropertyCount() external view returns (uint256)",
    "function getAllProperties() public view returns (uint256[] memory)", // Added this one!
    "event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string propertyAddress)",
    "event OwnershipTransferred(uint256 indexed propertyId, address indexed oldOwner, address indexed newOwner, string reason)"
];

// Contract address (set after deployment)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat deployment address

class ContractService {
    constructor() {
        this.provider = null;
        this.contract = null;
        this.signer = null;
    }

    // Initialize connection
    async init(account, mode = 'metamask') {
        try {
            if (mode === 'demo') {
                // Use Hardhat's local provider for demo accounts
                this.provider = new ethers.JsonRpcProvider('http://localhost:8545');

                // For demo mode, we need to use the private key to create a signer
                // These are Hardhat's default test account private keys
                const demoPrivateKeys = [
                    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Alice
                    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Bob
                    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"  // Carol
                ];

                // Find the right private key for the account
                const accounts = [
                    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 
                    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                ];

                const accountIndex = accounts.findIndex(addr =>
                    addr.toLowerCase() === account.toLowerCase()
                );

                if (accountIndex !== -1) {
                    this.signer = new ethers.Wallet(demoPrivateKeys[accountIndex], this.provider);
                } else {
                    throw new Error('Demo account not found');
                }
                
            } else {
                // MetaMask mode
                if (!window.ethereum) {
                    throw new Error('MetaMask not available');
                }

                this.provider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await this.provider.getSigner();
            }

            // Create contract instance
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

            console.log('Contract service initialized successfully');
            return true;

        } catch (error) {
            console.error('Error initializing contract service:', error);
            throw error;
        }
    }

    // Register a new property
    async registerProperty(propertyAddress, totalFloors, currentFloors) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            console.log('Registering property:', { propertyAddress, totalFloors, currentFloors });

            const tx = await this.contract.registerProperty(
                propertyAddress,
                parseInt(totalFloors),
                parseInt(currentFloors)
            );

            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            return receipt;

        } catch (error) {
            console.error('Error registering property:', error);
            throw error;
        }
    }

    // Get total number of properties
    async getPropertyCount() {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const count = await this.contract.getPropertyCount();
            return parseInt(count.toString());
        } catch (error) {
            console.error('Error getting property count:', error);
            throw error;
        }
    }

    // Get property by ID
    async getPropertyInfo(propertyId) {
    if (!this.contract) {
        throw new Error('Contract not initialized');
    }

    try {
        const result = await this.contract.getPropertyInfo(propertyId);

        return {
            id: propertyId,
            owner: result[0],              // owner is first now
            address: result[1],            // address is second
            totalFloors: parseInt(result[2].toString()),
            currentFloors: parseInt(result[3].toString()),
            availableAirRights: parseInt(result[4].toString()),
            registrationDate: parseInt(result[5].toString())
        };

    } catch (error) {
        console.error('Error getting property info:', error);
        throw error;
    }
}

    // Get all properties
    async getAllProperties() {
  if (!this.contract) {
    throw new Error('Contract not initialized');
  }

  try {
    console.log('Getting property IDs from blockchain...');
    
    // This returns an array of property IDs (not property data)
    const propertyIds = await this.contract.getAllProperties();
    console.log('Property IDs from blockchain:', propertyIds);
    
    if (propertyIds.length === 0) {
      console.log('No properties found on blockchain');
      return [];
    }
    
    const properties = [];
    
    // Now get detailed info for each property ID
    for (let i = 0; i < propertyIds.length; i++) {
      try {
        const propertyId = parseInt(propertyIds[i].toString());
        const property = await this.getPropertyInfo(propertyId);
        properties.push(property);
        console.log(`Property ${propertyId}:`, property);
      } catch (error) {
        console.warn(`Error getting property ${propertyIds[i]}:`, error.message);
      }
    }
    
    console.log('All properties fetched:', properties);
    return properties;
    
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    throw error;
  }
}

    // Search property by address
    async getPropertyByAddress(propertyAddress) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const result = await this.contract.getPropertyByAddress(propertyAddress);

            return {
                id: parseInt(result[0].toString()),
                totalFloors: parseInt(result[1].toString()),
                currentFloors: parseInt(result[2].toString()),
                availableAirRights: parseInt(result[3].toString()),
                owner: result[4]
            };
        } catch (error) {
            console.error('Error getting property by address:', error);
            throw error;
        }
    }

    // Transfer ownership
    async transferOwnership(propertyId, newOwner, reason) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const tx = await this.contract.transferOwnership(
                propertyId,
                newOwner,
                reason
            );

            const receipt = await tx.wait();
            return receipt;

        } catch (error) {
            console.error('Error transferring ownership:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const contractService = new ContractService();

// Helper functions
export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const isValidAddress = (address) => {
    try {
        ethers.getAddress(address);
        return true;
    } catch {
        return false;
    }
};
