import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { async } from "regenerator-runtime";

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = async () => {
  // 1단계. ffmpeg 인스턴스 만들고 로드하기
  const ffmpeg = createFFmpeg({ log: true }); // log => 콘솔에서 무슨 일이 벌어지고 있는지 확인가능.
  await ffmpeg.load(); // 사용자가 ff 소프트 웨어를 사용함. 사용자가 js가 아닌 코드를 사용하는 것. 무언가를 설치해서. 우리 웹사이트에서 다른 소프트웨어를 사용하는 것. 소프트웨어가 무거울 수 있기 때문에 await 해줘야함. 유저의 컴퓨터 사용.

  // 우리가 브라우저 안에 있다는 생각을 멈춰야한다.
  // 눈을 감고 폴더와 파일로 가득찬 컴퓨터 안에 있다고 상상.
  // 웹 어셈블리를 사용하고 있기 때문에. 우린 지금 폴더와 파일이 있는 가상의 컴퓨터를 브라우저에서 실행하는 신이 된 것.
  // 이 말을 하는 이유. ffmpeg의 세계에서 파일을 생성해야하기 때문.

  // 2단계. ffmpeg에 파일 만들기
  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile)); // FS: File System

  // 3단계. 우리가 원하는 명령어 입력
  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");

  // 이제 가상 파일 시스템에 output.mp4 라는 파일이 있다.

  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "MyRecording.webm";
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
