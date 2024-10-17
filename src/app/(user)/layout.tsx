"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useUserStore from '@/store/user-store';
import { useUserData } from '@/hooks/use-user-data';
import { UserWithRelations } from '@/lib/model';
import MainHeader from '@/components/headers/mainHeader';



export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { user, setUser } = useUserStore();
  const { data: userData } = useUserData(session?.user?.id);


  useEffect(() => {
   if (status === "authenticated" && userData ) {
      setUser(userData as unknown as UserWithRelations);
    }else if(!user){
      setUser(userData as unknown as UserWithRelations);
    }
    if(status === "unauthenticated"){
      router.push("/");
    }
  }, [status, userData, user, router, setUser]);



  return (
  <>
  <MainHeader />
  {children}
  </>
  );
}
