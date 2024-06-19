const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");
const Environment = require("../models/Environment");

const router = express.Router();
router.use(authBodyMiddleware);


router.get('/listAllEnvironment', async (req, res)=>{
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
    const user = await User.findById(req.userId).select("+fullUser");
    try {
        if (!user.fullUser) {
            return res.status(401).send({ success: false, error: "Sem permissão, solicite ao Administrador responsável" });
        }
        environmentData.createdBy = {
            userId: req.userId
        };
        const environment = await Environment.create(environmentData);
        await User.updateOne({ _id: req.userId }, { $push: { environment: {id:environment.id} } });
        return res.send({ success: true, dados: environment });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao criar ambiente", message: error.message });
    }
});

router.delete("/deleteEnvironment", async (req, res) => {
    const { environmentId } = req.body;
    try {
        const user = await User.findById(req.userId).select("+fullUser");
        if (!user.fullUser) {
            return res.status(401).send({ success: false, error: "Sem permissão, solicite ao Administrador responsável" });
        }
        if (user.environment.filter(e=>e.id===environmentId).length===0) {
            return res.status(401).send({ success: false, error: "Ambiente sem permissão" });
        }
        const environment = await Environment.findByIdAndDelete(environmentId);
        await removeAssignEnvironments(environment.id);
        return res.send({ success: true, dados: environment });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao excluir ambiente", message: error.message });
    }
});

router.put("/updateEnvironment", async (req, res) => {
    const { environmentId, dataEnvironment } = req.body;
    try {
        const user = await User.findById(req.userId).select("+fullUser");
        if (!user.fullUser) {
            return res.status(401).send({ success: false, error: "Sem permissão, solicite ao Administrador responsável" });
        }
        if (user.environment.filter(e=>e.id===environmentId).length===0) {
            return res.status(401).send({ success: false, error: "Ambiente sem permissão" });
        }
        await Environment.updateOne({ _id: environmentId }, dataEnvironment);
        const environment = await Environment.findById(environmentId);
        return res.send({ success: true, dados: environment });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao atualizar ambiente", message: error.message });
    }
});

// async function assignEnvironments(processId) {
//     const users = await User.find({assignProcesses:true});
//     users.forEach(async u => {
//         await User.updateOne({ _id: u.id }, { $addToSet: { process: {id:processId} } })
//     });
// }

async function removeAssignEnvironments(environmentId) {
    const users = await User.find();
    users.forEach(async u => {
        const environment = u.environment.filter(e => e.id === environmentId);
        if (environment.length>0) {
            await User.updateOne({ _id: u.id }, { $pull: { environment: environment[0] } })
        }
    });
}

module.exports = (app) => app.use("/Environment", router);