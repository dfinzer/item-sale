const Item = artifacts.require("./Item.sol");
const ItemFactory = artifacts.require("./ItemFactory.sol")
const OpenSeaToken = artifacts.require("./OpenSeaToken.sol")

module.exports = function(deployer, network) {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = ""
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  //deployer.deploy(OpenSeaToken, {gas: 5000000});

  deployer.deploy(ItemFactory, proxyRegistryAddress, "0x5f896c654a08323dbe16aded331c461ccaeeb370", {gas: 5000000});
  // deployer.deploy(Item, proxyRegistryAddress, {gas: 5000000}).then(() => {
  //   return deployer.deploy(ItemFactory, proxyRegistryAddress, Item.address, {gas: 7000000});
  // }).then(async() => {
  //   var item = await Item.deployed();
  //   return item.transferOwnership(ItemFactory.address);
  // })
};