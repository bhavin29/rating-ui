import { gql } from 'graphql-request';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
    }
  }
`;

export const CREATE_SPRINT = gql`
  mutation CreateSprint($input: CreateSprintInput!) {
    createSprint(input: $input) {
      id
      name
    }
  }
`;

export const ADD_SPRINT_MEMBERS = gql`
  mutation AddSprintMembers($input: AddSprintMembersInput!) {
    addSprintMembers(input: $input) {
      id
    }
  }
`;

export const REQUEST_RATING = gql`
  mutation RequestRating($sprintId: String!) {
    requestRating(sprintId: $sprintId)
  }
`;

export const SUBMIT_RATING = gql`
  mutation SubmitRating($input: SubmitRatingInput!) {
    submitRating(input: $input) {
      id
      averageScore
    }
  }
`;

export const VALIDATE_TOKEN = gql`
  mutation ValidateToken($input: ValidateTokenInput!) {
    validateToken(input: $input) {
      valid
      reason
      userId
    }
  }
`;
