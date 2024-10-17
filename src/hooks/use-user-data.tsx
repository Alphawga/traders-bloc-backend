import { trpc } from '@/app/_providers/trpc-provider';
import { useQuery } from '@tanstack/react-query';


export function useUserData(userId: string | undefined) {
 const userData = trpc.getUserData.useQuery( userId ?? '' );
 return userData;
}