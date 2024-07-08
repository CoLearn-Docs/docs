---
title: "Broadcast"
---

# Moth 서버를 활용한 비디오 및 오디오 송수신

Moth 서버를 활용하여 비디오와 오디오의 실시간 송수신을 구현하기 위한 가이드입니다. 이 가이드에서는 WebSocket을 통해 바이너리 데이터로 비디오 프레임과 오디오 스트림을 전송하는 방법을 설명합니다. 목표는 높은 해상도의 비디오를 효율적으로 전송하면서 지연 시간을 최소화하는 것입니다. 이 가이드는 세 가지 주요 브로드캐스팅 시나리오를 다룹니다:

1. 비디오만 브로드캐스팅
2. 오디오만 브로드캐스팅
3. 비디오 및 오디오 동시 브로드캐스팅

## 1. 비디오 브로드캐스팅

### 단계 1: 비디오 프레임 준비

웹에서 주로 사용되는 미디어 API를 활용하여 비디오 프레임을 가져옵니다.

- JavaScript와 WebRTC를 사용하여 비디오 스트림을 얻는 예시 코드:

  ```js
  async function getVideoSrcObject() {
    const cameraId = cameraSelect.value; // 사용자가 선택한 카메라의 ID를 가져옴
    const constraints = {
      audio: false, // 오디오 스트림은 필요하지 않음
      video: {
        deviceId: cameraId, // 선택한 카메라를 사용하여 비디오 스트림을 설정
      },
    };

    try {
      // 카메라에서 비디오 스트림을 가져옴
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream; // 비디오 요소에 스트림을 설정하여 화면에 비디오를 출력
      return stream; // 스트림을 반환
    } catch (error) {
      console.error("Error accessing camera:", error); // 카메라 접근 중 오류 발생 시 로그 출력
    }
  }
  ```

### 단계 2: 비디오 코덱을 사용하여 변환 및 압축

높은 해상도의 비디오를 압축하기 위해 적절한 코덱을 선택하고 비디오 프레임을 압축합니다.

- 비디오 코덱을 사용하여 비디오 프레임을 압축하는 코드:

  ```js
  async function encode(
    stream,
    videoEncoderConfig,
    handleChunk,
    keyFrameInterval = 1
  ) {
    const videoTrack = stream.getVideoTracks()[0]; // 스트림에서 비디오 트랙을 가져옴
    const trackProcessor = new MediaStreamTrackProcessor(videoTrack); // 비디오 트랙을 처리하기 위한 프로세서 생성
    const reader = trackProcessor.readable.getReader(); // 비디오 트랙을 읽을 수 있는 리더 생성
    let frameCounter = 0; // 키 프레임 간격을 계산하기 위한 프레임 카운터

    // 비디오 인코더 설정이 지원되는지 확인
    if (!(await VideoEncoder.isConfigSupported(videoEncoderConfig))) {
      console.error("Unsupported video encoder configuration."); // 지원되지 않는 경우 오류 메시지 출력
      return;
    }

    // 비디오 인코더 생성 및 설정
    const videoEncoder = new VideoEncoder({
      output: handleChunk, // 인코딩된 비디오 데이터를 처리할 함수
      error: (err) => {
        console.error("VideoEncoder error:", err); // 인코딩 중 오류 발생 시 로그 출력
      },
    });

    videoEncoder.configure(videoEncoderConfig); // 인코더 설정 구성

    // WebSocket 연결이 열려 있는 동안 반복하여 비디오 프레임을 읽고 인코딩
    while (websocket.OPEN) {
      const { done, value } = await reader.read(); // 비디오 프레임 읽기
      if (done) return; // 모든 프레임을 다 읽은 경우 종료

      frameCounter++; // 프레임 카운터 증가
      videoEncoder.encode(value, {
        keyFrame: frameCounter % keyFrameInterval === 0, // 설정된 간격마다 키 프레임을 생성
      });

      value.close(); // 사용한 비디오 프레임을 닫음
    }
  }
  ```

### 단계 3: 비디오 데이터 Moth 서버로 전송

WebSocket을 사용하여 Moth 서버로 압축된 비디오 데이터를 pub API를 통해 전송합니다.

- WebSocket 연결 및 데이터 전송의 예시:

  ```js
  async function publish() {
    const stream = await getVideoSrcObject(); // 비디오 스트림 가져오기
    const serverURL = useMoth.setServiceURL({
      type: "pub", // 서비스 유형 설정 (pub: publish)
      options: {
        channel: channelSelect.value, // 선택한 채널
        track: "video", // 전송할 트랙 유형 (비디오)
        mode: "single", // 모드 설정
      },
      host: hostInput.value, // 호스트 주소
      port: portInput.value, // 포트 번호
    });

    websocket = new WebSocket(serverURL); // WebSocket 연결 생성
    websocket.binaryType = "arraybuffer"; // 이진 데이터 타입 설정

    const codecs = codecSelect.value; // 선택한 코덱 가져오기
    const codecsValue = videoWebCodecsMap[codecSelect.value]; // 코덱 값 매핑
    const videoWidth = resolutionSelect.value.split("x")[0]; // 선택한 해상도의 가로 값
    const videoHeight = resolutionSelect.value.split("x")[1]; // 선택한 해상도의 세로 값

    websocket.onopen = async function () {
      const mime = `video/${codecs};codecs=${codecsValue};width=${videoWidth};height=${videoHeight};`; // MIME 타입 설정
      websocket.send(mime); // 서버에 MIME 타입 전송

      // 인코딩된 비디오 청크를 처리하는 함수
      function handleVideoChunk(chunk) {
        const chunkData = new Uint8Array(chunk.byteLength);
        chunk.copyTo(chunkData); // 청크 데이터를 Uint8Array로 복사
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(chunkData); // WebSocket을 통해 청크 데이터 전송
        }
      }

      const videoEncoderConfig = {
        codec: codecsValue, // 코덱 설정
        width: videoWidth, // 비디오 가로 해상도
        height: videoHeight, // 비디오 세로 해상도
        bitrate: bitrateInput.value, // 비트레이트 설정
        framerate: framerateInput.value, // 프레임레이트 설정
        bitrateMode: bitrateModeSelect.value, // 비트레이트 모드 설정
        latencyMode: "realtime", // 지연 모드 설정
        avc: { format: "annexb" }, // AVC 포맷 설정
      };

      // 비디오 인코딩 시작
      await encode(
        stream,
        videoEncoderConfig,
        handleVideoChunk,
        keyframeIntervalInput.value
      );
      keepWebSocketAlive(websocket); // WebSocket 연결 유지
    };

    websocket.onclose = function () {
      console.log("websocket closed"); // WebSocket 연결이 닫힐 때 로그 출력
    };
  }
  ```

## 2. 오디오 브로드캐스팅

### 단계 1: 오디오 스트림 가져오기

웹에서 주로 사용되는 미디어 API를 활용하여 오디오 스트림을 가져옵니다.

### 단계 2: 오디오 코덱을 사용하여 변환 및 압축

오디오 스트림을 적절한 코덱을 사용하여 압축합니다.

### 단계 3: 오디오 데이터 Moth 서버로 전송

WebSocket을 사용하여 Moth 서버로 압축된 오디오 데이터를 pub API를 통해 전송합니다.

## 3. 비디오 및 오디오 동시 브로드캐스팅

### 단계 1: 비디오 및 오디오 데이터 분리

비디오와 오디오 데이터를 분리하여 처리합니다.

### 단계 2: 비디오 및 오디오 데이터 압축

비디오와 오디오 데이터를 각각 적절한 코덱을 사용하여 압축합니다.

### 단계 3: 데이터 전송

WebSocket을 사용하여 Moth 서버로 압축된 비디오와 오디오 데이터를 각각의 track을 지정하여 pub API를 통해 전송합니다.

## 비디오 및 오디오 데이터 수신

### 단계 1: WebSocket 연결

Moth 서버와 WebSocket 연결을 설정합니다. Moth 서버에서 제공하는 sub API를 사용하여 데이터를 수신할 수 있는 WebSocket을 만듭니다.

### 단계 2: MIME 데이터 처리

WebSocket 연결 후, 제일 먼저 MIME 데이터가 전송됩니다. 이 데이터에는 해상도, 코덱 정보 등이 포함되어 있습니다. 이 정보를 참고하여 데이터를 디코딩합니다.

### 단계 3: 데이터 디코딩 및 표시

디코딩된 비디오 및 오디오 데이터를 적절한 웹 요소에 표시합니다. 비디오 데이터를 `<video>` 태그나 `<canvas>` 태그를 사용하여 화면에 그립니다. 오디오 데이터는 `<audio>` 태그를 사용하여 재생합니다.

이 가이드를 통해 Moth 서버를 사용하여 비디오 및 오디오의 실시간 송수신을 구현하는 데 필요한 단계를 이해하고, 원하는 방식에 따라 브로드캐스팅을 설정할 수 있을 것입니다. 이를 통해 높은 품질의 미디어 스트리밍을 구현하고 원하는 목표를 달성할 수 있을 것입니다.
