
import {auth} from "@/lib/auth";
import AuthClientPage from "@/app/auth/auth-client"
import {headers } from "next/headers"
import { redirect } from "next/navigation"


export default async function AuthPage(){
    const session = await auth.api.getSession({
        headers: (() => { const h = headers(); const hh = new Headers(); h.forEach((v, k) => hh.set(k, v)); return hh; })(),
    });
    if(session){
        redirect("/perfil");
    }
    return <AuthClientPage/>
}
