import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware, notificationHandlerMiddleware } from 'server/middlewares';
import { orderValidationSchema } from 'validationSchema/orders';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.order
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getOrderById();
    case 'PUT':
      return updateOrderById();
    case 'DELETE':
      return deleteOrderById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getOrderById() {
    const data = await prisma.order.findFirst(convertQueryToPrismaUtil(req.query, 'order'));
    return res.status(200).json(data);
  }

  async function updateOrderById() {
    await orderValidationSchema.validate(req.body);
    const data = await prisma.order.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    await notificationHandlerMiddleware(req, data.id);
    return res.status(200).json(data);
  }
  async function deleteOrderById() {
    await notificationHandlerMiddleware(req, req.query.id as string);
    const data = await prisma.order.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
