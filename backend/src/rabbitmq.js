const amqp = require("amqplib");
const Moeda = require("./models/Moeda");

//Conectar-se ao servidor RabbitMQ
//e criar um canal de mensagens.
const connect = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    console.error("Erro ao conectar-se ao RabbitMQ:", error);
    throw error;
  }
};

//Criar uma fila no RabbitMQ.
const assertQueue = async (channel, queueName) => {
  try {
    await channel.assertQueue(queueName, { durable: true });
    console.log(`Fila ${queueName} criada com sucesso.`);
  } catch (error) {
    console.error(`Erro ao criar a fila ${queueName}:`, error);
    throw error;
  }
};

//Processar uma tarefa, salvando os dados de uma
//moeda no banco de dados.
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

//Enviar uma tarefa para a fila do RabbitMQ.
const enviarTarefaParaFila = async (tarefa, queueName = "fila_de_moedas") => {
  try {
    const { connection, channel } = await connect();

    if (!connection) {
      throw new Error("Falha ao estabelecer conexão com o RabbitMQ");
    }

    if (!channel) {
      throw new Error("Falha ao criar canal no RabbitMQ");
    }

    await assertQueue(channel, queueName);

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(tarefa)));

    console.log(`Tarefa enviada para a fila ${queueName}:`, tarefa);
  } catch (error) {
    console.error("Erro ao enviar a tarefa para a fila:", error);
    throw error;
  }
};

//Iniciar o consumidor, que ficará escutando a fila de tarefas e processando-as conforme elas chegam.
const iniciarConsumidor = async (queueName = "fila_de_moedas") => {
  try {
    const { connection, channel } = await connect();

    if (!connection) {
      throw new Error("Falha ao estabelecer conexão com o RabbitMQ");
    }

    if (!channel) {
      throw new Error("Falha ao criar canal no RabbitMQ");
    }

    await assertQueue(channel, queueName);

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

module.exports = { enviarTarefaParaFila, iniciarConsumidor };
