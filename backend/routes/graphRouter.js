import { Router } from 'express';
import { getCommunityFeed } from '../controller/graph.controller.js';

const router = Router();

router.route("/community-feed").get(getCommunityFeed);

export default router;
