import prisma from "../../config/prisma.js";

export const getUserNameList = async () => {
    return prisma.user.findMany({
        where: {
            role: "USER",
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};