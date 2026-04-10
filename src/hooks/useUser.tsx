'use client'
import useSWR from "swr";
import {createContext, useContext, ReactNode} from "react";
import { useAuth } from "@clerk/nextjs";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Error al cargar perfil");
    return res.json();
};
interface UserData{
    id:string;
    name:string;
    email:string;
    aquacoins:number;
    image?:string;
    discord_name?:string;
    discord_id?:string;
}


const UserContext = createContext<{user: UserData | null; isLoading: boolean;}|null>(null);

export function UserProvider({children}:{children:ReactNode}){
    const { isLoaded, isSignedIn } = useAuth();

    const shouldFetchProfile = isLoaded && isSignedIn;

    const {data:user, isLoading} = useSWR<UserData | null>(
        shouldFetchProfile ? "/api/profile" : null,
        fetcher,
        {
            shouldRetryOnError: false,
            revalidateOnFocus: false,
        }
    );

    return (
        <UserContext.Provider value={{user:user || null, isLoading}}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser(){
    const context = useContext(UserContext);
    if(!context){
        throw new Error("Error: useUser debe ser usado dentro de UserProvider");        
    }
    return context;
}
