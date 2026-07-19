import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from './generated/prisma/client';


const globleForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined

}

function createPrismaClient() {
    const URL = process.env.DATABASE_URL;
    if(!URL) throw new Error ("DATABASE_URL is not defined");

    const adapter = new PrismaPg(URL);
    return new PrismaClient({adapter})
}

export const prisma = globleForPrisma.prisma ?? createPrismaClient();

if(process.env.NODE_ENV !== 'production') globleForPrisma.prisma = prisma;

export default prisma