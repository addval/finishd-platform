/**
 * Search Routes
 * API endpoints for Typesense search
 */

import { Router } from "express"
import { searchDesignersHandler, searchContractorsHandler } from "./search.controller.js"

const router = Router()

// GET /api/v1/search/designers - Search designers
router.get("/designers", searchDesignersHandler)

// GET /api/v1/search/contractors - Search contractors
router.get("/contractors", searchContractorsHandler)

export default router
