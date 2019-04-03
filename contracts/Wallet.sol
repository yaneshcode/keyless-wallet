pragma solidity 0.5.6;

contract Wallet {

  event Transfer(address indexed from, address indexed to, uint tokens);
  mapping(address => mapping (address => uint256)) allowed;
  using SafeMath for uint256;

  address public owner;

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
  function setOwner(address _owner) public {
    require(msg.sender == owner);
    owner = _owner;
  }

  // Some basic wallet functions
  // -> Can upgrade wallet with more functions
  //    - daily limits
  //    - multi sig
  //    - handle erc20 tokens
  //    - I didn't implement these yet because testing takes time

  // Transfer funds to another address
  function transfer(address receiver, uint256 amount) public returns (bool) onlyOwner {
    receiver.transfer(amount);
    emit Transfer(address(this), receiver, amount);
    return true;
  }

  // Withdraw all funds to owner
  function withdraw() public onlyOwner {
    owner.transfer(address(this).balance);
  }

  function() payable external {}
}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }
}
