pragma solidity 0.5.7;

import "./SafeMath.sol";

// Factory interface
contract FactoryInterface {
  function deploy(bytes memory code, uint256 salt) public returns(address);
}

// Datastore contract
contract VersionControl {

  using SafeMath for uint256;

  event DeployedWallet(string username, address contractAddress, uint256 version);
  event UpgradedWallet(string username, address oldContractAddress, uint256 oldVersion, address newContractAddress, uint256 newVersion);
  event NewUser(string username, address contractAddress, uint256 version);
  event OwnershipChanged(address indexed oldOwner, address indexed newOwner);

  FactoryInterface public factory;       // Factory contract address
  uint256 public currentVersion = 0;     // Keep track of the current version
  address public owner;

  // struct to hold user data
  struct User {
    uint256 bytecodeVersion;
    address walletAddress;
    bool deployed;
    bool exists;
    address upgradeAddress;
    uint256 upgradeVersion;
    bool upgrading;
  }

  // mapping of usernames
  mapping(bytes32 => User) public users;

  // mapping of bytecodes to keep track of versions
  mapping(uint256 => bytes) public bytecodeMap;

  constructor(address _address, bytes memory _bytecode) public {
    owner = msg.sender;
    factory = FactoryInterface(_address);
    currentVersion = 0;
    bytecodeMap[currentVersion] = _bytecode;
  }

  // owner modifier
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // Transfering ownership
  function setOwner(address _owner) public {
    require(msg.sender == owner);
    emit OwnershipChanged(owner, _owner);
    owner = _owner;
  }

  // owner can upgrade wallet contract
  function updateBytecode(bytes memory _bytecode) public onlyOwner {
    currentVersion = currentVersion.add(1);
    bytecodeMap[currentVersion] = _bytecode;
  }

  // deploying a wallet contract. user will supply salt
  function deployWallet(string memory _username, uint256 salt) public onlyOwner {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    address walletAddress = factory.deploy(bytecodeMap[user.bytecodeVersion], salt);

    // Check wallet address for security
    require(walletAddress == user.walletAddress, "Wallet address does not match.");

    emit DeployedWallet(_username, walletAddress, user.bytecodeVersion);

    user.deployed = true;

  }

  // deploying an upgraded wallet contract. user will supply salt
  function upgradeWallet(string memory _username, uint256 salt) public onlyOwner {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    require(user.upgrading, "User is not in upgrade stage.");

    address walletAddress = factory.deploy(bytecodeMap[user.upgradeVersion], salt);

    // Check wallet address for security
    require(walletAddress == user.upgradeAddress, "Wallet address does not match.");

    emit UpgradedWallet(_username, user.walletAddress, user.bytecodeVersion, user.upgradeAddress, user.upgradeVersion);

    user.bytecodeVersion = user.upgradeVersion;
    user.walletAddress = walletAddress;
    user.upgrading = false;

  }

  // adding a user to our database/mapping
  function addUser(string memory _username, address _address) public onlyOwner {

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

    emit NewUser(_username, _address, currentVersion);
  }

  // puts the user in upgrade mode if there is a new wallet version
  // and user wants to upgrade.
  // during upgrade stage we keep track of previous wallet and new wallet
  function upgradeUser(string memory _username, address _address) public onlyOwner {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    require(user.bytecodeVersion < currentVersion, "Version is up to do date.");

    user.upgradeVersion = currentVersion;
    user.upgradeAddress = _address;
    user.upgrading = true;
  }

  // public function to view a user's data
  function viewUser(string memory _username) public view returns
  (uint256, address, bool, bool, address, uint256, bool) {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    return(user.bytecodeVersion,
        user.walletAddress,
        user.deployed,
        user.exists,
        user.upgradeAddress,
        user.upgradeVersion,
        user.upgrading
    );
  }
}
