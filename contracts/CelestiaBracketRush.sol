// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Celestia Bracket Rush
 * @notice Fully decentralized multi-match bracket predictions with encrypted exposure.
 *         Anyone can create brackets, and settlement is permissionless using blockhash randomness.
 *         No admin approvals, owner gating, or commit-reveal patterns required.
 */
contract CelestiaBracketRush is ZamaEthereumConfig {
    uint8 public constant OUTCOME_LEFT = 0;
    uint8 public constant OUTCOME_RIGHT = 1;
    uint8 public constant OUTCOME_DRAW = 2; // optional third outcome

    struct MatchUp {
        string label;
        string optionLeft;
        string optionRight;
        bool allowDraw;
        euint64 leftExposure;
        euint64 rightExposure;
        euint64 drawExposure;
        uint256 picksLeft;
        uint256 picksRight;
        uint256 picksDraw;
        uint8 correctOption;
    }

    struct Bracket {
        bool exists;
        string bracketId;
        uint256 entryFee;
        uint256 lockTime;
        uint256 prizePool;
        bool cancelled;
        bool settled;
        bool pushAll;
        uint256 winnerCount;
        MatchUp[] matchups;
        uint8[] finalResults;
        address[] players;
    }

    struct Entry {
        bool exists;
        bool claimed;
        uint8[] picks;
        euint64 weightCipher;
    }

    mapping(string => Bracket) private brackets;
    mapping(string => mapping(address => Entry)) private entries;
    string[] private bracketIds;

    event BracketCreated(string indexed bracketId, uint256 entryFee, uint256 lockTime);
    event EntrySubmitted(string indexed bracketId, address indexed player);
    event EntryAdjusted(string indexed bracketId, address indexed player);
    event BracketSettled(string indexed bracketId, bool pushAll, uint256 winnerCount);
    event BracketCancelled(string indexed bracketId);
    event PrizeClaimed(string indexed bracketId, address indexed winner, uint256 amount);
    event RefundClaimed(string indexed bracketId, address indexed player, uint256 amount);

    error BracketExists();
    error BracketMissing();
    error InvalidMatches();
    error InvalidFee();
    error InvalidDuration();
    error InvalidPick();
    error AlreadyEntered();
    error EntryNotFound();
    error Locked();
    error NotSettled();
    error NotWinner();
    error AlreadyClaimed();
    error NotRefundable();
    error AlreadySettled();

    uint256 public constant MIN_ENTRY_FEE = 0.001 ether;
    uint256 public constant MIN_DURATION = 30 minutes;
    uint256 public constant MAX_DURATION = 21 days;
    uint8 public constant MIN_MATCHES = 2;
    uint8 public constant MAX_MATCHES = 12;

    /** ------------------------------- Bracket creation ------------------------------- */

    function createReplicaBracket(
        string memory bracketId,
        uint256 entryFee,
        uint256 duration,
        string[] memory labels,
        string[] memory optionsLeft,
        string[] memory optionsRight,
        bool[] memory allowDraw
    ) external {
        if (brackets[bracketId].exists) revert BracketExists();
        if (entryFee < MIN_ENTRY_FEE) revert InvalidFee();
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidDuration();
        if (
            labels.length < MIN_MATCHES ||
            labels.length > MAX_MATCHES ||
            labels.length != optionsLeft.length ||
            labels.length != optionsRight.length ||
            labels.length != allowDraw.length
        ) revert InvalidMatches();

        Bracket storage bracket = brackets[bracketId];
        bracket.exists = true;
        bracket.bracketId = bracketId;
        bracket.entryFee = entryFee;
        bracket.lockTime = block.timestamp + duration;

        for (uint256 i = 0; i < labels.length; i++) {
            MatchUp storage matchUp = bracket.matchups.push();
            matchUp.label = labels[i];
            matchUp.optionLeft = optionsLeft[i];
            matchUp.optionRight = optionsRight[i];
            matchUp.allowDraw = allowDraw[i];
            matchUp.leftExposure = FHE.asEuint64(0);
            matchUp.rightExposure = FHE.asEuint64(0);
            matchUp.drawExposure = FHE.asEuint64(0);
            FHE.allowThis(matchUp.leftExposure);
            FHE.allowThis(matchUp.rightExposure);
            FHE.allowThis(matchUp.drawExposure);
        }

        bracketIds.push(bracketId);
        emit BracketCreated(bracketId, entryFee, bracket.lockTime);
    }

    /** ------------------------------- Participation ------------------------------- */

    function enterReplicaBracket(
        string memory bracketId,
        uint8[] calldata picks,
        externalEuint64 encryptedWeight,
        bytes calldata proof
    ) external payable {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();
        if (bracket.cancelled) revert Locked();
        if (block.timestamp >= bracket.lockTime) revert Locked();
        if (picks.length != bracket.matchups.length) revert InvalidPick();
        if (msg.value != bracket.entryFee) revert InvalidFee();

        Entry storage entry = entries[bracketId][msg.sender];
        if (entry.exists) revert AlreadyEntered();

        euint64 weight = FHE.fromExternal(encryptedWeight, proof);
        _applyExposure(bracket, picks, weight, true);

        entry.exists = true;
        entry.claimed = false;
        entry.weightCipher = weight;
        _copyPicks(entry, picks);

        FHE.allow(weight, msg.sender);
        bracket.prizePool += msg.value;
        bracket.players.push(msg.sender);

        emit EntrySubmitted(bracketId, msg.sender);
    }

    function adjustReplicaEntry(
        string memory bracketId,
        uint8[] calldata newPicks,
        externalEuint64 newEncryptedWeight,
        bytes calldata proof
    ) external {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();
        if (bracket.cancelled) revert Locked();
        if (block.timestamp >= bracket.lockTime) revert Locked();
        if (newPicks.length != bracket.matchups.length) revert InvalidPick();

        Entry storage entry = entries[bracketId][msg.sender];
        if (!entry.exists) revert EntryNotFound();

        _applyExposure(bracket, entry.picks, entry.weightCipher, false);

        euint64 newWeight = FHE.fromExternal(newEncryptedWeight, proof);
        _applyExposure(bracket, newPicks, newWeight, true);

        entry.weightCipher = newWeight;
        _copyPicks(entry, newPicks);
        entry.claimed = false;

        FHE.allow(newWeight, msg.sender);

        emit EntryAdjusted(bracketId, msg.sender);
    }

    /** ------------------------------- Settlement ------------------------------- */

    function settleReplicaBracket(string memory bracketId) external {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();
        if (bracket.cancelled) revert Locked();
        if (block.timestamp < bracket.lockTime) revert Locked();
        if (bracket.settled) revert AlreadySettled();

        // Generate random results using blockhash
        bytes32 randomSeed = keccak256(abi.encode(blockhash(block.number - 1), bracketId));

        uint8[] memory results = new uint8[](bracket.matchups.length);
        for (uint256 i = 0; i < bracket.matchups.length; i++) {
            // Generate random number for this match
            bytes32 matchHash = keccak256(abi.encode(randomSeed, i));
            uint256 randomValue = uint256(matchHash);

            MatchUp storage matchUp = bracket.matchups[i];
            uint8 outcome;

            if (matchUp.allowDraw) {
                // Three outcomes: LEFT, RIGHT, DRAW
                outcome = uint8(randomValue % 3);
            } else {
                // Two outcomes: LEFT or RIGHT
                outcome = uint8(randomValue % 2);
            }

            results[i] = outcome;
            matchUp.correctOption = outcome;
        }

        bracket.finalResults = results;

        // Count winners
        uint256 winners = 0;
        for (uint256 i = 0; i < bracket.players.length; i++) {
            Entry storage entry = entries[bracketId][bracket.players[i]];
            if (!entry.exists) continue;
            if (_isWinningEntry(entry, results)) {
                winners += 1;
            }
        }

        bracket.winnerCount = winners;
        bracket.pushAll = (winners == 0);
        bracket.settled = true;

        emit BracketSettled(bracketId, bracket.pushAll, winners);
    }

    function cancelReplicaBracket(string memory bracketId) external {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();
        if (bracket.settled) revert AlreadySettled();
        if (bracket.players.length > 0) revert Locked();
        if (block.timestamp >= bracket.lockTime) revert Locked();

        bracket.cancelled = true;
        emit BracketCancelled(bracketId);
    }

    /** ------------------------------- Claims ------------------------------- */

    function claimReplicaPrize(string memory bracketId) external {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();
        if (!bracket.settled || bracket.cancelled || bracket.pushAll) revert NotSettled();

        Entry storage entry = entries[bracketId][msg.sender];
        if (!entry.exists) revert NotWinner();
        if (entry.claimed) revert AlreadyClaimed();
        if (!_isWinningEntry(entry, bracket.finalResults)) revert NotWinner();

        uint256 winners = bracket.winnerCount;
        require(winners > 0, "No winners");
        uint256 payout = bracket.prizePool / winners;

        entry.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: payout }("");
        require(sent, "Transfer failed");

        emit PrizeClaimed(bracketId, msg.sender, payout);
    }

    function claimReplicaRefund(string memory bracketId) external {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();

        Entry storage entry = entries[bracketId][msg.sender];
        if (!entry.exists) revert NotRefundable();
        if (entry.claimed) revert AlreadyClaimed();

        bool refundable = bracket.cancelled || (bracket.settled && bracket.pushAll);
        if (!refundable) revert NotRefundable();

        entry.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: bracket.entryFee }("");
        require(sent, "Refund failed");

        emit RefundClaimed(bracketId, msg.sender, bracket.entryFee);
    }

    /** ------------------------------- Views ------------------------------- */

    function listReplicaBrackets() external view returns (string[] memory) {
        return bracketIds;
    }

    function getReplicaBracket(string memory bracketId)
        external
        view
        returns (
            uint256 entryFee,
            uint256 lockTime,
            uint256 prizePool,
            bool cancelled,
            bool settled,
            bool pushAll,
            uint256 winnerCount
        )
    {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();
        return (
            bracket.entryFee,
            bracket.lockTime,
            bracket.prizePool,
            bracket.cancelled,
            bracket.settled,
            bracket.pushAll,
            bracket.winnerCount
        );
    }

    function getReplicaMatchups(string memory bracketId) external view returns (MatchUp[] memory) {
        Bracket storage bracket = brackets[bracketId];
        if (!bracket.exists) revert BracketMissing();
        MatchUp[] memory snapshot = new MatchUp[](bracket.matchups.length);
        for (uint256 i = 0; i < bracket.matchups.length; i++) {
            snapshot[i] = bracket.matchups[i];
        }
        return snapshot;
    }

    /** ------------------------------- Helpers ------------------------------- */

    function _applyExposure(
        Bracket storage bracket,
        uint8[] memory picks,
        euint64 weight,
        bool add
    ) internal {
        for (uint256 i = 0; i < picks.length; i++) {
            MatchUp storage matchUp = bracket.matchups[i];
            uint8 pick = picks[i];
            if (pick == OUTCOME_LEFT) {
                matchUp.leftExposure = add ? FHE.add(matchUp.leftExposure, weight) : FHE.sub(matchUp.leftExposure, weight);
                matchUp.picksLeft = add ? matchUp.picksLeft + 1 : matchUp.picksLeft - 1;
                FHE.allowThis(matchUp.leftExposure);
            } else if (pick == OUTCOME_RIGHT) {
                matchUp.rightExposure = add
                    ? FHE.add(matchUp.rightExposure, weight)
                    : FHE.sub(matchUp.rightExposure, weight);
                matchUp.picksRight = add ? matchUp.picksRight + 1 : matchUp.picksRight - 1;
                FHE.allowThis(matchUp.rightExposure);
            } else if (pick == OUTCOME_DRAW && matchUp.allowDraw) {
                matchUp.drawExposure = add ? FHE.add(matchUp.drawExposure, weight) : FHE.sub(matchUp.drawExposure, weight);
                matchUp.picksDraw = add ? matchUp.picksDraw + 1 : matchUp.picksDraw - 1;
                FHE.allowThis(matchUp.drawExposure);
            } else {
                revert InvalidPick();
            }
        }
    }

    function _copyPicks(Entry storage entry, uint8[] memory picks) internal {
        delete entry.picks;
        for (uint256 i = 0; i < picks.length; i++) {
            entry.picks.push(picks[i]);
        }
    }

    function _isWinningEntry(Entry storage entry, uint8[] memory results) internal view returns (bool) {
        if (!entry.exists) return false;
        if (entry.picks.length != results.length) return false;
        for (uint256 i = 0; i < results.length; i++) {
            if (entry.picks[i] != results[i]) {
                return false;
            }
        }
        return true;
    }
}
