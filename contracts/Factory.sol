pragma solidity 0.5.6;

contract Factory {
  event Deployed(address addr, uint256 salt);

  uint256 public num;

  function returnSalt(uint256 salt) public returns(uint256) {
      num = salt;
      return salt;
  }

  function deploy(bytes memory code, uint256 salt) public returns(address){
    address addr;
    assembly {
      addr := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }

    emit Deployed(addr, salt);

    return addr;
  }
}
