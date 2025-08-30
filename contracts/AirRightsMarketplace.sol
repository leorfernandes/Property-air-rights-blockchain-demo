// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyRegistry.sol";

contract AirRightsMarketplace {
    PropertyRegistry public propertyRegistry;
    
    // Custom security implementation (same pattern as PropertyRegistry)
    address public owner;
    bool public paused = false;
    mapping(address => bool) private _reentrancyGuard;

    // Custom access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner allowed");
        _;
    }

    // Custom pause functionality
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    // Custom reentrancy guard
    modifier nonReentrant() {
        require(!_reentrancyGuard[msg.sender], "ReentrancyGuard: reentrant call");
        _reentrancyGuard[msg.sender] = true;
        _;
        _reentrancyGuard[msg.sender] = false;
    }

    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }
    
    struct AirRightsListing {
        uint256 propertyId;
        address seller;
        uint256 floorsForSale;
        uint256 pricePerFloor; // in wei
        uint256 listingDate;
        bool isActive;
    }

    mapping(uint256 => AirRightsListing) public listings;
    mapping(address => uint256[]) public userListings;
    uint256 public listingCount = 0;
    
    // Platform fee (e.g., 2.5% = 250 basis points)
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public constant MAX_FEE_PERCENT = 1000; // 10% max

    function setPlatformFee(uint256 _newFeePercent) public onlyOwner {
        require(_newFeePercent <= MAX_FEE_PERCENT, "Fee too high");
        platformFeePercent = _newFeePercent;
    }

    function withdrawPlatformFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner).transfer(balance);
    }

    event AirRightsListed(uint256 indexed listingId, uint256 indexed propertyId, uint256 floors, uint256 pricePerFloor);
    event AirRightsSold(uint256 indexed listingId, address indexed buyer, uint256 floors, uint256 totalPrice);
    event ListingCancelled(uint256 indexed listingId);

    constructor(address _propertyRegistryAddress) {
        propertyRegistry = PropertyRegistry(_propertyRegistryAddress);
        owner = msg.sender; 
    }

    function listAirRights(
        uint256 _propertyId,
        uint256 _floorsToSell,
        uint256 _pricePerFloor
    ) public nonReentrant whenNotPaused {
        // Get property info from PropertyRegistry
        (address propertyOwner,,, uint256 currentFloors, uint256 availableRights,) = 
            propertyRegistry.getPropertyInfo(_propertyId);
        
        require(propertyOwner == msg.sender, "Only property owner can list");
        require(_floorsToSell <= availableRights, "Not enough air rights available");
        require(_pricePerFloor > 0, "Price must be greater than zero");
        require(_floorsToSell > 0, "Must sell at least 1 floor");

        listingCount++;
        listings[listingCount] = AirRightsListing({
            propertyId: _propertyId,
            seller: msg.sender,
            floorsForSale: _floorsToSell,
            pricePerFloor: _pricePerFloor,
            listingDate: block.timestamp,
            isActive: true
        });

        userListings[msg.sender].push(listingCount);
        emit AirRightsListed(listingCount, _propertyId, _floorsToSell, _pricePerFloor);
    }

    function buyAirRights(uint256 _listingId, uint256 _targetPropertyId) 
        public payable nonReentrant whenNotPaused {
        AirRightsListing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        
        uint256 totalPrice = listing.floorsForSale * listing.pricePerFloor;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Verify buyer owns target property
        (address targetOwner,,,,,) = propertyRegistry.getPropertyInfo(_targetPropertyId);
        require(targetOwner == msg.sender, "Must own target property");

        // Calculate platform fee
        uint256 platformFee = (totalPrice * platformFeePercent) / 10000;
        uint256 sellerAmount = totalPrice - platformFee;

        // For demo: We'll simulate air rights transfer by emitting events
        // In production, you'd call propertyRegistry.transferAirRights()

        // Transfer payments
        payable(listing.seller).transfer(sellerAmount);
        payable(owner).transfer(platformFee);  // ← Changed from owner() to owner
        
        // Return excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        listing.isActive = false;
        emit AirRightsSold(_listingId, msg.sender, listing.floorsForSale, totalPrice);
    }

    function cancelListing(uint256 _listingId) public {
        AirRightsListing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Only seller can cancel");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;
        emit ListingCancelled(_listingId);
    }

    function getActiveListings() public view returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](listingCount);
        uint256 count = 0;

        for (uint256 i = 1; i <= listingCount; i++) {
            if (listings[i].isActive) {
                temp[count] = i;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }

        return result;
    }
}