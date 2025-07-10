import { expect } from "chai";
import { ethers } from "hardhat";
import { Governance } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Governance", function () {
  let governance: Governance;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy governance contract
    const Governance = await ethers.getContractFactory("Governance");
    governance = await Governance.deploy(48 * 3600); // 48 hours minimum voting period
    await governance.waitForDeployment();
  });

  describe("Proposal Creation", function () {
    it("Should allow creating a proposal", async function () {
      const title = "Test Proposal";
      const description = "This is a test proposal";
      const proposalType = 0; // GENERAL
      const startTime = Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
      const endTime = startTime + 3600 * 72; // 3 days duration

      await expect(
        governance.connect(user1).createProposal(
          title,
          description,
          proposalType,
          startTime,
          endTime,
          [],
          [],
          [],
          ""
        )
      ).to.emit(governance, "ProposalCreated");

      // Get the proposal count
      const proposalCount = await governance.getProposalCount();
      expect(proposalCount).to.equal(1);

      // Get the proposal and check its details
      const proposal = await governance.getProposalById(0);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.proposalType).to.equal(proposalType);
      expect(proposal.startTime).to.equal(startTime);
      expect(proposal.endTime).to.equal(endTime);
      expect(proposal.creator).to.equal(user1.address);
    });

    it("Should not allow end time before start time", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
      const endTime = startTime - 3600; // End 1 hour before start (invalid)

      await expect(
        governance.connect(user1).createProposal(
          "Invalid Proposal",
          "This proposal has an invalid timeline",
          0,
          startTime,
          endTime,
          [],
          [],
          [],
          ""
        )
      ).to.be.revertedWithCustomError(governance, "InvalidProposalTimeline");
    });

    it("Should not allow voting period less than minimum", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
      const endTime = startTime + 3600; // End 1 hour after start (too short)

      await expect(
        governance.connect(user1).createProposal(
          "Short Proposal",
          "This proposal has a too short voting period",
          0,
          startTime,
          endTime,
          [],
          [],
          [],
          ""
        )
      ).to.be.revertedWithCustomError(governance, "VotingPeriodTooShort");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Create a proposal
      const startTime = Math.floor(Date.now() / 1000); // Start now
      const endTime = startTime + 3600 * 72; // 3 days duration

      await governance.connect(user1).createProposal(
        "Test Proposal",
        "This is a test proposal for voting",
        0,
        startTime,
        endTime,
        [],
        [],
        [],
        ""
      );
    });

    it("Should allow voting on an active proposal", async function () {
      // Vote on the proposal (0=Against, 1=For, 2=Abstain)
      await expect(governance.connect(user2).vote(0, 1))
        .to.emit(governance, "VoteCast")
        .withArgs(user2.address, 0, 1);

      // Check the vote was recorded
      const proposal = await governance.getProposalById(0);
      expect(proposal.yesVotes).to.equal(1);
      expect(proposal.noVotes).to.equal(0);
      expect(proposal.abstainVotes).to.equal(0);
    });

    it("Should not allow voting twice", async function () {
      // Vote once
      await governance.connect(user2).vote(0, 1);

      // Try to vote again
      await expect(governance.connect(user2).vote(0, 0))
        .to.be.revertedWithCustomError(governance, "AlreadyVoted");
    });

    it("Should not allow voting on a non-existent proposal", async function () {
      await expect(governance.connect(user2).vote(999, 1))
        .to.be.revertedWithCustomError(governance, "ProposalNotFound");
    });

    it("Should not allow voting on a proposal that hasn't started", async function () {
      // Create a proposal that starts in the future
      const startTime = Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
      const endTime = startTime + 3600 * 72; // 3 days duration

      await governance.connect(user1).createProposal(
        "Future Proposal",
        "This proposal starts in the future",
        0,
        startTime,
        endTime,
        [],
        [],
        [],
        ""
      );

      // Try to vote on the future proposal
      await expect(governance.connect(user2).vote(1, 1))
        .to.be.revertedWithCustomError(governance, "ProposalNotActive");
    });

    it("Should allow getting all proposals", async function () {
      // Create another proposal
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 3600 * 72;

      await governance.connect(user1).createProposal(
        "Second Proposal",
        "This is another test proposal",
        1,
        startTime,
        endTime,
        [],
        [],
        [],
        ""
      );

      // Get all proposals
      const proposals = await governance.getProposals();
      expect(proposals.length).to.equal(2);
      expect(proposals[0].title).to.equal("Test Proposal");
      expect(proposals[1].title).to.equal("Second Proposal");
    });
  });
});
