const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyRegistry", function () {  
  let propertyRegistry;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.waitForDeployment(); // Changed from .deployed()
  });

  it("Should register a property successfully", async function () {
    await propertyRegistry.registerProperty(
      "123 Main Street",
      10, // total floors
      3   // current floors
    );
    
    const propertyInfo = await propertyRegistry.getPropertyInfo(1);
    expect(propertyInfo.propertyAddress).to.equal("123 Main Street");
    expect(propertyInfo.totalFloors).to.equal(10);
    expect(propertyInfo.currentFloors).to.equal(3);
    expect(propertyInfo.availableAirRights).to.equal(7);
    expect(propertyInfo.owner).to.equal(owner.address);
  });

  it("Should find property by address", async function () {
    await propertyRegistry.registerProperty("456 Oak Avenue", 8, 2);
    
    const result = await propertyRegistry.getPropertyByAddress("456 Oak Avenue");
    expect(result.propertyId).to.equal(1);
    expect(result.totalFloors).to.equal(8);
    expect(result.availableAirRights).to.equal(6);
  });

  it("Should transfer ownership", async function () {
    await propertyRegistry.registerProperty("789 Pine Road", 12, 4);
    
    await propertyRegistry.transferOwnership(1, addr1.address, "Sale to new owner");
    
    const propertyInfo = await propertyRegistry.getPropertyInfo(1);
    expect(propertyInfo.owner).to.equal(addr1.address);
  });

  it("Should reject duplicate property registration", async function () {
    await propertyRegistry.registerProperty("100 Elm Street", 6, 2);
    
    await expect(
      propertyRegistry.registerProperty("100 Elm Street", 8, 3)
    ).to.be.revertedWith("Property already registered");
  });
});