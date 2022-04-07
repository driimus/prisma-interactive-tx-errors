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
    ).rejects.toThrowError(
      'violates check constraint \\"Post_viewCount_check\\"'
    );
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
    ).rejects.toThrowError(
      'violates check constraint \\"Post_viewCount_check\\"'
    );
  });
  test("inside interactive transactions", async () => {
    await expect(
      prisma.$transaction(async (client) => {
        const user = await client.user.create({
          data: {
            email: faker.internet.email(),
            name: faker.name.firstName(),
          },
        });

        const post = await client.post.create({
          data: {
            authorId: user.id,
            title: faker.lorem.sentence(),
            viewCount: -1, // should fail, must be >= 0
          },
        });

        return post;
      })
    ).rejects.toThrowError(
      'violates check constraint \\"Post_viewCount_check\\"'
    );
  });
});
