// 우리 컴퓨터에 실행되고 있는 mongo db에 연결하는 게 첫번째.
// mongo 명렁어를 실행해서 database가 실행되고 있는 url을 받을 것.
// => mongodb://127.0.0.1:27017/
// mongodb에 새로운 db 만들기는 간단하다. 위 url 뒤에 database 이름을 적어주면 된다. => 여가서는 wetube.
// 이 파일을 서버에서 사용하게 하려면, server.js에 가서 파일 자체를 import 해주자.
import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;

// on vs once
// => 전자는 매 이벤트 발생때마다. 후자는 한번만.
db.on("error", (error) => console.log(`DB Error: ${error}`));
db.once("open", () => console.log("Connected to DB!"));
