// server/src/graphql/typeDefs/gradeDefs.js
const typeDefs = `#graphql
  type GradeRecord {
    id: ID!
    student_id: String!
    student_name: String!
    department: String!
    course_code: String!
    semester: String!
    grade: Float!
    credits: Int!
    updated_at: String
  }

  type ShardStats {
    totalCount: Int!
    averageGrade: Float!
  }

  type Query {
    # Fetch a paginated list of grades (Cursor-based pagination to protect server memory)
    getGrades(limit: Int, nextCursor: String): GradeResponse!
    
    # Target analytics fetching optimized for our compound shard key
    getDepartmentAnalytics(department: String!): ShardStats!
    
    # Specific student lookup matching full compound shard key
    getStudentGrades(student_id: String!, department: String!): [GradeRecord!]!
  }

  type GradeResponse {
    records: [GradeRecord!]!
    nextCursor: String
    hasMore: Boolean!
  }
`;

module.exports = typeDefs;