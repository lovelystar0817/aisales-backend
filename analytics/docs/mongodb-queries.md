# User Activity Analysis - Updated with Roleplay Duration Logic

## Time Calculation Logic
1. **Use `roleplay.duration` if available** (normalize if > 1800 seconds to max 600 seconds)
2. **Otherwise use `endedAt - startedAt`** (if endedAt exists)
3. **Otherwise use 10 seconds default** (if endedAt is null)

## Focus Companies
- Grab
- Prudential (Pru, Pru Trial, UOB, UOB People)
- Manulife

---

## Query 1: Company-Level Activity - Last 30 Days

Run this on the `salessessions` collection:

```javascript
[
  // Filter last 30 days
  {
    $match: {
      startedAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  },
  // Lookup user
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userDetails"
    }
  },
  { $unwind: "$userDetails" },
  // Exclude test users
  {
    $match: {
      "userDetails.email": { $not: /\+.*@hupo\.co$/ },
      "userDetails.isDeleted": { $ne: true }
    }
  },
  // Lookup company
  {
    $lookup: {
      from: "companies",
      localField: "userDetails.company",
      foreignField: "_id",
      as: "companyDetails"
    }
  },
  { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
  // Filter for target companies
  {
    $match: {
      "companyDetails.name": {
        $in: ["Grab", "Pru", "Pru Trial", "UOB", "UOB People", "Manulife"]
      }
    }
  },
  // Calculate session duration with the logic
  {
    $addFields: {
      sessionDurationSeconds: {
        $cond: [
          // If roleplay.duration exists and is a number
          {
            $and: [
              { $ne: ["$roleplay.duration", null] },
              { $isNumber: "$roleplay.duration" }
            ]
          },
          // Use roleplay.duration but cap at 600 seconds (10 min) if > 1800 (30 min)
          {
            $cond: [
              { $gt: ["$roleplay.duration", 1800] },
              600,
              "$roleplay.duration"
            ]
          },
          // Otherwise check if endedAt exists
          {
            $cond: [
              { $ne: ["$endedAt", null] },
              // Use endedAt - startedAt
              { $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000] },
              // Default to 10 seconds
              10
            ]
          }
        ]
      }
    }
  },
  // Group by user
  {
    $group: {
      _id: {
        userId: "$user",
        companyId: "$userDetails.company"
      },
      userName: {
        $first: {
          $cond: [
            { $ne: ["$userDetails.name", ""] },
            "$userDetails.name",
            { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] }
          ]
        }
      },
      userEmail: { $first: "$userDetails.email" },
      companyName: { $first: "$companyDetails.name" },
      totalSessions: { $sum: 1 },
      totalTimeSeconds: { $sum: "$sessionDurationSeconds" },
      loginDays: {
        $addToSet: {
          $dateToString: { format: "%Y-%m-%d", date: "$startedAt" }
        }
      },
      firstLogin: { $min: "$startedAt" },
      lastLogin: { $max: "$startedAt" }
    }
  },
  // Calculate minutes and login frequency
  {
    $addFields: {
      totalTimeMinutes: { $round: [{ $divide: ["$totalTimeSeconds", 60] }, 2] },
      loginDays: { $size: "$loginDays" },
      avgSessionMinutes: {
        $round: [
          { $divide: [{ $divide: ["$totalTimeSeconds", 60] }, "$totalSessions"] },
          2
        ]
      }
    }
  },
  // Group by company
  {
    $group: {
      _id: "$_id.companyId",
      companyName: { $first: "$companyName" },
      totalUsers: { $sum: 1 },
      totalSessions: { $sum: "$totalSessions" },
      totalTimeMinutes: { $sum: "$totalTimeMinutes" },
      avgSessionsPerUser: { $avg: "$totalSessions" },
      avgTimePerUserMinutes: { $avg: "$totalTimeMinutes" },
      avgLoginDaysPerUser: { $avg: "$loginDays" },
      users: {
        $push: {
          userId: "$_id.userId",
          userName: "$userName",
          userEmail: "$userEmail",
          totalSessions: "$totalSessions",
          loginDays: "$loginDays",
          totalTimeMinutes: "$totalTimeMinutes",
          avgSessionMinutes: "$avgSessionMinutes",
          firstLogin: "$firstLogin",
          lastLogin: "$lastLogin"
        }
      }
    }
  },
  // Round averages
  {
    $addFields: {
      totalTimeHours: { $round: [{ $divide: ["$totalTimeMinutes", 60] }, 2] },
      avgSessionsPerUser: { $round: ["$avgSessionsPerUser", 2] },
      avgTimePerUserMinutes: { $round: ["$avgTimePerUserMinutes", 2] },
      avgTimePerUserHours: {
        $round: [{ $divide: ["$avgTimePerUserMinutes", 60] }, 2]
      },
      avgLoginDaysPerUser: { $round: ["$avgLoginDaysPerUser", 2] }
    }
  },
  // Sort by total sessions
  { $sort: { totalSessions: -1 } },
  // Project final structure
  {
    $project: {
      companyName: 1,
      totalUsers: 1,
      totalSessions: 1,
      totalTimeMinutes: 1,
      totalTimeHours: 1,
      avgSessionsPerUser: 1,
      avgTimePerUserMinutes: 1,
      avgTimePerUserHours: 1,
      avgLoginDaysPerUser: 1,
      users: 1
    }
  }
]
```

---

## Query 2: Company-Level Activity - Previous 30 Days (30-60 days ago)

Run this on the `salessessions` collection:

```javascript
[
  // Filter previous 30 days (30-60 days ago)
  {
    $match: {
      startedAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 60)),
        $lt: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  },
  // Lookup user
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userDetails"
    }
  },
  { $unwind: "$userDetails" },
  // Exclude test users
  {
    $match: {
      "userDetails.email": { $not: /\+.*@hupo\.co$/ },
      "userDetails.isDeleted": { $ne: true }
    }
  },
  // Lookup company
  {
    $lookup: {
      from: "companies",
      localField: "userDetails.company",
      foreignField: "_id",
      as: "companyDetails"
    }
  },
  { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
  // Filter for target companies
  {
    $match: {
      "companyDetails.name": {
        $in: ["Grab", "Pru", "Pru Trial", "UOB", "UOB People", "Manulife"]
      }
    }
  },
  // Calculate session duration with the logic
  {
    $addFields: {
      sessionDurationSeconds: {
        $cond: [
          // If roleplay.duration exists and is a number
          {
            $and: [
              { $ne: ["$roleplay.duration", null] },
              { $isNumber: "$roleplay.duration" }
            ]
          },
          // Use roleplay.duration but cap at 600 seconds (10 min) if > 1800 (30 min)
          {
            $cond: [
              { $gt: ["$roleplay.duration", 1800] },
              600,
              "$roleplay.duration"
            ]
          },
          // Otherwise check if endedAt exists
          {
            $cond: [
              { $ne: ["$endedAt", null] },
              // Use endedAt - startedAt
              { $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000] },
              // Default to 10 seconds
              10
            ]
          }
        ]
      }
    }
  },
  // Group by user
  {
    $group: {
      _id: {
        userId: "$user",
        companyId: "$userDetails.company"
      },
      userName: {
        $first: {
          $cond: [
            { $ne: ["$userDetails.name", ""] },
            "$userDetails.name",
            { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] }
          ]
        }
      },
      userEmail: { $first: "$userDetails.email" },
      companyName: { $first: "$companyDetails.name" },
      totalSessions: { $sum: 1 },
      totalTimeSeconds: { $sum: "$sessionDurationSeconds" },
      loginDays: {
        $addToSet: {
          $dateToString: { format: "%Y-%m-%d", date: "$startedAt" }
        }
      },
      firstLogin: { $min: "$startedAt" },
      lastLogin: { $max: "$startedAt" }
    }
  },
  // Calculate minutes and login frequency
  {
    $addFields: {
      totalTimeMinutes: { $round: [{ $divide: ["$totalTimeSeconds", 60] }, 2] },
      loginDays: { $size: "$loginDays" },
      avgSessionMinutes: {
        $round: [
          { $divide: [{ $divide: ["$totalTimeSeconds", 60] }, "$totalSessions"] },
          2
        ]
      }
    }
  },
  // Group by company
  {
    $group: {
      _id: "$_id.companyId",
      companyName: { $first: "$companyName" },
      totalUsers: { $sum: 1 },
      totalSessions: { $sum: "$totalSessions" },
      totalTimeMinutes: { $sum: "$totalTimeMinutes" },
      avgSessionsPerUser: { $avg: "$totalSessions" },
      avgTimePerUserMinutes: { $avg: "$totalTimeMinutes" },
      avgLoginDaysPerUser: { $avg: "$loginDays" },
      users: {
        $push: {
          userId: "$_id.userId",
          userName: "$userName",
          userEmail: "$userEmail",
          totalSessions: "$totalSessions",
          loginDays: "$loginDays",
          totalTimeMinutes: "$totalTimeMinutes",
          avgSessionMinutes: "$avgSessionMinutes",
          firstLogin: "$firstLogin",
          lastLogin: "$lastLogin"
        }
      }
    }
  },
  // Round averages
  {
    $addFields: {
      totalTimeHours: { $round: [{ $divide: ["$totalTimeMinutes", 60] }, 2] },
      avgSessionsPerUser: { $round: ["$avgSessionsPerUser", 2] },
      avgTimePerUserMinutes: { $round: ["$avgTimePerUserMinutes", 2] },
      avgTimePerUserHours: {
        $round: [{ $divide: ["$avgTimePerUserMinutes", 60] }, 2]
      },
      avgLoginDaysPerUser: { $round: ["$avgLoginDaysPerUser", 2] }
    }
  },
  // Sort by total sessions
  { $sort: { totalSessions: -1 } }
]
```

---

## Query 3: Top Users with Raw Session Data (Last 30 Days)

Run this on the `salessessions` collection to get detailed session-level data for screenshots:

```javascript
[
  // Filter last 30 days
  {
    $match: {
      startedAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  },
  // Lookup user
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userDetails"
    }
  },
  { $unwind: "$userDetails" },
  // Exclude test users
  {
    $match: {
      "userDetails.email": { $not: /\+.*@hupo\.co$/ },
      "userDetails.isDeleted": { $ne: true }
    }
  },
  // Lookup company
  {
    $lookup: {
      from: "companies",
      localField: "userDetails.company",
      foreignField: "_id",
      as: "companyDetails"
    }
  },
  { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
  // Filter for target companies
  {
    $match: {
      "companyDetails.name": {
        $in: ["Grab", "Pru", "Pru Trial", "UOB", "UOB People", "Manulife"]
      }
    }
  },
  // Calculate session duration
  {
    $addFields: {
      sessionDurationSeconds: {
        $cond: [
          {
            $and: [
              { $ne: ["$roleplay.duration", null] },
              { $isNumber: "$roleplay.duration" }
            ]
          },
          {
            $cond: [
              { $gt: ["$roleplay.duration", 1800] },
              600,
              "$roleplay.duration"
            ]
          },
          {
            $cond: [
              { $ne: ["$endedAt", null] },
              { $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000] },
              10
            ]
          }
        ]
      },
      sessionDurationMinutes: {
        $round: [
          {
            $divide: [
              {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$roleplay.duration", null] },
                      { $isNumber: "$roleplay.duration" }
                    ]
                  },
                  {
                    $cond: [
                      { $gt: ["$roleplay.duration", 1800] },
                      600,
                      "$roleplay.duration"
                    ]
                  },
                  {
                    $cond: [
                      { $ne: ["$endedAt", null] },
                      { $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000] },
                      10
                    ]
                  }
                ]
              },
              60
            ]
          },
          2
        ]
      }
    }
  },
  // Sort by company and start time
  { $sort: { "companyDetails.name": 1, startedAt: -1 } },
  // Project clean structure for raw data
  {
    $project: {
      sessionId: "$_id",
      companyName: "$companyDetails.name",
      userName: {
        $cond: [
          { $ne: ["$userDetails.name", ""] },
          "$userDetails.name",
          { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] }
        ]
      },
      userEmail: "$userDetails.email",
      startedAt: 1,
      endedAt: 1,
      sessionDurationMinutes: 1,
      callType: 1,
      roleplayTitle: "$roleplay.title",
      roleplayDuration: "$roleplay.duration",
      usedRoleplayDuration: {
        $and: [
          { $ne: ["$roleplay.duration", null] },
          { $isNumber: "$roleplay.duration" }
        ]
      }
    }
  }
]
```

---

## Query 4: Simplified - Company Summary Numbers Only

Run this for a quick summary:

```javascript
[
  // Last 30 days
  {
    $match: {
      startedAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userDetails"
    }
  },
  { $unwind: "$userDetails" },
  {
    $match: {
      "userDetails.email": { $not: /\+.*@hupo\.co$/ },
      "userDetails.isDeleted": { $ne: true }
    }
  },
  {
    $lookup: {
      from: "companies",
      localField: "userDetails.company",
      foreignField: "_id",
      as: "companyDetails"
    }
  },
  { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
  {
    $match: {
      "companyDetails.name": {
        $in: ["Grab", "Pru", "Pru Trial", "UOB", "UOB People", "Manulife"]
      }
    }
  },
  {
    $addFields: {
      sessionDurationSeconds: {
        $cond: [
          {
            $and: [
              { $ne: ["$roleplay.duration", null] },
              { $isNumber: "$roleplay.duration" }
            ]
          },
          {
            $cond: [
              { $gt: ["$roleplay.duration", 1800] },
              600,
              "$roleplay.duration"
            ]
          },
          {
            $cond: [
              { $ne: ["$endedAt", null] },
              { $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000] },
              10
            ]
          }
        ]
      }
    }
  },
  {
    $group: {
      _id: {
        userId: "$user",
        companyId: "$userDetails.company"
      },
      companyName: { $first: "$companyDetails.name" },
      totalSessions: { $sum: 1 },
      totalTimeMinutes: {
        $sum: { $divide: ["$sessionDurationSeconds", 60] }
      }
    }
  },
  {
    $group: {
      _id: "$_id.companyId",
      companyName: { $first: "$companyName" },
      totalUsers: { $sum: 1 },
      avgTimePerUserMinutes: { $avg: "$totalTimeMinutes" },
      avgSessionsPerUser: { $avg: "$totalSessions" }
    }
  },
  {
    $project: {
      _id: 0,
      companyName: 1,
      totalUsers: 1,
      avgTimePerUserHours: {
        $round: [{ $divide: ["$avgTimePerUserMinutes", 60] }, 2]
      },
      avgSessionsPerUser: { $round: ["$avgSessionsPerUser", 2] }
    }
  },
  { $sort: { companyName: 1 } }
]
```

---

## Instructions

1. **Open MongoDB Compass**
2. **Connect** with the TLS certificate
3. **Select `aisales` database**
4. **Navigate to `salessessions` collection**
5. **Click "Aggregations" tab**
6. **Paste a query and click "Run"**
7. **Export results** as JSON for analysis
8. **For Query 3**, take screenshots of the raw data for top customers

## Notes

- Query 1: Last 30 days with full user details
- Query 2: Previous 30 days (30-60 days ago) for comparison
- Query 3: Raw session-level data for screenshots
- Query 4: Quick summary numbers only

All queries:
- Exclude test users (emails with `+*@hupo.co`)
- Use the correct duration calculation logic
- Focus on Grab, Pru (+ variants), and Manulife
