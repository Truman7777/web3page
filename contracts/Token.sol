// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
  constructor(uint totalSupply_) public ERC20("TIGEEMA", "TGM") {
    _mint(msg.sender, totalSupply_);
  }

  function getTotalSupply() public view returns (uint) {
    return totalSupply();
  }
}
