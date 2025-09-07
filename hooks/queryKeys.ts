export const keys = {
  user: (user) => ['user', user],
  userFollowing: (userID, otherUserId) => ['following', userID + otherUserId],
};
