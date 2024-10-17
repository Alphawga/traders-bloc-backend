import { UserWithRelations } from '@/lib/model';
import { create } from 'zustand';




interface UserStore {
  user: UserWithRelations | null;
  setUser: (user: UserWithRelations | null) => void;
  clearUser: () => void;
 
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  

}));


export default useUserStore;