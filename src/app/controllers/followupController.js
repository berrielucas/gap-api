const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");
const Followup = require("../models/Followup");
const Task = require("../models/Task");
const Environment = require("../models/Environment");

// Route configuration with middleware - `tokenUser` parameter required for authentication
// Configuração da rota com o middleware - necessário o parâmetro `tokenUser` para autenticação
const router = express.Router();
router.use(authBodyMiddleware);


router.post('/listAllFollowup', async (req, res)=>{
    const user = await User.findById(req.userId);
    const { envId } = req.body;
    if (!user) {
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    if (!envId) {
        return res.status(400).send({ success: false, error:'Campo `envId` não pode está vazio' });
    }
    const environment = await Environment.findById(envId);
    if (!environment) {
        return res.status(400).send({ success: false, error:'Ambiente não encontrado' });
    }
    if (!environment.active) {
        return res.status(400).send({ success: false, error:'Ambiente desativado' });
    }
    const followup = await Followup.find({ environment_id: environment._id});
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
    const { environment_id } = req.body;
    try {
        if (!environment_id) {
            return res.status(400).send({ success: false, error:'Campo `environment_id` não pode está vazio' });
        }
        const user = await User.findById(req.userId);
        if (!user.environment.filter(e=>e.id===environment_id)[0].permissions.includes("create-followup")) {
            return res.status(400).send({ success: false, error: "Sem permissão para criar seguimento" });
        }
        followupData.createdBy = {
            userId: req.userId
        };
        const followup = await Followup.create(followupData);
        await User.updateOne({ _id: req.userId }, { $push: { followup: {id:followup.id, permissions: ["create-task","edit-task","delete-task","view-all-task","add-users"]} } });
        await assignFollowup(followup.id, environment_id, []);
        return res.send({ success: true, data: followup });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao criar seguimento", message: error.message });
    }
});

router.delete("/deleteFollowup", async (req, res) => {
    const { followupId, environment_id } = req.body;
    try {
        if (!followupId) {
            return res.status(400).send({ success: false, error:'Campo `followupId` não pode está vazio' });
        }
        if (!environment_id) {
            return res.status(400).send({ success: false, error:'Campo `environment_id` não pode está vazio' });
        }
        const user = await User.findById(req.userId);
        if (user.followup.filter(f=>f.id===followupId).length===0) {
            return res.status(401).send({ success: false, error: "Seguimento sem permissão" });
        }
        if (!user.environment.filter(e=>e.id===environment_id)[0].permissions.includes("delete-followup")) {
            return res.status(400).send({ success: false, error: "Sem permissão para excluir seguimento" });
        }
        const followup = await Followup.findByIdAndDelete(followupId);
        await removeAssignFollowup(followupId);
        return res.send({ success: true, data: followup });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao excluir seguimento", message: error.message });
    }
});

router.put("/updateFollowup", async (req, res) => {
    const { followupId, dataFollowup, environment_id } = req.body;
    try {
        if (!followupId) {
            return res.status(400).send({ success: false, error:'Campo `followupId` não pode está vazio' });
        }
        if (!environment_id) {
            return res.status(400).send({ success: false, error:'Campo `environment_id` não pode está vazio' });
        }
        const user = await User.findById(req.userId);
        if (user.followup.filter(f=>f.id===followupId).length===0) {
            return res.status(401).send({ success: false, error: "Seguimento sem permissão" });
        }
        if (!user.environment.filter(e=>e.id===environment_id)[0].permissions.includes("edit-followup")) {
            return res.status(400).send({ success: false, error: "Sem permissão para editar seguimento" });
        }
        await Followup.updateOne({ _id: followupId }, dataFollowup);
        const followup = await Followup.findById(followupId);
        return res.send({ success: true, data: followup });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao atualizar seguimento", message: error.message });
    }
});

async function assignFollowup(followupId, envId, permissions) {
    const users = await User.find();
    const permittedUsers = users.filter(u=>u.environment.some(e=>e.id===envId&&e.assignFollowup===true));
    permittedUsers.forEach(async u => {
        if (u.followup.filter(f=>f.id===followupId).length===0) {
            await User.updateOne({ _id: u.id }, { $addToSet: { followup: {id: followupId, permissions: permissions} } })
        }
    });
}

async function removeAssignFollowup(followupId) {
    const users = await User.find();
    users.forEach(async u => {
        // await User.updateOne({ _id: u.id }, { $pull: { followup: { id: followupId } } })
        const followup = u.followup.filter(f => f.id === followupId);
        if (followup.length>0) {
            await User.updateOne({ _id: u.id }, { $pullAll: { followup: followup } })
        }
    });
}

module.exports = (app) => app.use("/Followup", router);