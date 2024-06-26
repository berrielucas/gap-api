const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");
const Followup = require("../models/Followup");
const Task = require("../models/Task");

const router = express.Router();
router.use(authBodyMiddleware);


router.post('/listAllFollowup', async (req, res)=>{
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    const followup = await Followup.find();
    const permittedFollowup = followup.filter(f => 
        user.followup.some(uf => uf.id === f.id)
    );
    res.status(200).send({ success: true, data: permittedFollowup });
});

router.post('/listAllTasks', async (req, res)=>{
    const user = await User.findById(req.userId);
    const { followupId } = req.body;
    if (!user) {
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    if (!followupId) {
        return res.status(400).send({ success: false, error:'Campo `followupId` não pode está vazio' });
    }
    try {
        const followup = await Followup.findOne({ _id: followupId });
        if (!followup) {
            return res.status(400).send({ success: false, error:'Seguimento não encontrado' });
        }
        if (user.followup.filter(f=>f.id===followupId).length===0) {
            return res.status(401).send({ success: false, error: "Seguimento sem permissão" });
        }
        const tasks = await Task.find({ followup_id: followupId });
        res.status(200).send({ success: true, data: tasks });
    } catch (error) {
        return res.status(400).send({ success: false, error:'Erro ao listar tarefas', message: error.message });
    }
});

router.post("/createFollowup", async (req, res) => {
    const followupData = req.body;
    try {
        followupData.createdBy = {
            userId: req.userId
        };
        const followup = await Followup.create(followupData);
        await User.updateOne({ _id: req.userId }, { $push: { followup: {id:followup.id} } });
        await assignFollowup(followup.id);
        return res.send({ success: true, data: followup });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao criar seguimento", message: error.message });
    }
});

router.delete("/deleteFollowup", async (req, res) => {
    const { followupId } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user.followup.filter(f=>f.id===followupId).length===0) {
            return res.status(401).send({ success: false, error: "Seguimento sem permissão" });
        }
        const followup = await Followup.findByIdAndDelete(followupId);
        await removeAssignFollowup(followup.id);
        return res.send({ success: true, data: followup });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao excluir seguimento", message: error.message });
    }
});

router.put("/updateFollowup", async (req, res) => {
    const { followupId, dataFollowup } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user.followup.filter(f=>f.id===followupId).length===0) {
            return res.status(401).send({ success: false, error: "Seguimento sem permissão" });
        }
        await Followup.updateOne({ _id: followupId }, dataFollowup);
        const followup = await Followup.findById(followupId);
        return res.send({ success: true, data: followup });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao atualizar seguimento", message: error.message });
    }
});

async function assignFollowup(followupId) {
    const users = await User.find({assignFollowup:true});
    users.forEach(async u => {
        await User.updateOne({ _id: u.id }, { $addToSet: { followup: {id: followupId} } })
    });
}

async function removeAssignFollowup(followupId) {
    const users = await User.find();
    users.forEach(async u => {
        await User.updateOne({ _id: u.id }, { $pull: { followup: { id: followupId } } })
    });
}

module.exports = (app) => app.use("/Followup", router);