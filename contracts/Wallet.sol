pragma solidity 0.5.0;

contract Wallet {

  event Transfer(address indexed from, address indexed to, uint amount);
  event Withdraw(address indexed from, address indexed to, uint amount);
  event OwnershipChanged(address indexed oldOwner, address indexed newOwner);

  address payable public owner;

  // Makes us(dapp owner) owner initially. We will
  // do transactions on User's behalf until
  // they take ownership of this contract
  constructor(address payable _owner) public {
    owner = _owner;
  }

  // owner modifier
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // Upon user request, we can set them as _owner
  // and they have control of their wallet
  function setOwner(address payable _owner) public {
    require(msg.sender == owner);
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

  // Withdraw all funds to owner
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
  //    - I didn't implement these yet because testing takes time

  function() payable external {}
}
