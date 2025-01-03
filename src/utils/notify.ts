import { ElNotification } from "element-plus";
import { Client } from "@stomp/stompjs";
import { ref, onMounted } from "vue";

const stompClient = new Client({
  brokerURL: "/ws-api/ws"
});

stompClient.onConnect = frame => {
  stompClient.subscribe("/topic/info", greeting => {
    console.log("greeting", JSON.parse(greeting.body));
    const data = JSON.parse(greeting.body);
    ElNotification({
      title: data.content.type,
      message: data.content.description,
      type: "warning"
    });
  });
};

stompClient.onWebSocketError = error => {
  // 打印具体的错误信息
  console.error("Broker reported error: " + error);
};

stompClient.onStompError = frame => {
  console.error("Broker reported error: " + frame.headers["message"]);
  console.error("Additional details: " + frame.body);
};

onMounted(() => {
  stompClient.activate();
});
