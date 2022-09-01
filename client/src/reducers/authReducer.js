import {
  SET_CURRENT_USER,
  USER_LOADING,
  USER_NOT_LOADING,
} from "../actions/types";

const initialState = {
  isAuthenticated: false,
  userID: null,
  user: {},
  loading: true,
};

export default function authActions(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: action.isAuthenticated,
        userID: action.userID,
        user: action.user,
        loading: false,
      };
    case USER_LOADING:
      return {
        ...state,
        loading: true,
      };
    case USER_NOT_LOADING:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}
