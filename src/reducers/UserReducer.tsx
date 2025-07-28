
// 1. Tipo do estado
export type UserState = {
  avatar: string;
  favorites: any[];       // Use um tipo específico em vez de `any` se souber o formato
  appointments: any[];    // Idem acima
};

// 2. Tipo das ações
export type UserAction =
  | { type: 'setAvatar'; payload: { avatar: string } };

// 3. Estado inicial com tipo
export const initialState: UserState = {
  avatar: '',
  favorites: [],
  appointments: [],
};

// 4. Função reducer com tipos
export const UserReducer = (
  state: UserState,
  action: UserAction
): UserState => {
  switch (action.type) {
    case 'setAvatar':
      return { ...state, avatar: action.payload.avatar };
    default:
      return state;
  }
};
