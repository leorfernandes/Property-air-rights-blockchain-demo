const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Deploying PropertyRegistry contract...");

    // Deploy PropertyRegistry
    const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.waitForDeployment();

    // Get the address correctly
    const propertyRegistryAddress = await propertyRegistry.getAddress();
    console.log("PropertyRegistry deployed to:", propertyRegistryAddress);

    // Deploy AirRightsMarketplace with PropertyRegistry address
    console.log("Deploying AirRightsMarketplace contract...");
    const AirRightsMarketplace = await hre.ethers.getContractFactory("AirRightsMarketplace");
    const marketplace = await AirRightsMarketplace.deploy(propertyRegistryAddress); // ← Fixed this line
    await marketplace.waitForDeployment();

    const marketplaceAddress = await marketplace.getAddress();
    console.log("AirRightsMarketplace deployed to:", marketplaceAddress);

    // Create frontend utils directory if it doesn't exist
    const dir = './frontend/src/utils/';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Save deployment info for BOTH contracts
    const deploymentInfo = {
        propertyRegistry: {
            address: propertyRegistryAddress,
            name: "PropertyRegistry"
        },
        marketplace: {
            address: marketplaceAddress,
            name: "AirRightsMarketplace"
        },
        deploymentDate: new Date().toISOString(),
        network: "localhost",
        // Keep backward compatibility
        contractAddress: propertyRegistryAddress
    };

    fs.writeFileSync(
        './frontend/src/utils/contract-address.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Both contracts deployed successfully!");
    console.log("Contract addresses saved to frontend/src/utils/contract-address.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });