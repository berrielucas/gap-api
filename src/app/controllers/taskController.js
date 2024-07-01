const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");
const Task = require("../models/Task");
const Followup = require("../models/Followup");


// Route configuration with middleware - `tokenUser` parameter required for authentication
// Configuração da rota com o middleware - necessário o parâmetro `tokenUser` para autenticação
const router = express.Router();
router.use(authBodyMiddleware);


// Method to list all tasks
// Método para listar todas as tasks
router.post('/listAllTasks', async (req, res)=>{
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).send({ success: false, error:'Unauthorized' }); 
        }
        const tasks = await Task.find();
        res.status(200).send({ success: true, data: tasks });
    } catch (error) {
        return res.status(400).send({ success: false, error:'Erro ao listar tarefas', message: error.message });
    }
});


// Method for creating task
// Método para criar task
router.post("/createTask", async (req, res) => {
    const taskData = req.body;
    const { followup_id } = req.body;
    try {
        if (!followup_id) {
            return res.status(400).send({ success: false, error:'Campo `followup_id` não pode está vazio' });
        }
        const user = await User.findById(req.userId);
        if (!user.followup.filter(f=>f.id===followup_id)[0].permissions.includes("create-task")) {
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


// Method to delete task
// Método para excluir task
router.delete("/deleteTask", async (req, res) => {
    const { taskId, followup_id } = req.body;
    try {
        if (!followup_id) {
            return res.status(400).send({ success: false, error:'Campo `followup_id` não pode está vazio' });
        }
        const user = await User.findById(req.userId);
        if (!user.followup.filter(f=>f.id===followup_id)[0].permissions.includes("delete-task")) {
            return res.status(400).send({ success: false, error: "Sem permissão para excluir tarefa" });
        }
        const task = await Task.findByIdAndDelete(taskId);
        return res.send({ success: true, data: task });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao excluir tarefa", message: error.message });
    }
});


// Method for updating task
// Método para atualizar task
router.put("/updateTask", async (req, res) => {
    const { taskId, dataTask, followup_id } = req.body;
    try {
        if (!followup_id) {
            return res.status(400).send({ success: false, error:'Campo `followup_id` não pode está vazio' });
        }
        const user = await User.findById(req.userId);
        if (!user.followup.filter(f=>f.id===followup_id)[0].permissions.includes("edit-task")) {
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


// Method for updating the task step
// Método para atualizar a etapa da task
router.put("/updatePhaseTask", async (req, res) => {
    const { taskId, dataTask } = req.body;
    try {
        if (!taskId) {
            return res.status(400).send({ success: false, error:'Campo `taskId` não pode está vazio' });
        }
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).send({ success: false, error: "Sem permissão para editar tarefa" });
        }
        await Task.updateOne({ _id: taskId }, dataTask);
        const task = await Task.findById(taskId);
        return res.send({ success: true, data: task });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ success: false, error: "Erro ao editar tarefa", message: error.message });
    }
});


module.exports = (app) => app.use("/Task", router);