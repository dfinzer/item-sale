pragma solidity ^0.4.24;

import "./TradeableERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Item
 * Item - a contract for my non-fungible items.
 */
contract Item is TradeableERC721Token {
  constructor(address _proxyRegistryAddress) TradeableERC721Token("Item", "ITM", _proxyRegistryAddress) public {  }

  function baseTokenURI() public view returns (string) {
    return "https://opensea-items-api.herokuapp.com/api/item/";
  }
}