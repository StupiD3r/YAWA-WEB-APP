// server/src/graphql/resolvers/gradeResolvers.js
const { ObjectId } = require('mongodb');

const resolvers = {
  Query: {
    // 1. Paginated retrieval to cleanly handle large datasets safely
    getGrades: async (_, { limit = 20, nextCursor }, { db }) => {
      const query = {};
      if (nextCursor) {
        query._id = { $lt: new ObjectId(nextCursor) };
      }

      // Sort by descending ObjectId for predictable scrolling pagination
      const records = await db.collection('grades')
        .find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .toArray();

      const hasMore = records.length > limit;
      if (hasMore) records.pop(); // Remove extra record used for evaluation

      const nextCursorStr = hasMore ? records[records.length - 1]._id.toString() : null;

      return {
        records: records.map(r => ({ ...r, id: r._id.toString() })),
        nextCursor: nextCursorStr,
        hasMore
      };
    },

    // 2. High-performance Cached & Targeted Shard Analytics Query
    getDepartmentAnalytics: async (_, { department }, { db, redis }) => {
      // Create a clean, standardized unique cache key for Redis (e.g., "analytics:dept:computer_science")
      const cacheKey = `analytics:dept:${department.toLowerCase().replace(/ /g, '_')}`;

      try {
        // Step A: Check Redis Cache First
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`🎯 Cache HIT for key: ${cacheKey}`);
          return JSON.parse(cachedData);
        }

        console.log(`❌ Cache MISS for key: ${cacheKey}. Querying MongoDB Shards...`);

        // Step B: Fetch from MongoDB Shards on a Cache Miss
        const pipeline = [
          { $match: { department: department } },
          {
            $group: {
              _id: "$department",
              totalCount: { $sum: 1 },
              averageGrade: { $avg: "$grade" }
            }
          }
        ];

        const result = await db.collection('grades').aggregate(pipeline).toArray();
        
        let responseData = { totalCount: 0, averageGrade: 0.0 };
        if (result.length > 0) {
          responseData = {
            totalCount: result[0].totalCount,
            averageGrade: Math.round(result[0].averageGrade * 100) / 100
          };
        }

        // Step C: Save the result to Redis with an automatic 60-second expiration (TTL)
        await redis.setEx(cacheKey, 60, JSON.stringify(responseData));

        return responseData;
      } catch (error) {
        console.error('Redis Cache Error encountered:', error);
        
        // Safety Fallback: If Redis fails, gracefully run directly against MongoDB so your API doesn't crash
        const pipeline = [{ $match: { department } }, { $group: { _id: "$department", totalCount: { $sum: 1 }, averageGrade: { $avg: "$grade" } } }];
        const result = await db.collection('grades').aggregate(pipeline).toArray();
        if (result.length === 0) return { totalCount: 0, averageGrade: 0.0 };
        return { totalCount: result[0].totalCount, averageGrade: Math.round(result[0].averageGrade * 100) / 100 };
      }
    },

    // 3. Direct Student Point Query matching full compound Shard Key
    getStudentGrades: async (_, { student_id, department }, { db }) => {
      const records = await db.collection('grades')
        .find({ department, student_id })
        .toArray();
      return records.map(r => ({ ...r, id: r._id.toString() }));
    }
  }
};

module.exports = resolvers;