async function main() {
  const [owner] = await ethers.getSigners();
  const contractAddress = "0x5A08acBBBf67f35edeDe606cd536621F197a7aE2";
  const Token = await ethers.getContractFactory("MoskovskiyPlehanovaToken");
  const token = Token.attach(contractAddress);

  const studentAddress = "0x3E5091Bd7789442611bCa285854d68B1C67748ba"; // замените на адрес студента
  const grade = 3; // оценка, которую вы хотите установить

  const tx = await token.rewardStudent(studentAddress, grade);
  await tx.wait();

  console.log(`Student at address ${studentAddress} rewarded with grade ${grade}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
