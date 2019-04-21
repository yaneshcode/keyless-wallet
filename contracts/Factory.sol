pragma solidity 0.5.7;

// Factory contract adapted from
// https://github.com/stanislaw-glogowski/create2/blob/master/contracts/Factory.sol
contract Factory {
  event DeployedWallet(address addr, bytes32 salt);

  function deploy(bytes memory code, bytes32 salt) public returns(address){
    address addr;
    assembly {
      addr := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }

    // TODO: remove salt logging for security?
    emit DeployedWallet(addr, salt);

    return addr;
  }
}
