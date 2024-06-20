const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");
const Task = require("../models/Task");
const Process = require("../models/Process");

const router = express.Router();
router.use(authBodyMiddleware);

router.get('/listAllTasks', async (req, res)=>{
    const user = await User.findById(req.userId);
    const { processId } = req.body;
    if (!user) {
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    if (!processId) {
        return res.status(400).send({ success: false, error:'Campo `processId` não pode está vazio' });
    }
    const process = await Process.findById(processId);
    if (!process) {
        return res.status(400).send({ success: false, error:'Processo não encontrado' });
    }
    const tasks = Task.find({ process_id: processId });
    res.status(200).send({ success: true, data: tasks });
});

router.post("/createTask", async (req, res) => {
    const taskData = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user.permissions.includes("create-task")) {
            return res.status(400).send({ success: false, error: "Sem permissão para criar tarefa" });
        }
        taskData.createdBy = {
            userId: req.userId
        };
        const task = await Task.create(taskData);
        return res.send({ success: true, data: task });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao criar tarefa", message: error.message });
    }
});

router.delete("/deleteTask", async (req, res) => {
    const { taskId } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user.permissions.includes("delete-task")) {
            return res.status(400).send({ success: false, error: "Sem permissão para excluir tarefa" });
        }
        const task = await Task.findByIdAndDelete(taskId);
        return res.send({ success: true, data: task });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao excluir tarefa", message: error.message });
    }
});

router.put("/updateTask", async (req, res) => {
    const { taskId, dataTask } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user.permissions.includes("edit-task")) {
            return res.status(400).send({ success: false, error: "Sem permissão para editar tarefa" });
        }
        await Task.updateOne({ _id: taskId }, dataTask);
        const task = await Task.findById(taskId);
        return res.send({ success: true, dados: task });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao editar tarefa", message: error.message });
    }
});

module.exports = (app) => app.use("/Process", router);