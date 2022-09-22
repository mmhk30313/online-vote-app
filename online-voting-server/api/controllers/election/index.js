const fs = require('fs');
const UserRole = require("../../models/User/UserRole");
const { authenticateJWT } = require("../auth");
const uploadFile = require("../all_global_controllers/upload");
const deleteFile = require("../all_global_controllers/delete");
const Election = require("../../models/Election/Election");
const ElectionGroup = require("../../models/Election/Group");
const User = require("../../models/User/User");

// ========================== Election ==========================

// Voting for election
exports.vote_for_election = async (req, res) => {
    const {election_id, group_id} = req?.body;
    const {email: user_email, voting_status} = req?.user_details;
    console.log("====18====",{election_body: req?.body, user_email, voting_status});
    try{
        const election = await Election.findOne({election_id, status: "active"});
        if(!election){
            return res.status(404).json({
                status: false,
                message: "Election not found",
            })
        }
        if(voting_status){
            return res.status(400).json({
                status: false,
                message: "You have already voted for this election!!!",
            });
        }
        const group = await ElectionGroup.findOne({group_id});
        if(!group){
            return res.status(404).json({
                status: false,
                message: "Group not found",
            })
        }
        const update_user = await User.findOneAndUpdate(
            {email: user_email}, 
            {election_id, group_id, voting_status: true}, 
            {returnOriginal: false}
        );
        if(update_user){
            const update_group = await ElectionGroup.findOneAndUpdate(
                {group_id}, 
                {$inc: {votes: 1}}, 
                {returnOriginal: false}
            );
            
            if(update_group){
                const user_res = await User.findOne({email: user_email})
                                .select("-password -__v -_id -createdAt -updatedAt -remember_token");

                    console.log({user_res});
                    return res.status(200).json({
                    status: true,
                    message: "You have successfully voted for this election!!!",
                    data: user_res,
                });
            }
        }


    } catch(err){
        console.log(err);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
}


// Admin create election
exports.create_election = async (req, res) => {
    const { title, description, status, candidates, election_id } = req?.body;
    console.log({ title, description, candidates, status, election_id });
    const user_email = req?.user?.email;

    try {
        const newElection = new Election({
            title,
            description,
            status,
            candidates,
            election_id,
            user_email,
        });

        const election = await newElection.save();
        return res.status(200).json({
            status: true,
            message: "Election created successfully!!!",
            data: election,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error?.message || "Server error",
        });
    }
};

// get all elections
exports.get_all_elections = async (req, res) => {
    try {
        // pipeline match for candidates array with group_ids in election groups
        const pipeline = [ 
            {
                $lookup: {
                    from: "electiongroups",
                    localField: "candidates",
                    foreignField: "group_id",
                    as: "candidates"
                },
            },
            { $unwind: "$candidates" },
            {
                $group: {
                    _id: "$election_id",
                    candidates: { $push: "$candidates" },
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    status: { $first: "$status" },
                    election_id: { $first: "$election_id" },
                    user_email: { $first: "$user_email" },
                }
            },
            // group_name and group_id push in candidates array
            {
                $project: {
                    _id: 0,
                    title: 1,
                    description: 1,
                    status: 1,
                    candidates: {
                        $map: {
                            input: "$candidates",
                            as: "candidate",
                            in: {
                                group_name: "$$candidate.title",
                                group_id: "$$candidate.group_id",
                                votes: "$$candidate.votes",
                                group_description: "$$candidate.description",
                            }
                        }
                    },
                    election_id: 1,
                    user_email: 1,
                }
            },
        ];
          

        const election_res = await Election.aggregate(pipeline);
        // console.log({election_res});
                    
        // const elections = await Election.find();
        return res.status(200).json({
            status: true,
            message: "Elections are found successfully!!!",
            data: election_res,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error?.message || "Server error",
        });
    }
};

// get all active election groups
exports.get_all_active_elections = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    status: "active",
                }
            },
            {
                $lookup: {
                    from: "electiongroups",
                    localField: "candidates",
                    foreignField: "group_id",
                    as: "candidates"
                },
            },
            { $unwind: "$candidates" },
            {
                $group: {
                    _id: "$election_id",
                    candidates: { $push: "$candidates" },
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    status: { $first: "$status" },
                    election_id: { $first: "$election_id" },
                    user_email: { $first: "$user_email" },
                }
            },
            // group_name and group_id push in candidates array
            {
                $project: {
                    _id: 0,
                    title: 1,
                    description: 1,
                    status: 1,
                    candidates: {
                        $map: {
                            input: "$candidates",
                            as: "candidate",
                            in: {
                                group_name: "$$candidate.title",
                                group_id: "$$candidate.group_id",
                                votes: "$$candidate.votes",
                                group_description: "$$candidate.description",
                            }
                        }
                    },
                    election_id: 1,
                    user_email: 1,
                }
            },
        ];
        const election_res = await Election.aggregate(pipeline);

        // const election_groups = await ElectionGroup.find({status: "active"});
        return res.status(200).json({
            status: true,
            message: "Active election groups are found successfully!!!",
            data: election_res,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error?.message || "Server error",
        });
    }
};

// Admin update election
exports.update_election = async (req, res) => {
    const { body: election_body, files } = req;
    const user_email = req?.user?.email;
    const { election_id: e_id } = election_body;
    const { id: p_e_id } = req?.params;
    console.log({p_e_id});
    const election_id = e_id || p_e_id;
    console.log({election_body, election_id});
    try {
        const election = await Election.findOne({ election_id });
        if(election){
            if(election?.user_email === user_email){
                let img_folder = user_email;
                const random_val = Number(new Date());
                const img_name = `election-${random_val}`;
                // const prev_avatar = req?.user?.avatar;
                const img_file = files?.image || files?.img || files?.uploadedImg || files?.avatar;
                if(files){
                    const root_url = process.env.DEV_URL || process.env.PROD_URL;
                    img_path = `${root_url}/api/static/${img_folder}/${img_name}.png`;
                    // console.log({img_path});
                    election_body.logo = img_path;
                }
                election_body.user_email = user_email;
                // election_body.election_id = "election-"+random_val;
                const result = await Election.updateOne({ election_id }, election_body);
                console.log({result});
                if(result){
                    if(files){
                        let root_path = "/" + img_folder;
                        const image_url = await uploadFile(root_path, img_file, img_name, election?.logo);
                        console.log({image_url});
                        // if(!fs.existsSync(appRoot+"/uploads")){
                        //     fs.mkdirSync(appRoot+"/uploads");
                        // }
                        // const uploadedFile = files?.uploadedImg || files?.avatar;
                        // if(!fs.existsSync(appRoot+root_path)){
                        //     fs.mkdirSync(appRoot+root_path);
                        // }
                        // root_path += "/" + img_name;
                        // // console.log({root_path});
                        // const uploadPath = appRoot + root_path;
                        // await uploadedFile.mv(uploadPath);
                    }
                    const updated_election = await Election.findOne({ election_id });
                    // console.log({updated_user});
                    return res.status(200).json({
                        status: true,
                        message: "Election is updated!!!",
                        data: updated_election,
                    });

                }
                return res.status(500).json({
                    status: false,
                    message: "Election isn't updated!!!"
                });
            }
            return res.status(403).json({
                status: false,
                message: "You are not authorized to update this election!!!"
            });
        }
        return res.status(404).json({
            status: false,
            message: "Election is not found!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(403).json({
            status: false,
            message: "Election isn't updated!!!"
        });
    }
}

// Admin delete election
exports.delete_election = async (req, res) => {
    const { election_id: e_id } = req?.params;
    const election_id = e_id;
    const user_email = req?.user?.email;
    try {
        const election = await Election.findOne({ election_id });
        if(election){
            if(election?.user_email === user_email){
                const result = await Election.deleteOne({ election_id });
                if(result){
                    return res.status(200).json({
                        status: true,
                        message: "Election is deleted!!!",
                    });
                }
                return res.status(500).json({
                    status: false,
                    message: "Election isn't deleted!!!"
                });
            }
            return res.status(403).json({
                status: false,
                message: "You are not authorized to delete this election!!!"
            });
        }
        return res.status(404).json({
            status: false,
            message: "Election is not found!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(403).json({
            status: false,
            message: "Election isn't deleted!!!"
        });
    }
}

// Admin bulk update election group
exports.bulk_update_elections = async (req, res) => {
    const {body: election_body} = req;
    console.log({election_body});
    const {status, election_ids} = election_body;
    try {
        const result = await Election.updateMany({election_id: {$in: election_ids}}, {status});
        // const updated_elections = await Election.find({}).sort({created_at: -1});
        // console.log({updated_elections});
        // const result = await ElectionGroup.updateMany({}, election_body);
        // console.log("====",{result});
        if(result){
            return res.status(200).json({
                status: true,
                message: "Elections are updated!!!",
                // data: groups,
            });

        }
        return res.status(500).json({
            status: false,
            message: "Elections aren't updated!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(404).json({
            status: false,
            message: "Elections aren't updated!!!"
        });
    }
}



// ======================= Election Group =======================
// Admin create election group
exports.create_election_group = async (req, res) => {
    const {body: group_body, files} = req;
    console.log({group_body});
    const user_email = req?.user?.email;
    try {
        let img_folder = user_email;
        const random_val = Number(new Date());
        const img_name = `group-${random_val}`;
        // const prev_avatar = req?.user?.avatar;
        const img_file = files?.image || files?.img || files?.uploadedImg || files?.avatar;
        if(files){
            const root_url = process.env.DEV_URL || process.env.PROD_URL;
            img_path = `${root_url}/api/static/${img_folder}/${img_name}.png`;
            // console.log({img_path});
            group_body.logo = img_path;
        }
        group_body.user_email = user_email;
        group_body.group_id = "group-"+random_val;
        const result = await ElectionGroup.create(group_body);
        console.log({result});
        if(result){
            if(files){
                let root_path = "/" + img_folder;
                const image_url = await uploadFile(root_path, img_file, img_name, result?.logo);
                console.log({image_url});
                // if(!fs.existsSync(appRoot+"/uploads")){
                //     fs.mkdirSync(appRoot+"/uploads");
                // }
                // const uploadedFile = files?.uploadedImg || files?.avatar;
                // if(!fs.existsSync(appRoot+root_path)){
                //     fs.mkdirSync(appRoot+root_path);
                // }
                // root_path += "/" + img_name;
                // // console.log({root_path});
                // const uploadPath = appRoot + root_path;
                // await uploadedFile.mv(uploadPath);
            }
            const updated_group = await ElectionGroup.findOne({_id: result?._id});
            // console.log({updated_user});
            return res.status(201).json({
                status: true,
                message: "Election Group is created!!!",
                data: updated_group,
            });

        }
        return res.status(500).json({
            status: false,
            message: "Election Group isn't created!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(403).json({
            status: false,
            message: "Election Group isn't created!!!"
        });
    }
}

// Admin update election group
exports.update_election_group = async (req, res) => {
    const {body: group_body, files} = req;
    const {group_id} = req?.params;
    console.log({group_body, group_id});
    const user_email = req?.user?.email;
    try {
        let img_folder = user_email;
        const random_val = Number(new Date());
        const img_name = `group-${random_val}`;
        // const prev_avatar = req?.user?.avatar;
        const img_file = files?.image || files?.img || files?.uploadedImg || files?.avatar;
        if(files){
            const root_url = process.env.DEV_URL || process.env.PROD_URL;
            img_path = `${root_url}/api/static/${img_folder}/${img_name}.png`;
            // console.log({img_path});
            group_body.logo = img_path;
        }
        group_body.user_email = user_email;
        const result = await ElectionGroup.updateOne({group_id}, group_body);
        console.log({result});
        if(result){
            if(files){
                let root_path = "/" + img_folder;
                const image_url = await uploadFile(root_path, img_file, img_name, result?.logo);
                console.log({image_url});
                // if(!fs.existsSync(appRoot+"/uploads")){
                //     fs.mkdirSync(appRoot+"/uploads");
                // }
                // const uploadedFile = files?.uploadedImg || files?.avatar;
                // if(!fs.existsSync(appRoot+root_path)){
                //     fs.mkdirSync(appRoot+root_path);
                // }
                // root_path += "/" + img_name;
                // // console.log({root_path});
                // const uploadPath = appRoot + root_path;
                // await uploadedFile.mv(uploadPath);
            }
            const updated_group = await ElectionGroup.findOne({_id: group_body?._id});
            // console.log({updated_user});
            return res.status(200).json({
                status: true,
                message: "Election Group is updated!!!",
                data: updated_group,
            });

        }
        return res.status(500).json({
            status: false,
            message: "Election Group isn't updated!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(404).json({
            status: false,
            message: "Election Group isn't updated!!!"
        });
    }
}

// Admin delete election group
exports.delete_election_group = async (req, res) => {
    const {body: group_body} = req;
    console.log({group_body});
    const user_email = req?.user?.email;
    try {
        const result = await ElectionGroup.deleteOne({_id: group_body?.group_id});
        console.log({result});
        if(result){
            return res.status(201).json({
                status: true,
                message: "Election Group is deleted!!!",
                data: result,
            });

        }
        return res.status(500).json({
            status: false,
            message: "Election Group isn't deleted!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(404).json({
            status: false,
            message: "Election Group isn't deleted!!!"
        });
    }
}

// Admin get all election groups
exports.get_all_election_groups = async (req, res) => {
    try {
        const result = await ElectionGroup.find({});
        // console.log({result});
        if(result){
            return res.status(200).json({
                status: true,
                message: "Election Groups are found!!!",
                data: result,
            });

        }
        return res.status(404).json({
            status: false,
            message: "Election Groups aren't found!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(404).json({
            status: false,
            message: "Election Groups aren't found!!!"
        });
    }
}

// Active election groups
exports.active_election_groups = async (req, res) => {
    try {
        const result = await ElectionGroup.find({status: "active"});
        // console.log({result});
        if(result){
            return res.status(200).json({
                status: true,
                message: "Election Groups are found!!!",
                data: result,
            });
        }
        return res.status(404).json({
            status: false,
            message: "Election Groups aren't found!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(404).json({
            status: false,
            message: "Election Groups aren't found!!!"
        });
    }
}


// Admin bulk update election group
exports.bulk_update_election_groups = async (req, res) => {
    const {body: group_body} = req;
    // console.log({group_body});
    const {status, group_ids} = group_body;
    try {
        const result = await ElectionGroup.updateMany({group_id: {$in: group_ids}}, {status});

        if(result){
            // const groups = await ElectionGroup.find({});
            // console.log({groups});
            return res.status(200).json({
                status: true,
                message: "Election Groups are updated!!!",
                // data: groups,
            });

        }
        return res.status(500).json({
            status: false,
            message: "Election Groups aren't updated!!!"
        });
    } catch (error) {
        console.log({error});
        return res.status(404).json({
            status: false,
            message: "Election Groups aren't updated!!!"
        });
    }
}