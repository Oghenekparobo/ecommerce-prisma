import prisma from "lib/prisma";
import { getSession } from "next-auth/react";


export default async function handler(req , res){
   
    const session = await getSession({req});
    if(!session) return res.status(401).json({message :'user not logged in'});

    const user = await prisma.user.findUnique({ 
        where:{
            id: session.user.id
        }
        
    })

    if(!user) return res.status(401).json({message :'user found'});
    if(!user.isAdmin) return res.status(401).json({message :'user not authorized'});

    if(req.method === 'POST'){ 

        await prisma.product.create({
            data:{
                title:req.body.title,
                price:parseInt(req.body.price) * 100,
                description:req.body.description,
                image:req.body.image
            }
           

        })

        res.end();
    }

}