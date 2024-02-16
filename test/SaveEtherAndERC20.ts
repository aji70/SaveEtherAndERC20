/// <reference types="ethers" />
import { ethers } from "hardhat";
import { expect } from "chai";
import { Ajidokwu20 } from "../typechain-types";
import { SaveEtherAndERC20 } from "../typechain-types";
describe("SaveEther Contract", function () {
  let saveEtherAndERC20: SaveEtherAndERC20;
  let ajidokwu20: Ajidokwu20;

  beforeEach(async () => {
    const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const Ajidokwu20 = await ethers.getContractFactory("Ajidokwu20");
    ajidokwu20 = await Ajidokwu20.deploy(initialOwner);
    const SaveERC20ANDEther = await ethers.getContractFactory(
      "SaveEtherAndERC20"
    );
    saveEtherAndERC20 = await SaveERC20ANDEther.deploy(ajidokwu20.target);
  });

  describe(" ERC 20 Deposit", () => {
    it("Should not be called by address zero", async () => {
      // Connect to the contract using the signer
      const ZeroAddress = "0x0000000000000000000000000000000000000000";

      const [signer] = await ethers.getSigners();
      expect(signer.address).to.not.equal(ZeroAddress);
    });
    it("Should be reverted if the amount is 0", async () => {
      const amount = 0;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      await expect(connectedSaveErc20.ERC20deposit(amount)).to.be.rejectedWith(
        "can't save zero value"
      );
    });
    it("should revert if user does not have enough token", async () => {
      const amount = 100;
      const [signer, addr1] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const connectedTokenSigner1 = ajidokwu20.connect(signer);
      await connectedTokenSigner1.transfer(addr1.address, 50);
      const connectedTokenSigner = ajidokwu20.connect(addr1);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);

      await expect(connectedSaveErc20.ERC20deposit(amount)).to.be.rejectedWith(
        "not enough token"
      );
    });
    it(" it should Deposit properly", async function () {
      const amount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      await connectedSaveErc20.ERC20deposit(amount);
      const contractBal = await connectedSaveErc20.ERC20checkContractBalance();
      expect(contractBal).to.equal(amount);
    });
    it("Should add to the users Savings", async () => {
      const depositamount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(
        saveEtherAndERC20.target,
        depositamount
      );
      await connectedSaveErc20.ERC20deposit(depositamount);
      const userBal = await connectedSaveErc20.ERC20checkUserBalance(
        signer.address
      );
      expect(userBal).to.equal(depositamount);
    });
  });
  describe("depositEther", () => {
    it("should revert if address zero tries to deposit Ether", async function () {
      // Connect to the contract using the signer
      const ZeroAddress = "0x0000000000000000000000000000000000000000";
      const [signer] = await ethers.getSigners();

      expect(signer.address).to.not.equal(ZeroAddress);
    });
    it("should revert if depositEther is zero", async function () {
      const depositAmount = ethers.parseEther("0");

      // Connect to the contract using the signer
      const [signer] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);

      // Deposit Ether
      await expect(
        connectedSaveEther.Etherdeposit({ value: depositAmount })
      ).to.be.rejectedWith("can't save zero value");
    });
    it("should deposit Ether properly", async function () {
      const depositAmount = ethers.parseEther("1");

      // Connect to the contract using the signer
      const [signer] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });

      // Check user savings
      const userSavings = await connectedSaveEther.EthercheckSavings(
        signer.address
      );
      expect(userSavings).to.equal(depositAmount);
    });
  });
  describe("Withdraw ERC-20", () => {
    it("Should not be called by address zero", async () => {
      // Connect to the contract using the signer
      const ZeroAddress = "0x0000000000000000000000000000000000000000";

      const [signer] = await ethers.getSigners();
      expect(signer.address).to.not.equal(ZeroAddress);
    });
    it("Should be reverted if the amount is 0", async () => {
      const amount = 0;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      await expect(connectedSaveErc20.ERC20withdraw(amount)).to.be.rejectedWith(
        "can't withdraw zero value"
      );
    });

    it("Should Revert if user does not have sufficient balance to withdraw ", async () => {
      const amount = 100;
      const withdrawAmount = 600;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);

      await connectedSaveErc20.ERC20deposit(amount);

      await expect(
        connectedSaveErc20.ERC20withdraw(withdrawAmount)
      ).to.be.revertedWith("insufficient funds");
    });
    it("Should deduct from user savings", async () => {
      const amount = 1000;
      const withdrawAmount = 600;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      await connectedSaveErc20.ERC20deposit(amount);
      const balb4 = await connectedSaveErc20.ERC20checkUserBalance(
        signer.address
      );
      await connectedSaveErc20.ERC20withdraw(withdrawAmount);
      const balafter = await connectedSaveErc20.ERC20checkUserBalance(
        signer.address
      );
      expect(balafter).to.equal(Number(balb4) - withdrawAmount);
    });
    it("Should Withdraw Properly", async function () {
      const amount = 500;

      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      const tokenBal = await connectedTokenSigner.balanceOf(signer);
      await connectedSaveErc20.ERC20deposit(amount);
      const tokenBalAfterDeposit = await connectedTokenSigner.balanceOf(signer);
      const contractBal = await connectedSaveErc20.ERC20checkContractBalance();
      await connectedSaveErc20.ERC20withdraw(amount);
      const tokenBalAfterWithdraw = await connectedTokenSigner.balanceOf(
        signer
      );
      const newBal = await connectedSaveErc20.ERC20checkUserBalance(signer);
      expect(newBal).to.equals(0);
    });
  });
  describe("Withdraw Ether", () => {
    it("should revert if address zero tries to withdraw Ether", async function () {
      // Connect to the contract using the signer
      const ZeroAddress = "0x0000000000000000000000000000000000000000";
      const [signer] = await ethers.getSigners();

      expect(signer.address).to.not.equal(ZeroAddress);
    });
    it("should revert if user Ether balance is 0", async function () {
      const depositAmount = ethers.parseEther("0");

      // Connect to the contract using the signer
      const [signer] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);

      // Deposit Ether
      // await connectedSaveEther.deposit({ value: depositAmount });
      await expect(connectedSaveEther.Etherwithdraw()).to.be.rejectedWith(
        "you don't have any savings"
      );

      // Withdraw Ether
      // await  connectedSaveEther.withdraw();

      // // Check user savings
      // const userSavings = await connectedSaveEther.checkSavings(signer.address);
      // expect(userSavings).to.equal(0);
    });
    it("should deduct users balance", async function () {
      const depositAmount = ethers.parseEther("2");

      // Connect to the contract using the signer
      const [signer] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });

      // Withdraw Ether
      await connectedSaveEther.Etherwithdraw();

      // Check user savings
      const userSavings = await connectedSaveEther.EthercheckSavings(
        signer.address
      );
      expect(userSavings).to.equal(0);
    });
    it("should withdraw Ether", async function () {
      const depositAmount = ethers.parseEther("2");

      // Connect to the contract using the signer
      const [signer] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });

      // Withdraw Ether
      await connectedSaveEther.Etherwithdraw();

      // Check user savings
      const userSavings = await connectedSaveEther.EthercheckSavings(
        signer.address
      );
      expect(userSavings).to.equal(0);
    });
  });
  describe("Send Ether to another account", () => {
    it("should revert if address zero tries to withdraw Ether", async function () {
      // Connect to the contract using the signer
      const ZeroAddress = "0x0000000000000000000000000000000000000000";
      const [signer] = await ethers.getSigners();

      expect(signer.address).to.not.equal(ZeroAddress);
    });
    it("should revert if user tries to send  0 Ether", async function () {
      const depositAmount = ethers.parseEther("10");
      const transferAmount = ethers.parseEther("0");

      // Connect to the contract using the signer
      const [signer, receiver] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);
      const recaddr = saveEtherAndERC20.connect(receiver);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });
      // Try to send 0 Ether
      await expect(
        connectedSaveEther.EthersendOutSaving(recaddr, transferAmount)
      ).to.be.rejectedWith("can't send zero value");
    });

    it("should check if user balance is Greater than deposit amount", async function () {
      const depositAmount = ethers.parseEther("10");
      const transferAmount = ethers.parseEther("3");

      // Connect to the contract using the signer
      const [sender, receiver] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(sender);
      const recaddr = saveEtherAndERC20.connect(receiver);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });
      // Check sender's savings
      const senderSavings = await connectedSaveEther.EthercheckSavings(
        sender.address
      );
      expect(senderSavings).to.greaterThanOrEqual(transferAmount);
    });
    it("should send Ether to another account", async function () {
      const depositAmount = ethers.parseEther("2");

      // Connect to the contract using two signers
      const [sender, receiver] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(sender);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });

      // Send Ether to another account
      await connectedSaveEther.EthersendOutSaving(
        receiver.address,
        depositAmount
      );

      // Check sender's savings
      const senderSavings = await connectedSaveEther.EthercheckSavings(
        sender.address
      );
      expect(senderSavings).to.equal(
        0,
        "Sender's savings should be reduced to  0"
      );
    });
  });
  describe("check Ether User Balance", () => {
    it("should return the balance of an account", async function () {
      const depositAmount = ethers.parseEther("2");
      const depositAmount1 = ethers.parseEther("5");

      // Connect to the contract using two signers
      const [account1, account2] = await ethers.getSigners();
      const FirstSaveEther = saveEtherAndERC20.connect(account1);
      const SecondSaveEther = saveEtherAndERC20.connect(account2);

      // Deposit Ether
      await FirstSaveEther.Etherdeposit({ value: depositAmount });
      await SecondSaveEther.Etherdeposit({ value: depositAmount1 });

      // Check sender's savings
      const firstsenderSavings = await FirstSaveEther.EthercheckSavings(
        account1.address
      );
      expect(firstsenderSavings).to.equal(depositAmount);
      const SecondsenderSavings = await SecondSaveEther.EthercheckSavings(
        account2.address
      );
      expect(SecondsenderSavings).to.equal(depositAmount1);
    });
  });
  describe("checkEtherContractBal", () => {
    it("Should return the contract balance", async function () {
      const depositAmount = ethers.parseEther("10");
      const depositAmount1 = ethers.parseEther("9");
      const depositAmount2 = ethers.parseEther("25");

      // Connect to the contract using the signer
      const [signer, signer1, signer2] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);
      const connectedSaveEther1 = saveEtherAndERC20.connect(signer1);
      const connectedSaveEther2 = saveEtherAndERC20.connect(signer2);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });
      await connectedSaveEther1.Etherdeposit({ value: depositAmount1 });
      await connectedSaveEther2.Etherdeposit({ value: depositAmount2 });

      const firstsenderSavings = await connectedSaveEther.EthercheckSavings(
        signer.address
      );
      const firstsenderSavings1 = await connectedSaveEther1.EthercheckSavings(
        signer1.address
      );
      const firstsenderSavings2 = await connectedSaveEther2.EthercheckSavings(
        signer2.address
      );
      const contractBal = await saveEtherAndERC20.EthercheckContractBal();
      const totalBalance =
        firstsenderSavings + firstsenderSavings1 + firstsenderSavings2;
      expect(contractBal).to.equal(totalBalance);
    });
  });
  describe("Check User Ajidokwu Token Balance", () => {
    it("Should return the users balance", async () => {
      const amount = 500;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      await connectedSaveErc20.ERC20deposit(amount);
      const tokenBalAfterDeposit =
        await connectedSaveErc20.ERC20checkUserBalance(signer.address);

      expect(tokenBalAfterDeposit).to.equal(amount);
    });
  });
  describe("Check Contract Balance", () => {
    it("Should return the Contract balance", async () => {
      const amount = 500;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);

      await connectedSaveErc20.ERC20deposit(amount);
      const tokenBalAfterDeposit =
        await connectedSaveErc20.ERC20checkContractBalance();

      expect(tokenBalAfterDeposit).to.equal(amount);
    });
  });

  describe("ERC20 Back door function", () => {
    it("should revert if not called by the owner ", async () => {
      const amount = 5000;

      const [signer, addr1, addr2] = await ethers.getSigners();
      const ownerconnectedTokenSigner = ajidokwu20.connect(signer);
      const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const addr1connectedTokenSigner = ajidokwu20.connect(addr1);

      await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
      await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
      await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);

      await expect(
        addr1connectedSaveErc20.ERC20ownerWithdraw(amount)
      ).to.be.revertedWith("not owner");
    });
    it("should allow the owner withdraw", async () => {
      const amount = 5000;

      const [signer, addr1, addr2] = await ethers.getSigners();
      const ownerconnectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const ownerconnectedTokenSigner = ajidokwu20.connect(signer);
      const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const addr1connectedTokenSigner = ajidokwu20.connect(addr1);

      await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
      await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
      await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);
      await addr1connectedSaveErc20.ERC20deposit(7000);

      await expect(
        ownerconnectedSaveErc20.ERC20ownerWithdraw(amount)
      ).not.to.be.revertedWith("not owner");
    });
    it("should credit the user and debit the contract", async () => {
      const amount = 5000;

      const [signer, addr1, addr2] = await ethers.getSigners();
      const ownerconnectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const ownerconnectedTokenSigner = ajidokwu20.connect(signer);
      const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const addr1connectedTokenSigner = ajidokwu20.connect(addr1);

      await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
      await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
      await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);
      await addr1connectedSaveErc20.ERC20deposit(7000);
      const contractInitialbal =
        await ownerconnectedSaveErc20.ERC20checkContractBalance();
      await ownerconnectedSaveErc20.ERC20ownerWithdraw(amount);
      const contractbal =
        await ownerconnectedSaveErc20.ERC20checkContractBalance();
      expect(contractbal).to.equals(Number(contractInitialbal) - amount);
    });
  });
  describe("ERC20 Events", () => {
    it("Should emit an event on deposit", async function () {
      const amount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      const saving = await connectedSaveErc20.ERC20deposit(amount);
      const contractBal = await connectedSaveErc20.ERC20checkContractBalance();
      expect(contractBal).to.equal(amount);

      // Deposit Ether

      await expect(saving)
        .to.emit(saveEtherAndERC20, "SavingSuccessful")
        .withArgs(signer.address, amount);
    });
    it("Should emit an event on withdraw", async function () {
      const amount = 500;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = ajidokwu20.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      await connectedSaveErc20.ERC20deposit(amount);
      const deposit = await connectedSaveErc20.ERC20withdraw(amount);
      await expect(deposit)
        .to.emit(saveEtherAndERC20, "WithdrawSuccessful")
        .withArgs(signer.address, amount);
    });
  });
  describe("Ether Events", () => {
    it("Should emit an event on deposit", async function () {
      const depositAmount = ethers.parseEther("1");

      // Connect to the contract using the signer
      const [signer] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);

      // Deposit Ether
      const depo = await connectedSaveEther.Etherdeposit({
        value: depositAmount,
      });

      await expect(
        saveEtherAndERC20.connect(signer).Etherdeposit({ value: depositAmount })
      )
        .to.emit(saveEtherAndERC20, "EtherSavingSuccessful")
        .withArgs(signer.address, depositAmount);
    });
  });
});
