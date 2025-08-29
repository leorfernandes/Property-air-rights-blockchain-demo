# Property Air Rights Blockchain Demo

A comprehensive Web3 application demonstrating property registration and air rights management on the blockchain. Built with Solidity smart contracts, React frontend, and Ethereum integration.

## 🌟 Features

### Core Functionality
- **Property Registration**: Register properties with complete details on-chain
- **Air Rights Calculation**: Automatic calculation based on property dimensions
- **Ownership Transfer**: Secure blockchain-based property transfers
- **Real-time Search & Filter**: Dynamic property discovery
- **Multi-step Forms**: Intuitive property registration process

### Technical Highlights
- **Dual Authentication**: Demo accounts (Hardhat) + MetaMask support
- **Live Blockchain Data**: Real-time property stats and updates
- **Professional UI**: Emerald/violet themed interface with Lucide icons
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Smart Contract Events**: Comprehensive logging and transaction tracking

## 🛠️ Tech Stack

### Blockchain
- **Solidity**: Smart contract development
- **Hardhat**: Development environment and testing
- **Ethers.js**: Web3 integration library

### Frontend
- **React**: Component-based UI framework
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Professional icon library
- **Inter/Poppins**: Modern typography

### Development Tools
- **Node.js**: Runtime environment
- **NPM**: Package management
- **Local Ethereum Network**: Hardhat node

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- NPM or Yarn
- MetaMask browser extension (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd property-rights-final
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. **Start local blockchain**
   ```bash
   npx hardhat node
   ```

4. **Deploy smart contract** (in new terminal)
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Start frontend** (in new terminal)
   ```bash
   cd frontend
   npm start
   ```

6. **Open application**
   - Navigate to `http://localhost:3000`
   - Use demo accounts or connect MetaMask

## 🏠 Demo Usage

### Using Demo Accounts
The application includes 10 pre-funded Hardhat accounts for immediate testing:
- Click "Use Demo Account" and select from available accounts
- Each account has 10,000 ETH for testing transactions
- No MetaMask setup required

### MetaMask Setup (Optional)
1. Install MetaMask browser extension
2. Add custom network:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

### Property Registration Flow
1. **Connect Wallet**: Choose demo account or MetaMask
2. **Property Details**: Enter address, dimensions, and property type
3. **Review**: Confirm details and calculated air rights
4. **Submit**: Sign transaction and register on blockchain
5. **Verification**: View your property in the property list

## 📊 Property Types & Air Rights

The system supports various property types with different air rights calculations:

- **Residential**: Standard air rights based on lot size
- **Commercial**: Enhanced air rights for business districts
- **Industrial**: Specialized calculations for manufacturing zones
- **Mixed-Use**: Hybrid calculations combining residential and commercial

## 🧪 Testing

Run the comprehensive test suite:

```bash
npx hardhat test
```

Test coverage includes:
- Property registration functionality
- Air rights calculations
- Ownership transfers
- Event emissions
- Edge cases and error handling

## 📁 Project Structure

```
property-rights-final/
├── contracts/              # Solidity smart contracts
│   └── PropertyRegistry.sol
├── scripts/                # Deployment scripts
│   └── deploy.js
├── test/                   # Contract tests
│   └── PropertyRegistry.test.js
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS styling
│   │   └── utils/          # Web3 utilities
│   └── public/             # Static assets
├── artifacts/              # Compiled contracts
└── cache/                  # Build cache
```

## 🔒 Security Considerations

- Smart contracts use OpenZeppelin patterns
- Input validation on both frontend and contract levels
- Reentrancy protection implemented
- Access control for administrative functions
- Comprehensive error handling

## 🌐 Deployment

### Local Development
The application is configured for local development with Hardhat network.

### Production Deployment
For mainnet or testnet deployment:
1. Update `hardhat.config.js` with desired network
2. Configure environment variables for private keys
3. Deploy contracts with appropriate gas settings
4. Update frontend contract addresses

## 📈 Future Enhancements

**Property Transfer UI**: Complete the ownership transfer interface (smart contract function implemented)
- **Multi-chain Support**: Expand to other blockchain networks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Demo Purpose

This application was developed as a learning project and interview demonstration, showcasing:
- Full-stack Web3 development skills
- Smart contract design and implementation
- Modern React development practices
- Professional UI/UX design
- Blockchain integration expertise

## 📞 Contact

For questions about this demo project or Web3 development, please feel free to reach out.

---

*Built with ❤️ and lots of coffee by Leo Fernandes*
