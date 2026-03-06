import Skin, { SkinWithBlur, SkinWithDiscount } from "@/interfaces/skin.interface";
import { getPlaiceholder } from "plaiceholder";
interface Layout{
    id:string,
    name:string,
    rank:number
}
export async function getSkins() {
    /*headers : {
        authorization: `${process.env.NEXT_PUBLIC_APIKEY_FORTNITE}`
    }*/
        
    const res = await fetch("https://fortnite-api.com/v2/shop?language=es-419",{
        cache: "no-store",
        next:{revalidate:0} 
      })
    const data = await res.json();
    
    const skinsRate = data.data.entries;
    const discountRate = 0.0036;
    
    //agregar el discount - descuento que hace aquifornais
    const skins:SkinWithDiscount[] = skinsRate.map((skin:any)=> ({
        ...skin,
        discount: parseFloat((skin?.finalPrice * discountRate).toFixed(2)),
    })) 
    
    //Solo para obtener las categorias 
    let filteredSkins: Record<string, {layout:Layout, skins:Skin[]}> = {};
    //para tener un objeto que empeize con nombre de la categoria y las skins
    skins.forEach((item:any) => {
        const grupo = item.layout?.name.length <= 2 ? "" : item.layout?.name;
        const layout = item.layout;
        if (!filteredSkins[layout?.name]) {
            filteredSkins[layout?.name] = {
                layout,
                skins:[]
            };
        }
        filteredSkins[layout?.name].skins.push(item);
    })
    
    const skinsSorted = Object.values(filteredSkins).sort((a,b) => b.layout?.rank - a.layout?.rank)
    
    const test:Record<string, {layout:Layout, skins:Skin[]}> = {};
    skinsSorted.forEach((item) => {
        test[item.layout?.name] = item;
    })
    filteredSkins = test;
    
    /*
    const withBlur = await Promise.all(
        skins.map(async (skin:any) => {
            const imageUrl = skin.displayAssets[0]?.url;
            const imageRes = await fetch(imageUrl);
            const buffer = await imageRes.arrayBuffer();
            const { base64 } = await getPlaiceholder(Buffer.from(buffer));
            return {
                ...skin,
                blurDataUrl:base64,
            }
        })
    )*/
   
    const categories = ["Todos", ...Object.keys(test)];
    return {skins, categories}
    
}   