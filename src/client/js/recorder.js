import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { async } from "regenerator-runtime";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileName, fileUrl) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.textContent = "Transcoding...";
  actionBtn.disabled = true;
  // 1단계. ffmpeg 인스턴스 만들고 로드하기
  const ffmpeg = createFFmpeg({
    log: true,
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  }); // log => 콘솔에서 무슨 일이 벌어지고 있는지 확인가능.
  await ffmpeg.load(); // 사용자가 ff 소프트 웨어를 사용함. 사용자가 js가 아닌 코드를 사용하는 것. 무언가를 설치해서. 우리 웹사이트에서 다른 소프트웨어를 사용하는 것. 소프트웨어가 무거울 수 있기 때문에 await 해줘야함. 유저의 컴퓨터 사용.

  // 우리가 브라우저 안에 있다는 생각을 멈춰야한다.
  // 눈을 감고 폴더와 파일로 가득찬 컴퓨터 안에 있다고 상상.
  // 웹 어셈블리를 사용하고 있기 때문에. 우린 지금 폴더와 파일이 있는 가상의 컴퓨터를 브라우저에서 실행하는 신이 된 것.
  // 이 말을 하는 이유. ffmpeg의 세계에서 파일을 생성해야하기 때문.

  // 2단계. ffmpeg에 파일 만들기
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile)); // FS: File System

  // 3단계. 우리가 원하는 명령어 입력
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  // 이제 가상 파일 시스템에 output.mp4 라는 파일이 있다.

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output); // 파일 불러오기
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob); // 브라우저에서 파일을 가르키는 마법의 url을 만들어줌.
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile("MyRecording.mp4", mp4Url);

  downloadFile("MyThumbnail.jpg", thumbUrl);

  // 가상 파일시스템에서 파일 제거
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  // url 제거
  URL.revokeObjectURL(mp4Url); // 해당 url 객체를 메모리에서 지움
  URL.revokeObjectURL(thumbUrl); // 해당 url 객체를 메모리에서 지움
  URL.revokeObjectURL(videoFile); // 해당 url 객체를 메모리에서 지움

  actionBtn.textContent = "Start Recording";
  actionBtn.disabled = false;
  init();
  actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
  setTimeout(() => {
    handleStop();
  }, 5000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener("click", handleStart);
