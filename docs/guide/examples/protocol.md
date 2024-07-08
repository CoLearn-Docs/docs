---
title: 'Protocol'
---

# Moth 서버 커스텀 프로토콜

Moth 서버를 사용하여 로봇과 통신하기 위한 커스텀 프로토콜은 주로 직접(Bluetooth) 통신과 원격(Remote) 통신 두 가지 유형으로 나눌 수 있습니다. 각 유형에 대한 프로토콜은 다음과 같습니다.

## 1. 직접(Bluetooth) 통신 프로토콜

Bluetooth 통신을 사용하여 로봇과 데이터를 교환하는 프로토콜은 최대 전송 길이에 대한 고려와 메시지 분할이 필요합니다. 아래에 Bluetooth 통신을 위한 Moth 커스텀 프로토콜에 대한 설명이 포함되어 있습니다.

### 1.1 프로토콜 요약

Moth Bluetooth 프로토콜은 메시지 분할 및 재조립을 위한 메시지 헤더와 실제 데이터 메시지로 구성됩니다.

- 메시지 헤더: 메시지의 길이와 분할된 메시지의 인덱스를 포함하는 메시지 헤더가 사용됩니다.
- 메시지 데이터: 실제 메시지 데이터가 여러 청크로 나누어질 수 있으며, 각 청크에는 페이로드 데이터가 포함됩니다.

### 1.2 프로토콜 설명

아래는 Bluetooth 통신을 통해 Moth 서버로 메시지를 보내는 JavaScript 함수의 예시 코드입니다.

```js
export async function sendMessageToDeviceOverBluetooth(
  message: string,
  device: BluetoothDevice,
  maxTransferSize: number = 15
) {
  const MAX_MESSAGE_LENGTH = maxTransferSize
  const messageArray: string[] = []

  // Split message into smaller chunks
  while (message.length > 0) {
    const chunk = message.slice(0, MAX_MESSAGE_LENGTH)
    message = message.slice(MAX_MESSAGE_LENGTH)
    messageArray.push(chunk)
  }

  if (messageArray.length > 1) {
    messageArray[0] = `${messageArray[0]}#${messageArray.length}$`
    for (let i = 1; i < messageArray.length; i++) {
      messageArray[i] = `${messageArray[i]}$`
    }
  }

  // ... (Bluetooth GATT 연결 및 데이터 전송 코드)
}
```

위의 코드는 Bluetooth 통신을 위한 Moth 프로토콜을 사용하여 메시지를 로봇으로 전송하는 예시입니다. 메시지는 최대 전송 크기로 나누어지며, 메시지 헤더와 실제 데이터로 구성됩니다.

## 2. 원격(Remote) 통신 프로토콜

Remote 통신을 사용하여 로봇 컨트롤 명령과 메트릭 데이터를 교환하는 프로토콜은 다양한 컨트롤 명령과 메트릭 데이터를 전달하는 데 사용됩니다. 아래에는 Remote 통신을 위한 Moth 커스텀 프로토콜에 대한 설명이 포함되어 있습니다.

### 1. 프로토콜 요약

Moth Remote 통신 프로토콜은 ControlCommand와 MetricCommand 두 가지 주요 타입의 명령을 사용합니다.

- `ControlCommand` : 로봇 컨트롤을 위한 명령을 포함하며, type: "control"로 표시됩니다. 이 명령에는 방향, 속도, 서보 위치, 액션, 포즈 등의 속성이 포함됩니다.
- `MetricCommand` : 메트릭 데이터를 포함하며, type: "metric"으로 표시됩니다. 이 명령에는 시간, 데이터 등의 속성이 포함됩니다.

### 2. 프로토콜 설명

Moth Remote 프로토콜은 컨트롤 명령과 메트릭 데이터를 원격 로봇에 전달하는 데 사용됩니다. 아래는 두 가지 주요 타입의 명령에 대한 설명과 예시 코드입니다.

- `ControlCommand` 명령 예시:

  ```json
  {
    "type": "control",
    "timestamp": 1634567890,
    "direction": "N",
    "speed": 0.8,
    "servo": 90,
    "action": "move_forward",
    "pose": "standing"
  }
  ```

- `MetricCommand` 명령 예시:

  ```json
  {
    "type": "metric",
    "timestamp": 1634567900,
    "data": {
      "temperature": 25.5,
      "humidity": 50
    }
  }
  ```

위의 예시에서, ControlCommand는 로봇 컨트롤을 위한 명령을 나타내며 MetricCommand는 메트릭 데이터를 나타냅니다. 각 명령은 해당하는 타입과 관련된 속성을 포함하고 있으며, 로봇 컨트롤이나 메트릭 수집을 위해 Moth 서버와 로봇 간에 사용됩니다.
