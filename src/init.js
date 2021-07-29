// 이 파일은 필요한 모든 것들을 import 시키는 역할.
import "dotenv/config";
import "./db";
import "./models/Video"; //preload 과정. 이렇게 하는 이유는, 이렇게 model을 미리
// complie, 또는 create해야 우리가 필요할 때 해당 model을 사용할 수 있어서다.
import "./models/User";
import app from "./server"; //server는 app과 관련된 config작업을 하는 용도로 분리.

const PORT = 4000;

const listeningServer = () =>
  console.log(`Success listening at http://localhost:${PORT}`);

app.listen(PORT, listeningServer);
