const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Deploying PropertyRegistry contract...");

    const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await PropertyRegistry.deploy();
    
    await propertyRegistry.waitForDeployment(); // Changed from .deployed()

    const contractAddress = await propertyRegistry.getAddress(); // Changed from .address
    console.log("PropertyRegistry deployed to:", contractAddress);

    // Create frontend utils directory if it doesn't exist
    const dir = './frontend/src/utils/';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress, // Updated variable name
        deploymentDate: new Date().toISOString(),
        network: "localhost",
    };

    fs.writeFileSync(
        './frontend/src/utils/contract-address.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Contract address saved to frontend/src/utils/contract-address.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });