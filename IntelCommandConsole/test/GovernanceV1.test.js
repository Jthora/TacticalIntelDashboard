const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovernanceV1", function () {
  let governance;
  let owner;
  let voter1;
  let voter2;
  let nonVoter;

  beforeEach(async function () {
    // Get signers
    [owner, voter1, voter2, nonVoter] = await ethers.getSigners();

    // Deploy the contract
    const GovernanceV1 = await ethers.getContractFactory("GovernanceV1");
    governance = await GovernanceV1.deploy();
    await governance.waitForDeployment();

    // Assign voting power to voters
    await governance.assignVotingPower(voter1.address, ethers.parseEther("50"));
    await governance.assignVotingPower(voter2.address, ethers.parseEther("30"));
  });

  describe("Proposal Creation", function () {
    it("should create a proposal successfully", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const endTime = startTime + 86400; // 1 day duration

      const tx = await governance.createProposal(
        "Test Proposal",
        "This is a test proposal description",
        0, // GENERAL
        startTime,
        endTime,
        [], // No targets
        [], // No values
        [], // No calldatas
        "ipfs://QmTest"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ProposalCreated"
      );

      expect(event).to.not.be.undefined;
      expect(await governance.proposalCount()).to.equal(1);

      const proposal = await governance.getProposalById(1);
      expect(proposal.title).to.equal("Test Proposal");
      expect(proposal.description).to.equal("This is a test proposal description");
      expect(proposal.status).to.equal(0); // PENDING
    });

    it("should revert when a user without voting power creates a proposal", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 86400;

      await expect(
        governance.connect(nonVoter).createProposal(
          "Test Proposal",
          "This is a test proposal description",
          0,
          startTime,
          endTime,
          [],
          [],
          [],
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("GovernanceV1: caller has no voting power");
    });

    it("should revert when start time is in the past", async function () {
      const startTime = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
      const endTime = startTime + 86400;

      await expect(
        governance.createProposal(
          "Test Proposal",
          "This is a test proposal description",
          0,
          startTime,
          endTime,
          [],
          [],
          [],
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("GovernanceV1: start time must be in the future");
    });

    it("should revert when end time is before start time", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime - 60; // 1 minute before start

      await expect(
        governance.createProposal(
          "Test Proposal",
          "This is a test proposal description",
          0,
          startTime,
          endTime,
          [],
          [],
          [],
          "ipfs://QmTest"
        )
      ).to.be.revertedWith("GovernanceV1: end time must be after start time");
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      // Create an active proposal
      const startTime = Math.floor(Date.now() / 1000); // Now
      const endTime = startTime + 86400; // 1 day duration

      const tx = await governance.createProposal(
        "Voting Test Proposal",
        "This is a proposal for testing voting",
        0, // GENERAL
        startTime,
        endTime,
        [], // No targets
        [], // No values
        [], // No calldatas
        "ipfs://QmTest"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ProposalCreated"
      );
      proposalId = event.args.proposalId;
    });

    it("should allow a voter to cast a vote", async function () {
      const tx = await governance.connect(voter1).vote(proposalId, 1); // Vote FOR
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "VoteCast"
      );
      
      expect(event).to.not.be.undefined;
      expect(event.args.voter).to.equal(voter1.address);
      expect(event.args.support).to.equal(1); // FOR
      
      const proposal = await governance.getProposalById(proposalId);
      expect(proposal.yesVotes).to.equal(ethers.parseEther("50")); // Voter1's power
    });

    it("should not allow a voter to vote twice", async function () {
      await governance.connect(voter1).vote(proposalId, 1); // Vote FOR
      
      await expect(
        governance.connect(voter1).vote(proposalId, 1)
      ).to.be.revertedWith("GovernanceV1: already voted");
    });

    it("should not allow a non-voter to cast a vote", async function () {
      await expect(
        governance.connect(nonVoter).vote(proposalId, 1)
      ).to.be.revertedWith("GovernanceV1: no voting power");
    });

    it("should correctly tally different vote types", async function () {
      await governance.connect(voter1).vote(proposalId, 1); // Vote FOR
      await governance.connect(voter2).vote(proposalId, 0); // Vote AGAINST
      
      const proposal = await governance.getProposalById(proposalId);
      expect(proposal.yesVotes).to.equal(ethers.parseEther("50")); // Voter1's power
      expect(proposal.noVotes).to.equal(ethers.parseEther("30")); // Voter2's power
    });
  });

  describe("Proposal Execution", function () {
    let proposalId;
    let mockTarget;

    beforeEach(async function () {
      // Deploy a mock target contract
      const MockTarget = await ethers.getContractFactory("MockTarget");
      mockTarget = await MockTarget.deploy();
      await mockTarget.waitForDeployment();

      // Create a proposal with actions
      const startTime = Math.floor(Date.now() / 1000); // Now
      const endTime = startTime + 10; // 10 seconds duration for faster testing

      // Create calldata for setData(42)
      const calldata = mockTarget.interface.encodeFunctionData("setData", [42]);

      const tx = await governance.createProposal(
        "Execution Test Proposal",
        "This is a proposal for testing execution",
        0, // GENERAL
        startTime,
        endTime,
        [await mockTarget.getAddress()], // Target
        [0], // No ETH value
        [calldata], // Calldata
        "ipfs://QmTest"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ProposalCreated"
      );
      proposalId = event.args.proposalId;

      // Vote FOR with owner (has 100 ETH voting power)
      await governance.vote(proposalId, 1);
    });

    it("should execute a successful proposal", async function () {
      // Wait until voting period ends
      await ethers.provider.send("evm_increaseTime", [11]);
      await ethers.provider.send("evm_mine");

      // Execute the proposal
      const tx = await governance.executeProposal(proposalId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ProposalExecuted"
      );
      
      expect(event).to.not.be.undefined;
      
      // Check that the proposal was executed
      const proposal = await governance.getProposalById(proposalId);
      expect(proposal.status).to.equal(2); // SUCCEEDED
      expect(proposal.executed).to.be.true;
      
      // Check that the target contract was affected
      expect(await mockTarget.getData()).to.equal(42);
    });

    it("should not execute a proposal during voting period", async function () {
      await expect(
        governance.executeProposal(proposalId)
      ).to.be.revertedWith("GovernanceV1: voting period not ended");
    });

    it("should not execute an already executed proposal", async function () {
      // Wait until voting period ends
      await ethers.provider.send("evm_increaseTime", [11]);
      await ethers.provider.send("evm_mine");

      // Execute the proposal
      await governance.executeProposal(proposalId);
      
      // Try to execute again
      await expect(
        governance.executeProposal(proposalId)
      ).to.be.revertedWith("GovernanceV1: proposal already executed");
    });
  });

  describe("Proposal Cancellation", function () {
    let proposalId;

    beforeEach(async function () {
      // Create a proposal
      const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const endTime = startTime + 86400; // 1 day duration

      const tx = await governance.connect(voter1).createProposal(
        "Cancellation Test Proposal",
        "This is a proposal for testing cancellation",
        0, // GENERAL
        startTime,
        endTime,
        [], // No targets
        [], // No values
        [], // No calldatas
        "ipfs://QmTest"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ProposalCreated"
      );
      proposalId = event.args.proposalId;
    });

    it("should allow the creator to cancel a proposal", async function () {
      const tx = await governance.connect(voter1).cancelProposal(proposalId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ProposalCanceled"
      );
      
      expect(event).to.not.be.undefined;
      expect(event.args.canceler).to.equal(voter1.address);
      
      const proposal = await governance.getProposalById(proposalId);
      expect(proposal.status).to.equal(5); // CANCELED
    });

    it("should allow the admin to cancel a proposal", async function () {
      const tx = await governance.cancelProposal(proposalId);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ProposalCanceled"
      );
      
      expect(event).to.not.be.undefined;
      expect(event.args.canceler).to.equal(owner.address);
      
      const proposal = await governance.getProposalById(proposalId);
      expect(proposal.status).to.equal(5); // CANCELED
    });

    it("should not allow non-creators or non-admins to cancel a proposal", async function () {
      await expect(
        governance.connect(voter2).cancelProposal(proposalId)
      ).to.be.revertedWith("GovernanceV1: not authorized to cancel");
    });
  });
});

// Mock contract for testing proposal execution
const MockTarget = ethers.getContractFactory("MockTarget", {
  contractContent: `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    
    contract MockTarget {
        uint256 private data;
        
        function setData(uint256 _data) external {
            data = _data;
        }
        
        function getData() external view returns (uint256) {
            return data;
        }
    }
  `
});
