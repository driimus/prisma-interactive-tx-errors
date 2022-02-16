import { faker } from "@faker-js/faker";
import { prisma } from "../src";

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("check constraint errors should be thrown", () => {
  test("during normal writes", async () => {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.firstName(),
      },
    });

    await expect(
      prisma.post.create({
        data: {
          authorId: user.id,
          title: faker.lorem.sentence(),
          viewCount: -1, // should fail, must be >= 0
        },
      })
    ).rejects.toThrowError("CHECK constraint failed: viewCount >= 0");
  });

  test("inside transaction writes", async () => {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.firstName(),
      },
    });

    await expect(
      prisma.$transaction([
        prisma.post.create({
          data: {
            authorId: user.id,
            title: faker.lorem.sentence(),
            viewCount: -1, // should fail, must be >= 0
          },
        }),
      ])
    ).rejects.toThrowError("CHECK constraint failed: viewCount >= 0");
  });
  test("inside interactive transactions", async () => {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.firstName(),
      },
    });

    await expect(
      prisma.$transaction(async (client) => {
        const user = await client.user.create({
          data: {
            email: faker.internet.email(),
            name: faker.name.firstName(),
          },
        });

        return client.post.create({
          data: {
            authorId: user.id,
            title: faker.lorem.sentence(),
            viewCount: -1, // should fail, must be >= 0
          },
        });
      })
    ).rejects.toThrowError("CHECK constraint failed: viewCount >= 0");
  });
});
