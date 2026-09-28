import express, { Request, Response } from "express";
import dayjs from "dayjs";
import { ProductCatalog } from "./domain/products";
import { Inventory } from "./domain/inventory";
import { UserDirectory } from "./domain/users";
import { CouponBook } from "./domain/discounts";
import { OrderService } from "./domain/orders";

const app = express();
app.use(express.json());

const catalog = new ProductCatalog();
const inventory = new Inventory();
const users = new UserDirectory();
const coupons = new CouponBook();
const orders = new OrderService(inventory, coupons);

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    startedAt: dayjs().toISOString(),
    productCount: catalog.count(),
    userCount: users.count(),
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`bench app listening on ${port}`);
  });
}

export { app, catalog, inventory, users, coupons, orders };
