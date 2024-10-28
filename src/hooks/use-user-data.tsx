import { trpc } from '@/app/_providers/trpc-provider';


export function useUserData(userId: string | undefined, type: 'USER' | 'ADMIN') {
    if(type === "USER"){

        const userData = trpc.getUserData.useQuery( userId ?? '' );
        return userData;
    }else{
        const adminData = trpc.getAdminData.useQuery()
        return adminData;
    }
}