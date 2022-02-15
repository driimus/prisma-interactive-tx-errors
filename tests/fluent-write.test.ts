import { randomUUID } from "crypto";
import { prisma } from "../src";

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
});
afterAll(async () => {
  await prisma.$disconnect();
});

it('should allow chaining on "create" calls', async () => {
  await expect(
    prisma.user
      .create({
        data: {
          email: randomUUID(),
        },
      })
      .posts()
  ).resolves.toMatchObject([]);
});

it('should allow chaining on "update" calls', async () => {
  const post = await prisma.post.create({ data: { title: "title" } });
  const user = await prisma.user.create({
    data: {
      email: randomUUID(),
      posts: {
        connect: {
          id: post.id,
        },
      },
    },
  });

  await expect(
    prisma.user
      .update({
        where: {
          id: user.id,
        },
        data: {
          name: randomUUID(),
        },
      })
      .posts()
  ).resolves.toMatchObject([post]);
});
