import primsa from "@/lib/db";
import { generateSlug } from "random-word-slugs";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const workflowsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) => {
    return primsa.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
      },
    });
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return primsa.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(({ ctx, input }) => {
      return primsa.workflow.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return primsa.workflow.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  getMany: protectedProcedure.query(({ ctx, input }) => {
    return primsa.workflow.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
    });
  }),
});
