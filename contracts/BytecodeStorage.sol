pragma solidity ^0.5.0;

contract BytecodeStorage {
  Factory factory;
  uint8 currentVersion = 0;

  struct User {
    uint256 bytecodeVersion;
    address walletAddress;
    bool deployed;
    bool exists;
    address upgradeAddress;
    uint256 upgradeVersion;
    bool upgrading;
  }

  mapping(bytes32 => User) users;
  mapping(uint256 => bytes) bytecodeMap;

  constructor(address _address, bytes memory _bytecode) public {
    factory = Factory(_address);
    currentVersion = 0;
    bytecodeMap[currentVersion] = _bytecode;
  }

  function updateBytecode(bytes memory _bytecode) public {
    currentVersion = currentVersion + 1;
    bytecodeMap[currentVersion] = _bytecode;
  }

  function deployAccount(uint256 salt) public {
    factory.deploy(bytecodeMap[currentVersion], salt);
  }

  function addUser(string memory _username, address _address) public {

    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(!users[usernameKey].exists, "Username already exists.");

    User memory newUser = User({
        bytecodeVersion: currentVersion,
        walletAddress: _address,
        deployed: false,
        exists: true,
        upgradeAddress: address(0x0),
        upgradeVersion: currentVersion,
        upgrading: false
      });

    users[usernameKey] = newUser;

  }

  function upgradeUser(string memory _username, address _address) public {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    require(user.bytecodeVersion < currentVersion, "Version is up to do date.");

    user.upgradeVersion = currentVersion;
    user.upgradeAddress = _address;
    user.upgrading = true;
  }

  function viewUser(string memory _username) public view returns(uint256, address, bool, bool, address, uint256, bool) {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    return(user.bytecodeVersion, user.walletAddress, user.deployed, user.exists, user.upgradeAddress, user.upgradeVersion, user.upgrading);
  }
}
