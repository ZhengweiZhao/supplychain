const supply = artifacts.require('SupplyChain');
module.exports = function(deployer) {
  deployer.deploy(supply);
};
