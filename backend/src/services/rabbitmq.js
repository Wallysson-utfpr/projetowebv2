const amqp = require("amqplib");

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

module.exports = { enviarTarefaParaFila };
