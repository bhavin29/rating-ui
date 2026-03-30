import { gql } from 'graphql-request';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      status
    }
  }
`;

export const CREATE_SPRINT = gql`
  mutation CreateSprint($input: CreateSprintInput!) {
    createSprint(input: $input) {
      id
      name
      status
    }
  }
`;

export const ASSIGN_MEMBERS = gql`
  mutation AssignMembers($sprintId: ID!, $memberIds: [ID!]!) {
    assignMembers(sprintId: $sprintId, memberIds: $memberIds) {
      id
    }
  }
`;

export const REQUEST_RATING = gql`
  mutation RequestRating($sprintId: ID!) {
    requestRating(sprintId: $sprintId) {
      ok
      requestedAt
    }
  }
`;

export const SUBMIT_RATING = gql`
  mutation SubmitRating($token: String!, $input: SubmitRatingInput!) {
    submitRating(token: $token, input: $input) {
      ok
      submittedAt
    }
  }
`;
