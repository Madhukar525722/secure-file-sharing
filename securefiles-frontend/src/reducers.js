import { combineReducers } from 'redux';

const dummyReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default combineReducers({
  dummy: dummyReducer,
});
