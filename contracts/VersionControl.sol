pragma solidity 0.5.6;

// Datastore contract
contract VersionControl {

  Factory factory;            // Factory contract address
  uint256 currentVersion = 0; // Keep track of the current version
  uint256 public num;

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
  mapping(bytes32 => User) users;

  // mapping of bytecodes to keep track of versions
  mapping(uint256 => bytes) public bytecodeMap;

  constructor(address _address, bytes memory _bytecode) public {
    factory = Factory(_address);
    currentVersion = 0;
    bytecodeMap[currentVersion] = _bytecode;
  }

  // owner modifier
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // owner can upgrade wallet contract
  function updateBytecode(bytes memory _bytecode) public onlyOwner {
    currentVersion = currentVersion + 1;
    bytecodeMap[currentVersion] = _bytecode;
  }

  // deploying a wallet contract. user will supply salt
  function deployWallet(uint256 salt) public onlyOwner returns(address) {
    return factory.deploy(bytecodeMap[currentVersion], salt);
  }

  function getNumber(uint256 salt) public {
      num = factory.returnSalt(salt);
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
