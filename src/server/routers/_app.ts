import { router } from "../trpc";
import { rbacRouter } from "./rbac";
import { userRouter } from "./user";
import { clientRouter } from "./client";
import { equipmentRouter } from "./equipment";
import { quotationRouter } from "./quotation";
import { quotationItemRouter } from "./quotationItem";
import { quotationItemTemplateRouter } from "./quotationItemTemplate";
import { serviceOrderRouter } from "./serviceOrder";
import { serviceOrderItemRouter } from "./serviceOrderItem";
import { serviceOrderItemTemplateRouter } from "./serviceOrderItemTemplate";
import { purchaseOrderRouter } from "./purchaseOrder";
import { purchaseOrderItemRouter } from "./purchaseOrderItem";
import { purchaseOrderItemTemplateRouter } from "./purchaseOrderItemTemplate";
import { companyRouter } from "./company";

export const appRouter = router({
  user: userRouter,
  rbac: rbacRouter,
  client: clientRouter,
  equipment: equipmentRouter,
  quotation: quotationRouter,
  quotationItem: quotationItemRouter,
  quotationItemTemplate: quotationItemTemplateRouter,
  serviceOrder: serviceOrderRouter,
  serviceOrderItem: serviceOrderItemRouter,
  serviceOrderItemTemplate: serviceOrderItemTemplateRouter,
  purchaseOrder: purchaseOrderRouter,
  purchaseOrderItem: purchaseOrderItemRouter,
  purchaseOrderItemTemplate: purchaseOrderItemTemplateRouter,
  company: companyRouter,
});

export type AppRouter = typeof appRouter;
