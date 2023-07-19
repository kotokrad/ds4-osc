import * as ds from "dualshock";
import { Bundle, Client, Server } from "node-osc";
import * as dotenv from "dotenv";
import type { Device, LedState, RumbleState } from "dualshock";
import { sleep } from "./util";

dotenv.config();

const CLIENT_HOST = process.env.CLIENT_HOST || "127.0.0.1";
const CLIENT_PORT = Number(process.env.CLIENT_PORT) || 12000;

const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = Number(process.env.SERVER_PORT) || 9000;

async function getDevice(): Promise<Device> {
  const devices = ds.getDevices();
  if (devices[0]) {
    console.log(
      `Found device: ${devices[0].product} [${devices[0].serialNumber}]`,
    );
    return devices[0];
  } else {
    console.log("Device not found. Retrying...");
    await sleep(2000);
    return getDevice();
  }
}

const device = await getDevice();
const gamepad = ds.open(device);

console.log(`Battery: ${(gamepad.map.status.battery / 16) * 100}% (probably)`);

const client = new Client(CLIENT_HOST, CLIENT_PORT);
const server = new Server(SERVER_PORT, SERVER_HOST, () => {
  console.log(`OSC Server is listening on ${SERVER_HOST}:${SERVER_PORT}`);
});

console.log(`OSC Client: ${CLIENT_HOST}:${CLIENT_PORT}`);

const updateHandler = () => {
  const bundle = new Bundle();

  // Touchpad (touch 1)
  if (gamepad.digital.t1) {
    bundle.append(["/ds4/touchpad/touch1/active", true]);
    bundle.append([
      "/ds4/touchpad/touch1/position",
      gamepad.analog.t1X,
      gamepad.analog.t1Y,
    ]);
  } else {
    bundle.append(["/ds4/touchpad/touch1/active", false]);
  }

  // Touchpad (touch 2)
  if (gamepad.digital.t2) {
    bundle.append(["/ds4/touchpad/touch2/active", true]);
    bundle.append([
      "/ds4/touchpad/touch2/position",
      gamepad.analog.t2X,
      gamepad.analog.t2Y,
    ]);
  } else {
    bundle.append(["/ds4/touchpad/touch2/active", false]);
  }

  // Motion
  bundle.append(["/ds4/motion/x", gamepad.motion.accelX]);
  bundle.append(["/ds4/motion/y", gamepad.motion.accelY]);
  bundle.append(["/ds4/motion/z", gamepad.motion.accelZ]);
  bundle.append(["/ds4/motion/pitch", gamepad.motion.gyroPitch]);
  bundle.append(["/ds4/motion/yaw", gamepad.motion.gyroYaw]);
  bundle.append(["/ds4/motion/roll", gamepad.motion.gyroRoll]);

  // Send OSC message
  client.send(bundle);
};

gamepad.onmotion = true;
gamepad.onstatus = true;
gamepad.onupdate = updateHandler;

// OSC Server
server.on("message", (message) => {
  const [path, ...values] = message;
  console.log("👾", "message =>", message);

  // RGB 0-1
  if (path === "/ds4/color" && values.length === 3) {
    const state = values.map((value) =>
      Math.round(Number(value) * 255),
    ) as LedState;
    gamepad.setLed(...state);
    return;
  }

  // Left, Right 0-255
  if (path === "/ds4/rumble" && values.length === 2) {
    const state = values as RumbleState;
    gamepad.rumble(...state);
    return;
  }
});
