const WebSocket = require("ws");
const auth = require("./auth");

// Importando os models
const Task = require("../app/models/Task");
const Followup = require("../app/models/Followup");
const Environment = require("../app/models/Environment");
const User = require("../app/models/User");
const Comment = require("../app/models/Comment");

let connections = [];

// Functions

async function createTask(payload, ws) {
  const { taskData, followupId } = payload;
  const user = connections.filter(c=>c.wss===ws)[0].user;
  if (user.followup.filter(f=>f.id===followupId)[0].permissions.includes('create-task')) {
    taskData.createdBy = {
        userId: user._id
    };
    const task = await Task.create(taskData);
    await Followup.updateOne({ _id: followupId }, { $inc: { "countTasks": 1 } });
    connections.forEach(con => {
      if (con.user.followup.filter(f=>f.id===followupId).length>0) {
        con.wss.send(JSON.stringify({
          action: "receive-new-task",
          followup: followupId,
          task: task,
          success: true
        }))
      }
    });
  }
}

async function deleteTask(payload, ws) {
  const { taskId, followupId } = payload;
  const user = connections.filter(c=>c.wss===ws)[0].user;
  if (user.followup.filter(f=>f.id===followupId)[0].permissions.includes('delete-task')) {
    const task = await Task.findByIdAndDelete(taskId);
    await Followup.updateOne({ _id: followupId }, { $inc: { "countTasks": -1 } });
    connections.forEach(con => {
      if (con.user.followup.filter(f=>f.id===followupId).length>0) {
        con.wss.send(JSON.stringify({
          action: "receive-deleted-task",
          followup: followupId,
          task: task,
          success: true
        }))
      }
    });
  }
}

async function updateTask(payload, ws) {
  const { taskId, dataTask, followupId } = payload;
  const user = connections.filter(c=>c.wss===ws)[0].user;
  if (user.followup.filter(f=>f.id===followupId)[0].permissions.includes('edit-task')) {
    await Task.updateOne({ _id: taskId }, dataTask);
    const task = await Task.findById(taskId);
    connections.forEach(con => {
      if (con.user.followup.filter(f=>f.id===followupId).length>0) {
        con.wss.send(JSON.stringify({
          action: "receive-updated-task",
          followup: followupId,
          task: task,
          success: true
        }))
      }
    });
  }
}



module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on("connection", async (ws) => {
    ws.send(
      JSON.stringify({
        success: true,
        action: "Conected",
      })
    );

    ws.on("message", async (event) => {
      const payload = JSON.parse(event.toString());

      switch (payload.action) {

        //  Conexão
        case "connect":
          const conexao = {
            wss: ws,
            user: payload.user,
          };
          if (!connections.includes(conexao)) {
            connections.push(conexao);
          }
          break;
        
        // Tasks actions
        case "create-task":
          await createTask(payload, ws);
          break;

        case "delete-task":
          await deleteTask(payload, ws);
          break;

        case "update-task":
          await updateTask(payload, ws);
          break;

        default:
          break;
      }
    });


    // Desconexão / Close
    ws.on("close", function () {
      connections =
        connections.length === 1 ? [] : connections.filter((c) => c.wss !== ws);
      ws.send(
        JSON.stringify({
          success: true,
          action: "Disconnected",
        })
      );
    });


    // Error
    ws.on("error", function (error) {
      console.log("Connection Error: " + error.toString());
    });
    
  });

  return wss;
};
