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
    }
  }
`;

export const GET_PROJECT_MEMBERS = gql`
  query GetProjectMembers($projectId: String!) {
    getProjectMembers(projectId: $projectId) {
      id
      user {
        id
        fullName
        email
        isActive
        role {
          id
          name
        }
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

export const GET_SPRINT_MEMBERS = gql`
  query GetSprintMembers($sprintId: String!) {
    getSprintMembers(sprintId: $sprintId) {
      id
      user {
        id
        fullName
        email
        role {
          id
          name
        }
      }
    }
  }
`;

export const GET_QUESTIONS_BY_ROLE = gql`
  query GetQuestionsByRole($roleId: String!) {
    getQuestionsByRole(roleId: $roleId) {
      id
      text
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
