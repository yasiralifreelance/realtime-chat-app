'use client';

import { User } from '@/types/chat';
import { Mic, User as UserIcon } from 'lucide-react';

interface UserListProps {
  users: User[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-4">
        Online ({users.length})
      </h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-2 p-2 rounded-lg bg-white border"
          >
            <UserIcon className="w-4 h-4 text-gray-600" />
            <span className="flex-1 text-sm font-medium text-gray-800">
              {user.username}
            </span>
            {user.isActive && (
              <Mic className="w-4 h-4 text-green-500 animate-pulse" />
            )}
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-gray-500 text-sm">No users online</p>
        )}
      </div>
    </div>
  );
};