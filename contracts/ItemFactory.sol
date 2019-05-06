pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Factory.sol";
import "./Item.sol";
import "./Strings.sol";

contract ItemFactory is Factory, Ownable {
  using Strings for string;

  address public proxyRegistryAddress;
  address public nftAddress;
  address public lootBoxNftAddress;
  string public baseURI = "https://cadaf-metadata.herokuapp.com/api/factory/";
  
  uint256 NUM_OPTIONS = 0;

  constructor(address _proxyRegistryAddress, address _nftAddress) public {
    proxyRegistryAddress = _proxyRegistryAddress;
    nftAddress = _nftAddress;
  }

  function name() external view returns (string) {
    return "Item Sale";
  }

  function symbol() external view returns (string) {
    return "ISL";
  }

  function supportsFactoryInterface() public view returns (bool) {
    return true;
  }

  function numOptions() public view returns (uint256) {
    return NUM_OPTIONS;
  }

  function setNumOptions(uint256 numOptions) public onlyOwner {
    NUM_OPTIONS = numOptions;
  }
  
  function mint(uint256 _optionId, address _toAddress) public {
    // Must be sent from the owner proxy or owner.
    ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
    assert(proxyRegistry.proxies(owner) == msg.sender || owner == msg.sender || msg.sender == lootBoxNftAddress);
    require(canMint(_optionId));

    Item itemContract = Item(nftAddress);
    itemContract.mintTo(_toAddress, _optionId);
  }

  function canMint(uint256 _optionId) public view returns (bool) {
    return (_optionId < numOptions());
  }
  
  function tokenURI(uint256 _optionId) public view returns (string) {
    return Strings.strConcat(
        baseURI,
        Strings.uint2str(_optionId)
    );
  }

  /**
   * Hack to get things to work automatically on OpenSea.
   * Use transferFrom so the frontend doesn't have to worry about different method names.
   */
  function transferFrom(address _from, address _to, uint256 _tokenId) public {
    mint(_tokenId, _to);
  }

  /**
   * Hack to get things to work automatically on OpenSea.
   * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
   */
  function isApprovedForAll(
    address _owner,
    address _operator
  )
    public
    view
    returns (bool)
  {
    if (owner == _owner && _owner == _operator) {
      return true;
    }

    ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
    if (owner == _owner && proxyRegistry.proxies(_owner) == _operator) {
      return true;
    }

    return false;
  }

  /**
   * Hack to get things to work automatically on OpenSea.
   * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
   */
  function ownerOf(uint256 _tokenId) public view returns (address _owner) {
    return owner;
  }
}