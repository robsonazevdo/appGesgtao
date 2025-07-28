import React, { createContext, useReducer, ReactNode } from 'react';
import { UserReducer, initialState, UserState, UserAction } from '../reducers/UserReducer';

type UserContextType = {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
};

export const UserContext = createContext<UserContextType>({} as UserContextType);

type Props = {
  children: ReactNode;
};

export default function UserProvider({ children }: Props) {
  const [state, dispatch] = useReducer(UserReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}
