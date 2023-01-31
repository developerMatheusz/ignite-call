import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {

    if (req.method != "GET") {
        return res.status(405).end();
    }

    const username = String(req.query.username);
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({
            message: "Ano ou mês não especificado."
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            username
        }
    });

    if (!user) {
        return res.status(400).json({
            message: "Usuário não existe."
        });
    }

    const availableWeekDays = await prisma.userTimeInterval.findMany({
        select: {
            week_day: true
        }, 
        where: {
            user_id: user.id
        }
    });

    const blockedWeekDay = [0, 1, 2, 3, 4, 5, 6].filter(
        weekDay => {
            return !availableWeekDays.some(
                availableWeekDay => 
                    availableWeekDay.week_day === weekDay
            )
        }
    );

    const blockedDatesRaw = await prisma.$queryRaw`
        SELECT * 
        FROM schedulings

        WHERE S.user_id = ${user.id} 
            AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}
    `

    return res.json({ blockedWeekDay, blockedDatesRaw });

}
