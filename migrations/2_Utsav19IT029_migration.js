const Utsav19IT029 = artifacts.require("./Utsav19IT029.sol");
const Utsav19IT029TokenSale = artifacts.require("./Utsav19IT029TokenSale.sol");
const tokenPrice = 1000000000000000; // in wei
module.exports = function (deployer) {
  deployer.deploy(Utsav19IT029,1000000).then(()=>{
    return deployer.deploy(Utsav19IT029TokenSale,Utsav19IT029.address,tokenPrice);
  });
};