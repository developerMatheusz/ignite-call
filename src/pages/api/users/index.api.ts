import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

    if (request.method != "POST") {
        return response.status(405).end();
    }

    const { name, username } = request.body;

    const user = await prisma.user.create({
        data: {
            name, 
            username
        }
    });

    return response.status(201).json(user);

}
