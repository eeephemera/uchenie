async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    
    const Token = await ethers.getContractFactory("MoskovskiyPlehanovaToken");
    const token = await Token.deploy();
    
    console.log("Token contract deployed to:", token.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
  