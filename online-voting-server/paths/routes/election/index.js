const express = require("express");
const { 
    // ELections
    create_election, update_election, delete_election,
    get_all_elections, 
    get_all_active_elections,
    bulk_update_elections,

    // Election Groups
    create_election_group, get_all_election_groups, 
    active_election_groups, bulk_update_election_groups, 
    update_election_group,

    // Election Votes
    vote_for_election,

} = require("../../../api/controllers/election");
const router = express.Router();

// Vote for election
router.post("/elections/vote", vote_for_election);

// ELections
router.post('/elections/create', create_election);

router.put('/elections/update/:id', update_election);

router.delete('/elections/delete/:id', delete_election);

router.get('/elections', get_all_elections);

router.get('/elections/active', get_all_active_elections);

router.patch('/elections/bulk-update', bulk_update_elections);


// Election Groups
router.post("/election/create/group", create_election_group);

router.get("/election/groups", get_all_election_groups);

router.patch('/election-groups/:group_id', update_election_group);

router.put("/election-groups/bulk-update", bulk_update_election_groups);

router.get("/election-groups/active", active_election_groups);


module.exports = router;