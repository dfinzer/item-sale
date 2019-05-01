pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

/**
 * @title Item
 * Item - a contract for my non-fungible items.
 */
contract OpenSeaToken is MintableToken {
  string public constant name = "OpenSea Token";
  string public constant symbol = "OST";
  uint8 public constant decimals = 18;
}