const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");
const Environment = require("../models/Environment");

const router = express.Router();
router.use(authBodyMiddleware);


router.post('/listAllEnvironment', async (req, res)=>{
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    const environment = await Environment.find();
    const permittedEnvironments = environment.filter(e => 
        user.environment.some(ue => ue.id === e.id)
    );
    res.status(200).send({ success: true, data: permittedEnvironments });
});

router.post("/createEnvironment", async (req, res) => {
    const environmentData = req.body;
    const uri = environmentData.url
    const user = await User.findById(req.userId).select("+fullUser");
    try {
        // if (!user.fullUser) {
        //     return res.status(401).send({ success: false, error: "Sem permissão, solicite ao Administrador responsável" });
        // }
        if (await Environment.findOne({ uri })) {
            return res.status(400).send({ success: false, error: "Url indisponível" });
        }
        environmentData.createdBy = {
            userId: req.userId
        };
        const environment = await Environment.create(environmentData);
        await User.updateOne({ _id: req.userId }, { $push: { environment: {id:environment.id, assignFollowup: true, permissions: ["create-followup","edit-followup","delete-followup", "view-all-followup", "full-user"]} } });
        return res.send({ success: true, data: environment });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao criar ambiente", message: error.message });
    }
});

router.delete("/deleteEnvironment", async (req, res) => {
    const { environmentId } = req.body;
    try {
        const user = await User.findById(req.userId).select("+fullUser");
        // if (!user.fullUser) {
        //     return res.status(401).send({ success: false, error: "Sem permissão, solicite ao Administrador responsável" });
        // }
        if (user.environment.filter(e=>e.id===environmentId).length===0) {
            return res.status(401).send({ success: false, error: "Ambiente sem permissão" });
        }
        const environment = await Environment.findByIdAndDelete(environmentId);
        await removeAssignEnvironments(environmentId);
        return res.send({ success: true, data: environment });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao excluir ambiente", message: error.message });
    }
});

router.put("/updateEnvironment", async (req, res) => {
    const { environmentId, dataEnvironment } = req.body;
    try {
        const user = await User.findById(req.userId).select("+fullUser");
        // if (!user.fullUser) {
        //     return res.status(401).send({ success: false, error: "Sem permissão, solicite ao Administrador responsável" });
        // }
        if (user.environment.filter(e=>e.id===environmentId).length===0) {
            return res.status(401).send({ success: false, error: "Ambiente sem permissão" });
        }
        await Environment.updateOne({ _id: environmentId }, dataEnvironment);
        const environment = await Environment.findById(environmentId);
        return res.send({ success: true, data: environment });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao atualizar ambiente", message: error.message });
    }
});

async function removeAssignEnvironments(environmentId) {
    const users = await User.find();
    users.forEach(async u => {
        const environment = u.environment.filter(e => e.id === environmentId);
        if (environment.length>0) {
            await User.updateOne({ _id: u.id }, { $pullAll: { environment: environment } })
        }
    });
}

module.exports = (app) => app.use("/Environment", router);