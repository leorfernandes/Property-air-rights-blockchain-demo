// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyRegistry {
    address public owner;
    bool public paused = false;
    mapping(address => bool) private _reentrancyGuard;

    constructor() {
        owner = msg.sender;
    }

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

    struct Property {
        address owner;
        string propertyAddress;
        uint256 totalFloors;
        uint256 currentFloors;
        uint256 availableAirRights;
        uint256 registrationDate;
        uint256 lastUpdated;           
        PropertyType propertyType;   
        PropertyStatus status;         
        bool isActive;
    }

    enum PropertyType { RESIDENTIAL, COMMERCIAL, MIXED_USE, INDUSTRIAL }
    enum PropertyStatus { UNDER_CONSTRUCTION, COMPLETED, RENOVATING }

    struct Transfer {
        address from;
        address to;
        uint256 timestamp;
        string reason;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => Transfer[]) public transferHistory;
    mapping(string => uint256) public addressToPropertyId;

    uint256 public propertyCount = 0;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string propertyAddress);
    event OwnershipTransferred(uint256 indexed propertyId, address indexed from, address indexed to);
    event AirRightsUpdated(uint256 indexed propertyId, uint256 newAvailableRights);
    event PropertyStatusChanged(uint256 indexed propertyId, PropertyStatus newStatus);
    event PropertyTypeSet(uint256 indexed propertyId, PropertyType propertyType);

    function registerProperty(
        string memory _propertyAddress,
        uint256 _totalFloors,
        uint256 _currentFloors
    ) public whenNotPaused nonReentrant returns (uint256) {
        require(_currentFloors <= _totalFloors, "Current floors cannot exceed total allowed");
        require(bytes(_propertyAddress).length > 0, "Property address cannot be empty");
        require(addressToPropertyId[_propertyAddress] == 0, "Property already registered");

        propertyCount++;
        uint256 availableRights = _totalFloors - _currentFloors;

        properties[propertyCount] = Property({
            owner: msg.sender,
            propertyAddress: _propertyAddress,
            totalFloors: _totalFloors,
            currentFloors: _currentFloors,
            availableAirRights: availableRights,
            registrationDate: block.timestamp,
            lastUpdated: block.timestamp,       
            propertyType: PropertyType.RESIDENTIAL, 
            status: PropertyStatus.UNDER_CONSTRUCTION,
            isActive: true
        });

        addressToPropertyId[_propertyAddress] = propertyCount;

        ownerProperties[msg.sender].push(propertyCount);

        emit PropertyRegistered(propertyCount, msg.sender, _propertyAddress);
        return propertyCount;
    }

    function transferOwnership(uint256 _propertyId, address _newOwner, string memory _reason) public whenNotPaused nonReentrant {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        require(properties[_propertyId].owner == msg.sender, "Only owner can transfer");
        require(_newOwner != address(0), "Invalid new owner address");
        require(properties[_propertyId].isActive, "Property is not active");

        address previousOwner = properties[_propertyId].owner;
        properties[_propertyId].owner = _newOwner;

        uint256[] storage prevOwnerProps = ownerProperties[previousOwner];
        for (uint256 i = 0; i < prevOwnerProps.length; i++) {
            if (prevOwnerProps[i] == _propertyId) {
                prevOwnerProps[i] = prevOwnerProps[prevOwnerProps.length - 1];
                prevOwnerProps.pop();
                break;
            }
        }

        ownerProperties[_newOwner].push(_propertyId);

        transferHistory[_propertyId].push(Transfer({
            from: previousOwner,
            to: _newOwner,
            timestamp: block.timestamp,
            reason: _reason
        }));

        emit OwnershipTransferred(_propertyId, previousOwner, _newOwner);
    }

    function getPropertyInfo(uint256 _propertyId) public view returns (
        address owner,
        string memory propertyAddress,
        uint256 totalFloors,
        uint256 currentFloors,
        uint256 availableAirRights,
        uint256 registrationDate
    ) {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        Property memory prop = properties[_propertyId];

        return (
            prop.owner,
            prop.propertyAddress,
            prop.totalFloors,
            prop.currentFloors,
            prop.availableAirRights,
            prop.registrationDate
        );
    }

    function getPropertyByAddress(string memory _propertyAddress) public view returns (
        uint256 propertyId,
        address owner,
        uint256 totalFloors,
        uint256 currentFloors,
        uint256 availableAirRights
    ) {
        uint256 propId = addressToPropertyId[_propertyAddress];
        require(propId > 0, "Property not found");

        Property memory prop = properties[propId];
        return (propId, prop.owner, prop.totalFloors, prop.currentFloors, prop.availableAirRights);
    }

    function getTransferHistory(uint256 _propertyId) public view returns (Transfer[] memory) {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        return transferHistory[_propertyId];
    }

    function updateAirRights(uint256 _propertyId, uint256 _newCurrentFloors) public whenNotPaused nonReentrant {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        require(properties[_propertyId].owner == msg.sender, "Only owner can update");
        require(_newCurrentFloors <= properties[_propertyId].totalFloors, "Cannot exceed total floors");

        properties[_propertyId].currentFloors = _newCurrentFloors;
        properties[_propertyId].availableAirRights = properties[_propertyId].totalFloors - _newCurrentFloors;
        properties[_propertyId].lastUpdated = block.timestamp; // ← Add this line

        emit AirRightsUpdated(_propertyId, properties[_propertyId].availableAirRights);
    }

    function batchUpdateAirRights(
        uint256[] calldata _propertyIds,
        uint256[] calldata _newCurrentFloors
    ) external nonReentrant whenNotPaused {
        require(_propertyIds.length == _newCurrentFloors.length, "Array length mismatch");
        require(_propertyIds.length <= 10, "Too many properties in batch");

        for (uint256 i = 0; i < _propertyIds.length; i++) {
            uint256 propId = _propertyIds[i];
            require(properties[propId].owner == msg.sender, "Not owner of all properties");
            
            properties[propId].currentFloors = _newCurrentFloors[i];
            properties[propId].availableAirRights = properties[propId].totalFloors - _newCurrentFloors[i];
            properties[propId].lastUpdated = block.timestamp;
            
            emit AirRightsUpdated(propId, properties[propId].availableAirRights);
        }
    }

    function getAllProperties() public view returns (uint256[] memory) {
        uint256[] memory activeProperties = new uint256[](propertyCount);
        uint256 count = 0;

        for (uint256 i = 1; i <= propertyCount; i++) {
            if (properties[i].isActive) {
                activeProperties[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeProperties[i];
        }

        return result;
    }

    mapping(address => uint256[]) public ownerProperties;

    function getPropertiesByOwner(address _owner) public view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }

    function getPropertiesWithAvailableAirRights() public view returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](propertyCount);
        uint256 count = 0;

        for (uint256 i = 1; i <= propertyCount; i++) {
            if (properties[i].isActive && properties[i].availableAirRights > 0) {
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

    function getPropertyStatistics() public view returns (
        uint256 totalProperties,
        uint256 totalAirRights,
        uint256 propertiesWithRights
    ) {
        uint256 airRightsSum = 0;
        uint256 withRightsCount = 0;

        for (uint256 i = 1; i <= propertyCount; i++) {
            if (properties[i].isActive) {
                airRightsSum += properties[i].availableAirRights;
                if (properties[i].availableAirRights > 0) {
                    withRightsCount++;
                }
            }
        }

        return (propertyCount, airRightsSum, withRightsCount);
    }
}