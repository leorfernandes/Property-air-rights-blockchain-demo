// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyRegistry {
    struct Property {
        address owner;
        string propertyAddress;
        uint256 totalFloors;
        uint256 currentFloors;
        uint256 availableAirRights;
        uint256 registrationDate;
        bool isActive;
    }

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

    function registerProperty(
        string memory _propertyAddress,
        uint256 _totalFloors,
        uint256 _currentFloors
    ) public returns (uint256) {
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
            isActive: true
        });

        addressToPropertyId[_propertyAddress] = propertyCount;

        emit PropertyRegistered(propertyCount, msg.sender, _propertyAddress);
        return propertyCount;
    }

    function transferOwnership(uint256 _propertyId, address _newOwner, string memory _reason) public {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        require(properties[_propertyId].owner == msg.sender, "Only owner can transfer");
        require(_newOwner != address(0), "Invalid new owner address");
        require(properties[_propertyId].isActive, "Property is not active");

        address previousOwner = properties[_propertyId].owner;
        properties[_propertyId].owner = _newOwner;

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

    function updateAirRights(uint256 _propertyId, uint256 _newCurrentFloors) public {
        require(_propertyId > 0 && _propertyId <= propertyCount, "Invalid property ID");
        require(properties[_propertyId].owner == msg.sender, "Only owner can update");
        require(_newCurrentFloors <= properties[_propertyId].totalFloors, "Cannot exceed total floors");

        properties[_propertyId].currentFloors = _newCurrentFloors;
        properties[_propertyId].availableAirRights = properties[_propertyId].totalFloors - _newCurrentFloors;

        emit AirRightsUpdated(_propertyId, properties[_propertyId].availableAirRights);
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
}