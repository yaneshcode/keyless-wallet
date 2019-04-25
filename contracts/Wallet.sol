pragma solidity 0.5.7;

contract Wallet {

  event Transfer(address indexed from, address indexed to, uint amount);
  event Withdraw(address indexed from, address indexed to, uint amount);
  event OwnershipChanged(address indexed oldOwner, address indexed newOwner);

  address payable public owner;

  // Makes the user account the owner
  // Also refunds the deployer the gas used to
  // deploy this contract from its own funds
  constructor(address payable _owner) public {
    require(address(this).balance > 0);
    tx.origin.transfer(1);
    owner = _owner;
  }

  // owner modifier
  modifier onlyOwner() {
    require(tx.origin == owner);
    _;
  }

  // Upon user request, we can set them as _owner
  // and they have control of their wallet
  function setOwner(address payable _owner) public onlyOwner {
    emit OwnershipChanged(owner, _owner);
    owner = _owner;
  }

  // Transfer funds to another address
  function transfer(address payable receiver, uint256 amount) public onlyOwner returns (bool) {
    require(amount <= address(this).balance);
    receiver.transfer(amount);
    emit Transfer(address(this), receiver, amount);
    return true;
  }

  // Withdraw all funds to owner account
  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0);
    owner.transfer(address(this).balance);
    emit Withdraw(address(this), owner, balance);
  }

  // View total balance
  function totalBalance() public view returns (uint256) {
      return address(this).balance;
  }

  // Some basic wallet functions
  // -> Can upgrade wallet with more functions
  //    - daily limits
  //    - multi sig
  //    - handle erc20 tokens

  function() payable external {}
}
