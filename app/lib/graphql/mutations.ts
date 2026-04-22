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

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      name
      status
    }
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($input: UpdateRoleInput!) {
    updateRole(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($input: DeleteRoleInput!) {
    deleteRole(input: $input)
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
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

export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
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

export const DELETE_USER = gql`
  mutation DeleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input)
  }
`;

export const CREATE_SPRINT = gql`
  mutation CreateSprint($input: CreateSprintInput!) {
    createSprint(input: $input) {
      id
      name
      startDate
      endDate
    }
  }
`;

export const UPDATE_SPRINT = gql`
  mutation UpdateSprint($input: UpdateSprintInput!) {
    updateSprint(input: $input) {
      id
      name
      startDate
      endDate
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

export const ADD_PROJECT_MEMBERS = gql`
  mutation AddProjectMembers($input: AddProjectMembersInput!) {
    addProjectMembers(input: $input) {
      id
    }
  }
`;

export const REMOVE_PROJECT_MEMBER = gql`
  mutation RemoveProjectMember($input: RemoveProjectMemberInput!) {
    removeProjectMember(input: $input)
  }
`;

export const UPDATE_PROJECT_MEMBER_STATUS = gql`
  mutation UpdateProjectMemberStatus($input: UpdateProjectMemberStatusInput!) {
    updateProjectMemberStatus(input: $input) {
      id
      isActive
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
