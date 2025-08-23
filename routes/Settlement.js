const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require('../Methods/isLoggedIn.js');
const settlement = require("../Controllers/settlement.js");


router.route("/",isLoggedIn)
.get(wrapAsync(settlement.settlementGet))
.post(wrapAsync(settlement.settlementPost));

router.route("/:id",isLoggedIn)
.get(wrapAsync(settlement.individual))
.post(wrapAsync(settlement.individualPost))
.delete(wrapAsync(settlement.individualDelete));

router.post('/:id/settle', isLoggedIn, wrapAsync(settlement.settleUp));

module.exports = router;

