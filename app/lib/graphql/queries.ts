import { gql } from 'graphql-request';

export const GET_PROJECTS = gql`
  query GetProjects {
    getProjects {
      id
      name
      status
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      fullName
      email
      isActive
      role {
        id
        name
      }
      userRoles {
        id
        role { id name }
        skill { id name }
        level
      }
    }
  }
`;

export const GET_SKILLS = gql`
  query GetSkills {
    getSkills {
      id
      name
    }
  }
`;

export const GET_ROLES = gql`
  query GetRoles {
    getRoles {
      id
      name
    }
  }
`;

export const GET_PROJECT_MEMBERS = gql`
  query GetProjectMembers($projectId: String!) {
    getProjectMembers(projectId: $projectId) {
      id
      isActive
      roleId
      allocationPercentage
      role { id name }
      user {
        id
        fullName
        email
        isActive
        role { id name }
      }
    }
  }
`;

export const GET_SPRINTS = gql`
  query GetSprints($projectId: String!) {
    getSprints(projectId: $projectId) {
      id
      name
      startDate
      endDate
    }
  }
`;

export const GET_AVAILABLE_QUESTIONS = gql`
  query GetAvailableQuestions($roleId: ID!, $search: String, $categoryId: ID) {
    getAvailableQuestions(roleId: $roleId, search: $search, categoryId: $categoryId) {
      id
      text
      category {
        id
        name
      }
    }
  }
`;

export const GET_ASSIGNED_QUESTIONS = gql`
  query GetAssignedQuestions($roleId: String!) {
    getAssignedQuestions(roleId: $roleId) {
      id
      question {
        id
        text
        category {
          id
          name
        }
      }
    }
  }
`;

export const GET_QUESTION_CATEGORIES = gql`
  query QuestionCategories($search: String, $isActive: Boolean, $skip: Int, $take: Int) {
    questionCategories(search: $search, isActive: $isActive, skip: $skip, take: $take) {
      id
      name
      description
      isActive
    }
  }
`;

export const GET_ALL_QUESTIONS = gql`
  query Questions($search: String, $categoryId: String, $projectId: String, $sprintId: String, $isActive: Boolean, $skip: Int, $take: Int) {
    questions(search: $search, categoryId: $categoryId, projectId: $projectId, sprintId: $sprintId, isActive: $isActive, skip: $skip, take: $take) {
      id
      text
      categoryId
      category {
        id
        name
      }
      projectId
      project {
        id
        name
      }
      sprintId
      sprint {
        id
        name
      }
      isActive
    }
  }
`;

export const GENERATE_SPRINT_RATING_REQUEST = gql`
  query GenerateSprintRatingRequest($spmId: String!) {
    generateSprintRatingRequest(spmId: $spmId) {
      spmId
      projectName
      sprintName
      ratedUserName
      ratedUserRole
      questions {
        id
        spr_id: sprId
        text
        helpText: helperText
        ratingByUserId
        ratingByUserName
        ratingByUserRole
        rating
        answer
      }
    }
  }
`;

export const GET_USER_PROJECT_SPRINT_DATA = gql`
  query GetUserProjectSprintData($userId: String!) {
    getUserProjectSprintData(userId: $userId) {
      userId
      userName
      projectId
      projectName
      sprintId
      sprintStartDate
      sprintEndDate
      sprintName
      sprintProjectMemberId
    }
  }
`;

export const GET_SPRINT_RATINGS = gql`
  query GetSprintRatings($sprintId: String!) {
    getSprintRatings(sprintId: $sprintId) {
      userId
      userName
      averageScore
    }
  }
`;
