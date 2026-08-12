import type { ManageUserStatus } from '../models/ManageUser.js';

type UserLike = {
  status?: ManageUserStatus | null;
  isDeleted?: boolean | null;
};

export const getEffectiveUserStatus = (user: UserLike): ManageUserStatus => {
  if (user?.isDeleted) {
    return 'inactive';
  }

  return (user?.status as ManageUserStatus) || 'active';
};
