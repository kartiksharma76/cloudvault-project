import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import filesRouter from "./files";
import foldersRouter from "./folders";
import notesRouter from "./notes";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(filesRouter);
router.use(foldersRouter);
router.use(notesRouter);
router.use(dashboardRouter);

export default router;
