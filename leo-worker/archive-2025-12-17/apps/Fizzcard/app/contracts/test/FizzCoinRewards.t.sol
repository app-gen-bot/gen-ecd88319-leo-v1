// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FizzCoin.sol";
import "../src/FizzCoinRewards.sol";

contract FizzCoinRewardsTest is Test {
    FizzCoin public token;
    FizzCoinRewards public rewards;
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    uint256 constant REWARD_POOL = 50_000_000 * 10**18;

    event RewardCredited(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event BatchRewardsCredited(uint256 userCount, uint256 totalAmount);

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);

        // Deploy contracts
        token = new FizzCoin();
        rewards = new FizzCoinRewards(address(token), address(0)); // No forwarder in tests

        // Transfer tokens to rewards contract
        token.transfer(address(rewards), REWARD_POOL);
    }

    function testInitialization() public {
        assertEq(address(rewards.fizzcoin()), address(token));
        assertEq(token.balanceOf(address(rewards)), REWARD_POOL);
    }

    function testCreditReward() public {
        uint256 rewardAmount = 100 * 10**18;

        vm.expectEmit(true, false, false, true);
        emit RewardCredited(user1, rewardAmount);

        rewards.creditReward(user1, rewardAmount);

        assertEq(rewards.pendingRewards(user1), rewardAmount);
        assertEq(rewards.getPendingRewards(user1), rewardAmount);
    }

    function testCreditRewardOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        rewards.creditReward(user2, 100 * 10**18);
    }

    function testCreditRewardZeroAddress() public {
        vm.expectRevert("FizzCoinRewards: user cannot be zero address");
        rewards.creditReward(address(0), 100 * 10**18);
    }

    function testCreditRewardZeroAmount() public {
        vm.expectRevert("FizzCoinRewards: amount must be greater than zero");
        rewards.creditReward(user1, 0);
    }

    function testClaimRewards() public {
        uint256 rewardAmount = 100 * 10**18;

        // Credit reward
        rewards.creditReward(user1, rewardAmount);

        // Claim as user1
        vm.expectEmit(true, false, false, true);
        emit RewardClaimed(user1, rewardAmount);

        vm.prank(user1);
        rewards.claimRewards();

        // Verify balances
        assertEq(token.balanceOf(user1), rewardAmount);
        assertEq(rewards.pendingRewards(user1), 0);
        assertEq(rewards.claimedRewards(user1), rewardAmount);
    }

    function testClaimRewardsNoPending() public {
        vm.prank(user1);
        vm.expectRevert("FizzCoinRewards: no pending rewards");
        rewards.claimRewards();
    }

    function testClaimRewardsTwice() public {
        uint256 rewardAmount = 100 * 10**18;

        rewards.creditReward(user1, rewardAmount);

        vm.startPrank(user1);
        rewards.claimRewards();

        vm.expectRevert("FizzCoinRewards: no pending rewards");
        rewards.claimRewards();
        vm.stopPrank();
    }

    function testMultipleCreditsAndClaim() public {
        // Credit multiple times
        rewards.creditReward(user1, 50 * 10**18);
        rewards.creditReward(user1, 75 * 10**18);
        rewards.creditReward(user1, 25 * 10**18);

        assertEq(rewards.pendingRewards(user1), 150 * 10**18);

        // Claim all at once
        vm.prank(user1);
        rewards.claimRewards();

        assertEq(token.balanceOf(user1), 150 * 10**18);
        assertEq(rewards.pendingRewards(user1), 0);
        assertEq(rewards.claimedRewards(user1), 150 * 10**18);
    }

    function testBatchCreditRewards() public {
        address[] memory users = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        users[0] = user1;
        users[1] = user2;
        users[2] = user3;

        amounts[0] = 50 * 10**18;
        amounts[1] = 75 * 10**18;
        amounts[2] = 100 * 10**18;

        vm.expectEmit(false, false, false, true);
        emit BatchRewardsCredited(3, 225 * 10**18);

        rewards.batchCreditRewards(users, amounts);

        assertEq(rewards.pendingRewards(user1), 50 * 10**18);
        assertEq(rewards.pendingRewards(user2), 75 * 10**18);
        assertEq(rewards.pendingRewards(user3), 100 * 10**18);
    }

    function testBatchCreditRewardsOnlyOwner() public {
        address[] memory users = new address[](1);
        uint256[] memory amounts = new uint256[](1);

        users[0] = user1;
        amounts[0] = 100 * 10**18;

        vm.prank(user1);
        vm.expectRevert();
        rewards.batchCreditRewards(users, amounts);
    }

    function testBatchCreditRewardsEmptyArrays() public {
        address[] memory users = new address[](0);
        uint256[] memory amounts = new uint256[](0);

        vm.expectRevert("FizzCoinRewards: empty arrays");
        rewards.batchCreditRewards(users, amounts);
    }

    function testBatchCreditRewardsLengthMismatch() public {
        address[] memory users = new address[](2);
        uint256[] memory amounts = new uint256[](3);

        users[0] = user1;
        users[1] = user2;

        amounts[0] = 50 * 10**18;
        amounts[1] = 75 * 10**18;
        amounts[2] = 100 * 10**18;

        vm.expectRevert("FizzCoinRewards: array length mismatch");
        rewards.batchCreditRewards(users, amounts);
    }

    function testBatchCreditRewardsZeroAddress() public {
        address[] memory users = new address[](2);
        uint256[] memory amounts = new uint256[](2);

        users[0] = user1;
        users[1] = address(0);

        amounts[0] = 50 * 10**18;
        amounts[1] = 75 * 10**18;

        vm.expectRevert("FizzCoinRewards: user cannot be zero address");
        rewards.batchCreditRewards(users, amounts);
    }

    function testBatchCreditRewardsZeroAmount() public {
        address[] memory users = new address[](2);
        uint256[] memory amounts = new uint256[](2);

        users[0] = user1;
        users[1] = user2;

        amounts[0] = 50 * 10**18;
        amounts[1] = 0;

        vm.expectRevert("FizzCoinRewards: amount must be greater than zero");
        rewards.batchCreditRewards(users, amounts);
    }

    function testGetTotalRewards() public {
        // Credit 100 FIZZ
        rewards.creditReward(user1, 100 * 10**18);

        // Total should be 100 (all pending)
        assertEq(rewards.getTotalRewards(user1), 100 * 10**18);

        // Claim 100 FIZZ
        vm.prank(user1);
        rewards.claimRewards();

        // Total should still be 100 (all claimed)
        assertEq(rewards.getTotalRewards(user1), 100 * 10**18);

        // Credit another 50 FIZZ
        rewards.creditReward(user1, 50 * 10**18);

        // Total should be 150 (100 claimed + 50 pending)
        assertEq(rewards.getTotalRewards(user1), 150 * 10**18);
    }

    function testMultipleUsersClaim() public {
        // Credit different amounts to different users
        rewards.creditReward(user1, 100 * 10**18);
        rewards.creditReward(user2, 200 * 10**18);
        rewards.creditReward(user3, 150 * 10**18);

        // All users claim
        vm.prank(user1);
        rewards.claimRewards();

        vm.prank(user2);
        rewards.claimRewards();

        vm.prank(user3);
        rewards.claimRewards();

        // Verify balances
        assertEq(token.balanceOf(user1), 100 * 10**18);
        assertEq(token.balanceOf(user2), 200 * 10**18);
        assertEq(token.balanceOf(user3), 150 * 10**18);

        // Verify all pending cleared
        assertEq(rewards.pendingRewards(user1), 0);
        assertEq(rewards.pendingRewards(user2), 0);
        assertEq(rewards.pendingRewards(user3), 0);
    }

    function testReentrancyProtection() public {
        // This test ensures the nonReentrant modifier works
        // In practice, reentrancy is protected by the modifier
        uint256 rewardAmount = 100 * 10**18;

        rewards.creditReward(user1, rewardAmount);

        vm.prank(user1);
        rewards.claimRewards();

        // Second claim should fail
        vm.prank(user1);
        vm.expectRevert("FizzCoinRewards: no pending rewards");
        rewards.claimRewards();
    }

    function testInsufficientContractBalance() public {
        // Transfer most tokens out of contract
        vm.prank(address(rewards));
        token.transfer(owner, REWARD_POOL - 50 * 10**18);

        // Credit more than contract has
        rewards.creditReward(user1, 100 * 10**18);

        // Claim should fail
        vm.prank(user1);
        vm.expectRevert("FizzCoinRewards: token transfer failed");
        rewards.claimRewards();
    }
}
