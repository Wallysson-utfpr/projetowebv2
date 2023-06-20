const amqp = require("amqplib");
const Moeda = require("../models/Moeda");
const connectDatabase = require("../database/db"); // Adicione esta linha

const processarTarefa = async (tarefa) => {
  try {
    const moeda = new Moeda(tarefa);
    await moeda.save();
    console.log("Tarefa processada e salva no banco de dados:", tarefa);
  } catch (error) {
    console.error("Erro ao processar a tarefa:", error);
    throw error;
  }
};

const iniciarConsumidor = async (queueName = "fila_de_moedas") => {
  try {
    connectDatabase();

    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(queueName, (message) => {
      console.log("Mensagem recebida da fila:", message.content.toString());
      const tarefa = JSON.parse(message.content.toString());
      processarTarefa(tarefa);
      channel.ack(message);
    });

    console.log(`Iniciando a consumir mensagens da fila ${queueName}.`);
  } catch (error) {
    console.error("Erro ao iniciar o consumidor:", error);
    throw error;
  }
};

// Iniciar o consumidor
iniciarConsumidor();
