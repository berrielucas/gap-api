const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");
const Process = require("../models/Process");

const router = express.Router();
router.use(authBodyMiddleware);


router.get('/listAllProcess', async (req, res)=>{
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    const process = await Process.find();
    const permittedProcesses = process.filter(p => 
        user.process.some(up => up.id === p.id)
    );
    res.status(200).send({ success: true, data: permittedProcesses });
});

router.post("/createProcess", async (req, res) => {
    const processData = req.body;
    try {
        processData.createdBy = {
            userId: req.userId
        };
        const process = await Process.create(processData);
        await User.updateOne({ _id: req.userId }, { $push: { process: {id:process.id} } });
        await assignProcesses(process.id);
        return res.send({ success: true, dados: process });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao criar processo", message: error.message });
    }
});

router.delete("/deleteProcess", async (req, res) => {
    const { processId } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user.process.filter(p=>p.id===processId).length===0) {
            return res.status(401).send({ success: false, error: "Processo sem permissão" });
        }
        const process = await Process.findByIdAndDelete(processId);
        await removeAssignProcesses(process.id);
        return res.send({ success: true, dados: process });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao excluir processo", message: error.message });
    }
});

router.put("/updateProcess", async (req, res) => {
    const { processId, dataProcess } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user.process.filter(p=>p.id===processId).length===0) {
            return res.status(401).send({ success: false, error: "Processo sem permissão" });
        }
        await Process.updateOne({ _id: processId }, dataProcess);
        const process = await Process.findById(processId);
        return res.send({ success: true, dados: process });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao atualizar processo", message: error.message });
    }
});

async function assignProcesses(processId) {
    const users = await User.find({assignProcesses:true});
    users.forEach(async u => {
        await User.updateOne({ _id: u.id }, { $addToSet: { process: {id:processId} } })
    });
}

async function removeAssignProcesses(processId) {
    const users = await User.find();
    users.forEach(async u => {
        await User.updateOne({ _id: u.id }, { $pull: { process: { id: processId } } })
    });
}

module.exports = (app) => app.use("/Process", router);