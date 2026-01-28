# FizzCard Network Diagram

This document visualizes the network structure created by the `seed-network.js` script.

## Network Overview

**Total Nodes:** 15 users (IDs 63-77)
**Total Edges:** 31 unique connections (62 bidirectional links)
**Network Density:** High (multiple hubs and clusters)
**Average Connections:** 4.1 per user

## Visual Network Map

```
                                    Network Graph
                                    =============

                                  [Charlie (65)]
                                  /    |    \
                                 /     |     \
                    ┌───────────┘      |      └───────────┐
                    │                  │                  │
                    │                  │                  │
              [Alice (63)]━━━━━━━━[Bob (64)]         [User7 (74)]
                /  |  \              /  |  \              |
               /   |   \            /   |   \             |
              /    |    \          /    |    \            |
         [Diana][Eve] [User1]  [User7][User8][User9]  [User1]
          (66)  (67)   (68)      (74)   (75)   (76)    (68)
           |     |      |                 |      |
           |     |      |                 |      |
        [User2][User4][User7]          [User10][User9]
         (69)   (71)   (74)              (77)   (76)
           |     |
        [User3][User5]
         (70)   (72)
           |     |
        [User4][User6]
         (71)   (73)


                    Cross-Cluster Connections
                    ========================

        User1 (68) ━━━ User7 (74)
        User2 (69) ━━━ User8 (75)
        User3 (70) ━━━ User4 (71)
        User5 (72) ━━━ User6 (73)
        User7 (74) ━━━ User9 (76)
        User8 (75) ━━━ User10 (77)
```

## Hub Analysis

### Primary Hub: Alice (User 63)
**Degree:** 10 connections
**Betweenness Centrality:** High
**Role:** Main connector

**Connected to:**
- Bob (64) - Fellow hub
- Charlie (65) - Bridge node
- Diana (66) - Cluster leader
- Eve (67) - Cluster leader
- User1 (68) - Extended network
- User2 (69) - Extended network
- User3 (70) - Extended network
- User4 (71) - Extended network
- User5 (72) - Extended network
- User6 (73) - Extended network

### Secondary Hub: Bob (User 64)
**Degree:** 7 connections
**Betweenness Centrality:** Medium-High
**Role:** Secondary connector

**Connected to:**
- Charlie (65) - Bridge node (overlap with Alice)
- Diana (66) - Cluster leader (overlap with Alice)
- Eve (67) - Cluster leader (overlap with Alice)
- User7 (74) - His network
- User8 (75) - His network
- User9 (76) - His network
- User10 (77) - His network

### Bridge Node: Charlie (User 65)
**Degree:** 5 connections (to both Alice and Bob)
**Betweenness Centrality:** Very High
**Role:** Bridge between hubs

**Connected to:**
- Alice (63) - Primary hub
- Bob (64) - Secondary hub
- User1 (68) - Alice's network
- User7 (74) - Bob's network
- User8 (75) - Bob's network

## Cluster Analysis

### Diana's Cluster (Small Group)
**Size:** 3 members
**Density:** High
**Cohesion:** Very tight

**Members:**
- Diana (66) - Leader, connected to Alice and Bob
- User2 (69) - Connected to Diana and Alice
- User3 (70) - Connected to Diana and Alice

### Eve's Cluster (Small Group)
**Size:** 4 members
**Density:** Medium-High
**Cohesion:** Tight

**Members:**
- Eve (67) - Leader, connected to Alice and Bob
- User4 (71) - Connected to Eve and Alice
- User5 (72) - Connected to Eve and Alice
- User9 (76) - Connected to Eve and Bob

## Network Metrics

### By User Degree (Number of Connections)

| Rank | User ID | Name    | Connections | Role          |
|------|---------|---------|-------------|---------------|
| 1    | 63      | Alice   | 10          | Primary Hub   |
| 2    | 64      | Bob     | 7           | Secondary Hub |
| 3    | 65      | Charlie | 5           | Bridge        |
| 4    | 67      | Eve     | 6           | Cluster Lead  |
| 5    | 66      | Diana   | 5           | Cluster Lead  |
| 6    | 68      | User1   | 4           | Active User   |
| 7    | 74      | User7   | 4           | Active User   |
| 8    | 75      | User8   | 4           | Active User   |
| 9    | 76      | User9   | 4           | Active User   |
| 10   | 69-73   | Others  | 2-3         | Regular Users |

### Network Patterns

1. **Hub-and-Spoke**: Alice and Bob serve as central hubs
2. **Bridge Pattern**: Charlie connects the two hub networks
3. **Cluster Pattern**: Diana and Eve have tight-knit groups
4. **Cross-Cluster**: Multiple bridges between clusters
5. **Overlap**: Key nodes (Charlie, Diana, Eve) connected to both hubs

## Expected FizzCoin Distribution

After seeding, users should have earned FizzCoins based on their connections:

- **Alice**: ~200 FizzCoins (10 connections × 20 coins each)
- **Bob**: ~140 FizzCoins (7 connections × 20 coins each)
- **Charlie**: ~100 FizzCoins (5 connections × 20 coins each)
- **Diana**: ~100 FizzCoins (5 connections × 20 coins each)
- **Eve**: ~120 FizzCoins (6 connections × 20 coins each)
- **Others**: 40-80 FizzCoins each

## Badge Eligibility

### Super Connector Badges

- **Alice (10 connections)**:
  - ✅ Bronze (5+ connections)
  - ✅ Silver (10+ connections)

- **Bob (7 connections)**:
  - ✅ Bronze (5+ connections)

- **Charlie (5 connections)**:
  - ✅ Bronze (5+ connections)

- **Eve (6 connections)**:
  - ✅ Bronze (5+ connections)

- **Diana (5 connections)**:
  - ✅ Bronze (5+ connections)

## Network Health

**Connectivity:** Excellent - Network is fully connected
**Redundancy:** High - Multiple paths between most nodes
**Centralization:** Medium - Mix of hubs and distributed connections
**Clustering:** Present - Clear cluster formations
**Diameter:** 3 hops (maximum distance between any two nodes)

## Use Cases Demonstrated

This network structure demonstrates:

1. **Viral Growth**: Hub nodes can spread information quickly
2. **Community Formation**: Natural clustering around key individuals
3. **Bridge Value**: Charlie's role in connecting different groups
4. **Network Effects**: More connections increase value for everyone
5. **Leaderboard Competition**: Clear ranking of top connectors
6. **Badge System**: Multiple users eligible for achievement badges

## Testing Scenarios

Use this network to test:

- Network graph visualization
- Connection recommendations (suggest User1 connect with User7)
- Leaderboard rankings (Alice should be #1)
- Badge awards (check Super Connector badges)
- FizzCoin balances
- Recent activity feeds
- Mutual connections display
