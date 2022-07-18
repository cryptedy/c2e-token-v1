const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const artifacts = require("../artifacts/contracts/PTR.sol/PTR.json");

describe("Click2Earn sample contract V1", function () {
  //テスト内共通変数
  //コントラクトオブジェクト
  let PTRAdmin;
  let PTRUsers = Array(3);
  //アドレス
  let addrPTR;
  //ウォレット（サイナーオブジェクト）
  let signerAdmin;
  let signerUsers = Array(3);

  before(async function(){
    //コントラクトのデプロイ
    const Factory = await ethers.getContractFactory("PTR");
    PTRAdmin = await Factory.deploy();
    //デプロイ完了を待つ
    await PTRAdmin.deployed();
    //デプロイアドレスを取得する
    addrPTR = PTRAdmin.address;
    //テストに使用するウォレットアドレスの取得
    [signerAdmin, signerUsers[0], signerUsers[1], signerUsers[2]] = await ethers.getSigners();
    //ユーザーごとのコントラクトへの接続オブジェクトの取得
    for (let i = 0 ; i < signerUsers.length ; i++){
      PTRUsers[i] = await new ethers.Contract(addrPTR, artifacts.abi, signerUsers[i]);
    }
  });

  it("User1 mint tokens", async function () {
    const clickAmount = 123;
    const index = 0;
    const tx = await PTRUsers[index].mint(signerUsers[index].address, ethers.utils.parseEther(clickAmount.toString()));
    await tx.wait();
    expect(await PTRUsers[index].balanceOf(signerUsers[index].address)).to.equal(ethers.utils.parseEther(clickAmount.toString())); 
  });

  it("User2 mint tokens", async function () {
    const clickAmount = 2000;
    const index = 1;
    const tx = await PTRUsers[index].mint(signerUsers[index].address, ethers.utils.parseEther(clickAmount.toString()));
    await tx.wait();
    expect(await PTRUsers[index].balanceOf(signerUsers[index].address)).to.equal(ethers.utils.parseEther(clickAmount.toString())); 
  });

  it("User1 raise level(reverted)", async function () {
    const index = 0;
    let level = 1;
    const addr = signerUsers[index].address;
    console.log("        Required tokens to raise level : ", ethers.utils.formatEther(await PTRUsers[index].requiredTokenToRaiseLevel(addr)));
    console.log("        Remain tokens : ", ethers.utils.formatEther(await PTRUsers[index].balanceOf(addr)));
    console.log("        Current level : ", (await PTRUsers[index].level(addr)).toNumber());
    await expect(PTRUsers[index].raiseLevel(addr)).to.be.revertedWith('InsufficientTokenToRaiseNextLevel');
  });

  it("User2 raise level", async function () {
    const index = 1;
    let level = 1;
    const addr = signerUsers[index].address;
    for (let i = 0 ; i < 3 ; i ++){
      console.log("        Required tokens to raise level : ", ethers.utils.formatEther(await PTRUsers[index].requiredTokenToRaiseLevel(addr)));
      console.log("        Remain tokens : ", ethers.utils.formatEther(await PTRUsers[index].balanceOf(addr)));
      console.log("        Current level : ", (await PTRUsers[index].level(addr)).toNumber());
      let tx = await PTRUsers[index].raiseLevel(addr);
      await tx.wait();
      console.log("        Finish raising level");
      level++;
      expect(await PTRUsers[index].level(signerUsers[index].address)).to.equal(level); 
    }
    console.log("        Remain tokens : ", ethers.utils.formatEther(await PTRUsers[index].balanceOf(addr)));
    console.log("        Current level : ", (await PTRUsers[index].level(addr)).toNumber());
  });

  it("User3 set eqA(reverted)", async function () {
    const index = 2;
    const addr = signerUsers[index].address;
    await expect(PTRUsers[index].setEqA(10)).to.be.revertedWith('Ownable');
  });

});
