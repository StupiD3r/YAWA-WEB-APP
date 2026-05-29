// server/src/graphql/resolvers/gradeResolvers.js
const { ObjectId } = require('mongodb');
const { streamLogEvent } = require('../../kafka'); // Import our Kafka streaming helper

// Helper function to handle the MongoDB Aggregation Pipeline cleanly
async function fetchFromMongo(db, department) {
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
  
  if (result.length === 0) {
    return { totalCount: 0, averageGrade: 0.0 };
  }

  return {
    totalCount: result[0].totalCount,
    averageGrade: Math.round(result[0].averageGrade * 100) / 100
  };
}

const resolvers = {
  Query: {
    // 1. Paginated retrieval to cleanly handle large datasets safely
    getGrades: async (_, { limit = 20, nextCursor }, { db }) => {
      const query = {};
      if (nextCursor) {
        query._id = { $lt: new ObjectId(nextCursor) };
      }

      const records = await db.collection('grades')
        .find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .toArray();

      const hasMore = records.length > limit;
      if (hasMore) records.pop();

      const nextCursorStr = hasMore ? records[records.length - 1]._id.toString() : null;

      return {
        records: records.map(r => ({ ...r, id: r._id.toString() })),
        nextCursor: nextCursorStr,
        hasMore
      };
    },

    // 2. High-performance Cached & Targeted Shard Analytics Query
    getDepartmentAnalytics: async (_, { department }, { db, redis }) => {
      const cacheKey = `analytics:dept:${department.toLowerCase().replace(/ /g, '_')}`;

      try {
        if (!redis) {
          console.log(`⚠️ Redis client is not initialized. Bypassing cache directly to Shards...`);
          return await fetchFromMongo(db, department);
        }

        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`🎯 Cache HIT for key: ${cacheKey}`);
          return JSON.parse(cachedData);
        }

        console.log(`❌ Cache MISS for key: ${cacheKey}. Querying MongoDB Shards...`);
        const responseData = await fetchFromMongo(db, department);

        await redis.setEx(cacheKey, 60, JSON.stringify(responseData));
        return responseData;
      } catch (error) {
        console.error('Redis Cache Error encountered:', error);
        return await fetchFromMongo(db, department);
      }
    },

    // 3. Direct Student Point Query matching full compound Shard Key
    getStudentGrades: async (_, { student_id, department }, { db }) => {
      const records = await db.collection('grades')
        .find({ department, student_id })
        .toArray();
      return records.map(r => ({ ...r, id: r._id.toString() }));
    }
  },

  Mutation: {
    // 4. Real-time Grade Mutator with Cache Eviction and Kafka Broadcasting
    updateStudentGrade: async (_, { student_id, department, course_code, newGrade }, { db, redis }) => {
      console.log(`📝 Processing grade update request for Student: ${student_id} | Dept: ${department}`);

      // Update the document inside the Sharded Cluster targeting compound keys
      const result = await db.collection('grades').findOneAndUpdate(
        { student_id, department, course_code },
        { 
          $set: { 
            grade: newGrade,
            updated_at: new Date().toISOString()
          } 
        },
        { returnDocument: 'after' } 
      );

      // Handle raw MongoDB findOneAndUpdate differences across library updates
      const updatedDocument = result.value || result;

      if (!updatedDocument) {
        throw new Error(`Grade record matching Course Code ${course_code} for Student ${student_id} was not found.`);
      }

      // Cache Eviction (Wipe stale analytics from Redis memory)
      if (redis) {
        const cacheKey = `analytics:dept:${department.toLowerCase().replace(/ /g, '_')}`;
        await redis.del(cacheKey);
        console.log(`🧹 Cache cleared for key: ${cacheKey} due to data mutation event.`);
      }

      // Stream out to Apache Kafka Event Bus asynchronously
      const cleanRecord = {
        ...updatedDocument,
        id: updatedDocument._id.toString()
      };
      
      await streamLogEvent('grade-mutations', 'GRADE_UPDATED', cleanRecord);

      return cleanRecord;
    }
  }
};

module.exports = resolvers;