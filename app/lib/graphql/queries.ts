import { gql } from 'graphql-request';

export const GET_PROJECTS = gql`
  query GetProjects {
    getProjects {
      id
      name
      status
      createdAt
    }
  }
`;

export const GET_SPRINTS = gql`
  query GetSprints($projectId: ID) {
    getSprints(projectId: $projectId) {
      id
      name
      status
      startDate
      endDate
      project {
        id
        name
      }
    }
  }
`;

export const GET_SPRINT_MEMBERS = gql`
  query GetSprintMembers($sprintId: ID!) {
    getSprintMembers(sprintId: $sprintId) {
      id
      name
      email
      role
    }
  }
`;

export const GET_QUESTIONS_BY_ROLE = gql`
  query GetQuestionsByRole($role: String!) {
    getQuestionsByRole(role: $role) {
      id
      text
      role
    }
  }
`;

export const VALIDATE_TOKEN = gql`
  query ValidateToken($token: String!) {
    validateToken(token: $token) {
      isValid
      sprint {
        id
        name
      }
      rater {
        id
        name
      }
      members {
        id
        name
        role
      }
      questionsByRole {
        role
        questions {
          id
          text
        }
      }
      hasSubmitted
    }
  }
`;

export const GET_REPORTS = gql`
  query GetReports($sprintId: ID) {
    getReports(sprintId: $sprintId) {
      sprintName
      memberAverages {
        memberId
        memberName
        average
      }
      roleAverages {
        role
        average
      }
      trend {
        sprint
        average
      }
    }
  }
`;
